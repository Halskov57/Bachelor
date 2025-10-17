import React, { useEffect, useState, useMemo } from 'react';
import ProjectTreeView from '../components/ProjectTreeView';
import ProjectListView from '../components/ProjectListView';

function toTreeData(project: any) {
  if (!project || !(project.title || project.name)) return null;
  return {
    id: project.projectId || project.id,
    name: String(project.title || project.name),
    type: 'project',
    description: project.description,
    projectId: project.projectId || project.id, // <-- add this
    children: (project.epics || []).map((epic: any) => ({
      id: epic.epicId || epic.id,
      name: String(epic.title),
      type: 'epic',
      description: epic.description,
      projectId: project.projectId || project.id, // <-- add this
      epicId: epic.epicId || epic.id,             // <-- add this
      children: (epic.features || []).map((feature: any) => ({
        id: feature.featureId || feature.id,
        name: String(feature.title),
        type: 'feature',
        description: feature.description,
        projectId: project.projectId || project.id, // <-- add this
        epicId: epic.epicId || epic.id,             // <-- add this
        featureId: feature.featureId || feature.id, // <-- add this
        children: (feature.tasks || []).map((task: any) => ({
          id: task.taskId || task.id,
          name: String(task.title),
          type: 'task',
          description: task.description,
          depth: task.depth,
          users: task.users,
          status: task.status,
          projectId: project.projectId || project.id,   // <-- add this
          epicId: epic.epicId || epic.id,               // <-- add this
          featureId: feature.featureId || feature.id,   // <-- add this
          taskId: task.taskId || task.id,               // <-- add this
        })),
      })),
    })),
  };
}

const Project: React.FC = () => {
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');

  const fetchProjectById = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    
    const token = localStorage.getItem('token');
    const query = `
      query($id: ID!) {
        projectById(id: $id) {
          id
          title
          description
          owners {
            id
            username
          }
          epics {
            id
            title
            description
            features {
              id
              title
              description
              tasks {
                id
                title
                description
                status
                users {
                  id
                  username
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:8081/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables: { id } })
    });
    
    const result = await response.json();
    if (result.data?.projectById) {
      setProject(result.data.projectById);
    }
  };

  useEffect(() => {
    fetchProjectById();
  }, []);

  const treeData = useMemo(() => {
    const tree = toTreeData(project);
    return tree ? [tree] : [];
  }, [project]);

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (!project) return <div>Loading...</div>;

  return (
    <>
      {/* Top navigation bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#022AFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <button
          onClick={handleBackToDashboard}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Dashboard
        </button>

        <h2 style={{
          color: '#fff',
          margin: 0,
          fontWeight: 700
        }}>
          {project.title || project.name}
        </h2>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      </div>

      {/* Add top margin to account for fixed header */}
      <div style={{ marginTop: '80px' }}>
        <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(230,230,240,0.96)',
          padding: '16px 0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(2,42,255,0.08)',
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <button
          onClick={() => setView('list')}
          style={{
            marginRight: '12px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: view === 'list' ? '2px solid #022AFF' : '1px solid #aaa',
            background: view === 'list' ? '#022AFF' : '#fff',
            color: view === 'list' ? '#fff' : '#022AFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          List View
        </button>
        <button
          onClick={() => setView('tree')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: view === 'tree' ? '2px solid #022AFF' : '1px solid #aaa',
            background: view === 'tree' ? '#022AFF' : '#fff',
            color: view === 'tree' ? '#fff' : '#022AFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Tree View
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '10px', position: 'relative', zIndex: 2 }}>
        {view === 'list' ? (
          <ProjectListView project={project} fetchProjectById={fetchProjectById} />
        ) : (
          <ProjectTreeView
            key={project.id || project._id || project.title}
            treeData={treeData}
            project={project}
            fetchProjectById={fetchProjectById}
          />
        )}
      </div>
      </div> {/* Close the marginTop div */}
    </>
  );
};

export default Project;