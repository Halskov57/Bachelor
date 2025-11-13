import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectTreeView, ProjectListView, UserTaskTable } from '../components/ProjectViews';
import { isAdmin } from '../utils/jwt';
import { NodeData } from '../utils/types';
import { getGraphQLUrl } from '../config/environment';
import { sseService, SSEEvent } from '../utils/sseService';

const Project: React.FC = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree' | 'users'>('list');
  const [realtimeUpdates, setRealtimeUpdates] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Real-time notification helper with debouncing to prevent duplicate notifications
  const addRealtimeNotification = useCallback((message: string, debounceKey?: string) => {
    // If a debounce key is provided, use it to prevent duplicate notifications
    if (debounceKey) {
      // Clear any existing timeout for this key
      const existingTimeout = pendingNotifications.get(debounceKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set a new timeout to show the notification after 500ms
      const timeout = setTimeout(() => {
        setRealtimeUpdates(prev => [...prev.slice(-4), message]); // Keep last 5 notifications
        setTimeout(() => {
          setRealtimeUpdates(prev => prev.slice(1));
        }, 5000);
        pendingNotifications.delete(debounceKey);
      }, 500);
      
      setPendingNotifications(prev => new Map(prev).set(debounceKey, timeout));
    } else {
      // No debouncing, show immediately
      setRealtimeUpdates(prev => [...prev.slice(-4), message]); // Keep last 5 notifications
      setTimeout(() => {
        setRealtimeUpdates(prev => prev.slice(1));
      }, 5000);
    }
  }, [pendingNotifications]);

  const fetchProjectById = useCallback(async () => {
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
                  dueDate
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
      // Check for authorization errors
      if (result.errors) {
        const authError = result.errors.find((error: any) => {
          return error.message?.includes('Access denied') || 
                 error.message?.includes('not authorized') ||
                 error.message?.includes('Unauthorized');
        });
        if (authError) {
          // Clear everything and redirect
          setProject(null);
          setProjectId(null);
          localStorage.removeItem('token');
          // Use both navigation methods to ensure redirect
          navigate('/login', { replace: true });
          window.location.href = '/login';
          return;
        }
        
        // Handle other errors
      }
      
      if (result.data?.projectById) {
        setProject(result.data.projectById);
      } else if (!result.errors) {
        // Project not found or other issue
        localStorage.removeItem('token');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // On any error, redirect to login
      setProject(null);
      setProjectId(null);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
      window.location.href = '/login';
    }
  }, [navigate, setProject, setProjectId]);

  // Listen for backend reconnection events
  useEffect(() => {
    const handleReconnection = () => {
      fetchProjectById();
    };

    window.addEventListener('backend-reconnected', handleReconnection);
    
    return () => {
      window.removeEventListener('backend-reconnected', handleReconnection);
    };
  }, [fetchProjectById]);

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

          addRealtimeNotification(`Task updated`, `task-${data.id}`);
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

          addRealtimeNotification(`Task created`);
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

          addRealtimeNotification(`User assigned to task`);
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

          addRealtimeNotification(`Epic updated`, `epic-${data.id}`);
          break;

        case 'epicCreated':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: [...(prevProject.epics || []), data]
            };
          });

          addRealtimeNotification(`Epic created`);
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

          addRealtimeNotification(`Feature updated`, `feature-${data.id}`);
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

          addRealtimeNotification(`Feature created`);
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

          addRealtimeNotification(`Project updated`, `project-${projectId}`);
          break;

        default:
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
  }, [fetchProjectById]); // Include fetchProjectById dependency

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
          users: task.users, // Include full user objects for display
        } as any)),
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
    <div style={{ 
      minHeight: '100vh', 
      overflow: 'visible',
      paddingBottom: '40px'
    }}>
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
      <div style={{ 
        marginTop: '80px', 
        paddingBottom: '40px',
        minHeight: 'calc(100vh - 80px)'
      }}>
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
          maxWidth: 600,
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
            marginRight: '12px',
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
        <button
          onClick={() => setView('users')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: view === 'users' ? '2px solid #022AFF' : '1px solid #aaa',
            background: view === 'users' ? '#022AFF' : '#fff',
            color: view === 'users' ? '#fff' : '#022AFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Task Distribution
        </button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '10px', position: 'relative', zIndex: 2, overflow: 'visible' }}>
        {view === 'list' ? (
          <ProjectListView project={project} fetchProjectById={fetchProjectById} />
        ) : view === 'tree' ? (
          <ProjectTreeView
            key={project.id || project._id || project.title}
            treeData={treeData}
            project={project}
            fetchProjectById={fetchProjectById}
          />
        ) : (
          <UserTaskTable project={project} />
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
    </div>
  );
};

export default Project;