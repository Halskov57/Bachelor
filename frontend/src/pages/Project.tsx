import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectTreeView from '../components/ProjectTreeView';
import ProjectListView from '../components/ProjectListView';
import { isAdmin } from '../utils/jwt';
import { NodeData } from '../utils/types';
import { getGraphQLUrl } from '../config/environment';
import { sseService, SSEEvent } from '../utils/sseService';

const Project: React.FC = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [realtimeUpdates, setRealtimeUpdates] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Real-time notification helper
  const addRealtimeNotification = useCallback((message: string) => {
    setRealtimeUpdates(prev => [...prev.slice(-4), message]); // Keep last 5 notifications
    setTimeout(() => {
      setRealtimeUpdates(prev => prev.slice(1));
    }, 5000);
  }, []);


  const fetchProjectById = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) return;
      
      setProjectId(id); // Store project ID for subscriptions
      
      const token = localStorage.getItem('token');
      const query = `
        query($id: ID!) {
          projectById(id: $id) {
            id
            title
            description
            courseLevel
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
      
      const response = await fetch(getGraphQLUrl(), {  // <-- CHANGE THIS LINE
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables: { id } })
      });
      
      const result = await response.json();
      
      console.log('🔍 Full GraphQL result:', result);
      
      // Check for authorization errors
      if (result.errors) {
        console.log('🔍 Errors found:', result.errors);
        
        const authError = result.errors.find((error: any) => {
          console.log('🔍 Checking error message:', error.message);
          return error.message?.includes('Access denied') || 
                 error.message?.includes('not authorized') ||
                 error.message?.includes('Unauthorized');
        });
        
        console.log('🔍 Auth error found?', authError);
        
        if (authError) {
          console.error('❌ Authorization error:', authError.message);
          console.log('🔄 Redirecting to login...');
          // Clear everything and redirect
          setProject(null);
          setProjectId(null);
          localStorage.removeItem('token');
          // Use both navigation methods to ensure redirect
          navigate('/', { replace: true });
          window.location.href = '/';
          return;
        }
        
        // Handle other errors
        console.error('GraphQL errors:', result.errors);
      }
      
      if (result.data?.projectById) {
        setProject(result.data.projectById);
        console.log('📊 Project loaded:', result.data.projectById.title);
      } else if (!result.errors) {
        // Project not found or other issue
        console.error('Project not found');
        localStorage.removeItem('token');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('❌ Error fetching project:', error);
      // On any error, redirect to login
      setProject(null);
      setProjectId(null);
      localStorage.removeItem('token');
      navigate('/', { replace: true });
      window.location.href = '/';
    }
  };

  // Real-time updates using Server-Sent Events (SSE)
  useEffect(() => {
    if (!projectId) return;

    const handleSSEEvent = (event: SSEEvent) => {
      const { type, data } = event;

      switch (type) {
        case 'taskUpdate':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            const updateTaskInEpics = (epics: any[]): any[] => {
              return epics.map(epic => ({
                ...epic,
                features: (epic.features || []).map((feature: any) => ({
                  ...feature,
                  tasks: (feature.tasks || []).map((task: any) =>
                    task.id === data.id ? { ...task, ...data } : task
                  )
                }))
              }));
            };

            return {
              ...prevProject,
              epics: updateTaskInEpics(prevProject.epics || [])
            };
          });

          addRealtimeNotification(`📝 Task "${data.title}" updated`);
          console.log('🔄 Real-time task update:', data);
          break;

        case 'taskCreated':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            const addTaskToFeature = (epics: any[]): any[] => {
              return epics.map(epic => ({
                ...epic,
                features: (epic.features || []).map((feature: any) =>
                  feature.id === data.featureId
                    ? { ...feature, tasks: [...(feature.tasks || []), data] }
                    : feature
                )
              }));
            };

            return {
              ...prevProject,
              epics: addTaskToFeature(prevProject.epics || [])
            };
          });

          addRealtimeNotification(`✨ New task "${data.title}" created`);
          console.log('🔄 Real-time task created:', data);
          break;

        case 'taskUserAssigned':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            const updateTaskUsers = (epics: any[]): any[] => {
              return epics.map(epic => ({
                ...epic,
                features: (epic.features || []).map((feature: any) => ({
                  ...feature,
                  tasks: (feature.tasks || []).map((task: any) =>
                    task.id === data.id
                      ? { ...task, users: data.users }
                      : task
                  )
                }))
              }));
            };

            return {
              ...prevProject,
              epics: updateTaskUsers(prevProject.epics || [])
            };
          });

          addRealtimeNotification(`👤 User assigned to task`);
          console.log('🔄 Real-time user assigned:', data);
          break;

        case 'epicUpdate':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: (prevProject.epics || []).map((epic: any) =>
                epic.id === data.id ? { ...epic, ...data } : epic
              )
            };
          });

          addRealtimeNotification(`🎯 Epic "${data.title}" updated`);
          console.log('🔄 Real-time epic update:', data);
          break;

        case 'epicCreated':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: [...(prevProject.epics || []), data]
            };
          });

          addRealtimeNotification(`🎯 New epic "${data.title}" created`);
          console.log('🔄 Real-time epic created:', data);
          break;

        case 'featureUpdate':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: (prevProject.epics || []).map((epic: any) => ({
                ...epic,
                features: (epic.features || []).map((feature: any) =>
                  feature.id === data.id ? { ...feature, ...data } : feature
                )
              }))
            };
          });

          addRealtimeNotification(`⚡ Feature "${data.title}" updated`);
          console.log('🔄 Real-time feature update:', data);
          break;

        case 'featureCreated':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: (prevProject.epics || []).map((epic: any) =>
                epic.id === data.epicId
                  ? { ...epic, features: [...(epic.features || []), data] }
                  : epic
              )
            };
          });

          addRealtimeNotification(`⚡ New feature "${data.title}" created`);
          console.log('🔄 Real-time feature created:', data);
          break;

        case 'projectUpdate':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;
            // Merge the update, preserving existing structure
            return { 
              ...prevProject,
              ...data,
              // Ensure we keep the existing epics if not provided in update
              epics: data.epics || prevProject.epics,
              // Ensure we keep the existing owners if not provided in update
              owners: data.owners || prevProject.owners
            };
          });

          const updateMessage = data.title ? `🚀 Project "${data.title}" updated` : '🚀 Project updated';
          addRealtimeNotification(updateMessage);
          console.log('🔄 Real-time project update:', data);
          break;

        default:
          console.log('🔄 Unhandled SSE event type:', type, data);
          break;
      }
    };

    // Subscribe to SSE events for this project
    sseService.subscribeToProject(projectId, handleSSEEvent);

    return () => {
      // Unsubscribe when component unmounts
      sseService.unsubscribeFromProject(projectId, handleSSEEvent);
    };
  }, [projectId, addRealtimeNotification]);

  useEffect(() => {
    fetchProjectById();
  }, []);

function toTreeData(project: any): NodeData | null {
  if (!project || !(project.title || project.name)) return null;

  return {
    id: project.id,
    title: project.title || project.name,
    description: project.description,
    courseLevel: project.courseLevel,
    type: 'project',
    projectId: project.id,
    children: (project.epics || []).map((epic: any): NodeData => ({
      id: epic.id,
      title: epic.title,
      description: epic.description,
      type: 'epic',
      projectId: project.id,
      epicId: epic.id,
      children: (epic.features || []).map((feature: any): NodeData => ({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        type: 'feature',
        projectId: project.id,
        epicId: epic.id,
        featureId: feature.id,
        children: (feature.tasks || []).map((task: any): NodeData => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          userIds: task.users?.map((u: any) => u.id || u.username),
          type: 'task',
          projectId: project.id,
          epicId: epic.id,
          featureId: feature.id,
        })),
      })),
    })),
  };
}



  const treeData = useMemo(() => {
    const tree = toTreeData(project);
    return tree ? [tree] : [];
  }, [project]);

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleAdminPage = () => {
    window.location.href = '/admin';
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
        <div style={{ display: 'flex', gap: '12px' }}>
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

          {isAdmin() && (
            <button
              onClick={handleAdminPage}
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
              ⚙️ Admin
            </button>
          )}
        </div>

        <h2 style={{
          color: '#ffffffff',
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

      {/* Real-time notifications */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        {realtimeUpdates.map((update, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontSize: '14px',
              opacity: 0.9,
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            🔔 {update}
          </div>
        ))}
      </div>

      {/* Connection status indicator */}
      {projectId && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#e8f5e8',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          color: '#2e7d32'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#4caf50', 
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          Real-time enabled
        </div>
      )}

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

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 0.9;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default Project;