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

// Example for toTreeData
// children: (project.epics || []).map((epic: any) => ({
//   name: String(epic.title),
//   type: 'epic',
//   children: (epic.features || []).map((feature: any) => ({
//     name: String(feature.title),
//     type: 'feature',
//     // tasks are missing here!
// })),
    // Do NOT include children for tasks!
  // })),
  // })),

const Project: React.FC = () => {
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8081/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProject(data));
  }, []);

  const treeData = useMemo(() => {
    const tree = toTreeData(project);
    return tree ? [tree] : [];
  }, [project]);

  if (!project) return <div>Loading...</div>;

  return (
    <>
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
      <h1 style={{
        textAlign: 'center',
        marginTop: '40px',
        color: '#022AFF',
        fontWeight: 800,
        fontSize: '2.5rem',
        zIndex: 2,
        position: 'relative'
      }}>
        {project.title || project.name}
      </h1>
      <div style={{ textAlign: 'center', marginTop: '10px', position: 'relative', zIndex: 2 }}>
        {view === 'list' ? (
          <ProjectListView project={project} fetchProjectById={() => {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (!id) return;
            const token = localStorage.getItem('token');
            fetch(`http://localhost:8081/projects/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(res => res.json())
              .then(data => setProject(data));
          }} />
        ) : (
          <ProjectTreeView
            key={project.id || project._id || project.title}
            treeData={treeData}
            fetchProjectById={() => {
              const params = new URLSearchParams(window.location.search);
              const id = params.get('id');
              if (!id) return;
              const token = localStorage.getItem('token');
              fetch(`http://localhost:8081/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
                .then(res => res.json())
                .then(data => setProject(data));
            }}
          />
        )}
      </div>
    </>
  );
};

export default Project;