import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ProjectTreeView, ProjectListView, UserTaskTable } from '../components/ProjectViews';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { NodeData } from '../utils/types';
import { getGraphQLUrl } from '../config/environment';
import { sseService, SSEEvent } from '../utils/sseService';

const Project: React.FC = () => {
  const location = useLocation();
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree' | 'users'>('list');
  const [realtimeUpdates, setRealtimeUpdates] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pendingNotifications, setPendingNotifications] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Real-time notification helper with debouncing to prevent duplicate notifications
  const addRealtimeNotification = useCallback((message: string, debounceKey?: string) => {
    if (debounceKey) {
      // Clear any existing timeout for this key
      const existingTimeout = pendingNotifications.get(debounceKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set a new timeout to show the notification after 500ms
      const timeout = setTimeout(() => {
        setRealtimeUpdates(prev => [...prev.slice(-4), message]);
        setTimeout(() => {
          setRealtimeUpdates(prev => prev.slice(1));
        }, 5000);
        pendingNotifications.delete(debounceKey);
      }, 500);
      
      setPendingNotifications(prev => new Map(prev).set(debounceKey, timeout));
    } else {
      setRealtimeUpdates(prev => [...prev.slice(-4), message]);
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
      
      setProjectId(id);
      
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
      
      const response = await fetch(getGraphQLUrl(), {
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
        window.location.href = '/dashboard';
      }
    } catch (error) {
      // On any error, redirect to login
      setProject(null);
      setProjectId(null);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }, [setProject, setProjectId]);

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

        case 'taskDeleted':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            const removeTaskFromFeature = (epics: any[]): any[] => {
              return epics.map(epic => ({
                ...epic,
                features: (epic.features || []).map((feature: any) => ({
                  ...feature,
                  tasks: (feature.tasks || []).filter((task: any) => task.id !== data.taskId)
                }))
              }));
            };

            return {
              ...prevProject,
              epics: removeTaskFromFeature(prevProject.epics || [])
            };
          });

          addRealtimeNotification(`Task deleted`);
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

        case 'epicDeleted':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: (prevProject.epics || []).filter((epic: any) => epic.id !== data.epicId)
            };
          });

          addRealtimeNotification(`Epic deleted`);
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

        case 'featureDeleted':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;

            return {
              ...prevProject,
              epics: (prevProject.epics || []).map((epic: any) => ({
                ...epic,
                features: (epic.features || []).filter((feature: any) => feature.id !== data.featureId)
              }))
            };
          });

          addRealtimeNotification(`Feature deleted`);
          break;

        case 'projectUpdate':
          setProject((prevProject: any) => {
            if (!prevProject) return prevProject;
            return { 
              ...prevProject,
              ...data,
              epics: data.epics || prevProject.epics,
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
  }, [fetchProjectById, location.search]);

function toTreeData(project: any): NodeData | null {
  if (!project || !(project.title || project.name)) return null;

  return {
    id: project.id,
    title: project.title || project.name,
    description: project.description,
    courseLevel: project.courseLevel,
    type: 'project',
    projectId: project.id,
    users: project.owners || [],
    owners: project.owners || [],
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
          users: task.users,
          dueDate: task.dueDate,
        } as any)),
      })),
    })),
  };
}

  const treeData = useMemo(() => {
    const tree = toTreeData(project);
    return tree ? [tree] : [];
  }, [project]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="space-y-3">
      {/* Project title header with real-time status */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{project.title || project.name}</h1>
        {projectId && (
          <div className="flex items-center gap-1.5 bg-green-50 px-2 py-0.5 rounded-full text-xs text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time
          </div>
        )}
      </div>

      {/* Real-time notifications */}
      <div className="fixed top-20 right-5 z-[1000] flex flex-col gap-2 pointer-events-none">
        {realtimeUpdates.map((update, index) => (
          <div
            key={index}
            className="bg-green-500 text-white px-4 py-2 rounded shadow-lg text-sm opacity-90 animate-in slide-in-from-right"
          >
            🔔 {update}
          </div>
        ))}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'tree' | 'users')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-sidebar/50">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="tree">Tree View</TabsTrigger>
          <TabsTrigger value="users">Task Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-3">
          <ProjectListView project={project} fetchProjectById={fetchProjectById} />
        </TabsContent>

        <TabsContent value="tree" className="mt-3">
          <ProjectTreeView
            key={project.id || project._id || project.title}
            treeData={treeData}
            project={project}
            fetchProjectById={fetchProjectById}
          />
        </TabsContent>

        <TabsContent value="users" className="mt-3">
          <UserTaskTable project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Project;