import React, { useState, useMemo, useEffect, useRef } from 'react';
import EditFanout from './EditFanout';

type FilterCategory = 'none' | 'status' | 'username';

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void }> = ({ project, fetchProjectById }) => {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<any>(null);
  const [createNode, setCreateNode] = useState<{
    type: string;
    parentIds: any;
    parentNode?: any;
  } | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('none');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  // Collect all tasks from the entire project with their context
  const getAllTasksWithContext = () => {
    const allTasks: any[] = [];
    
    if (!project.epics) return allTasks;

    project.epics.forEach((epic: any) => {
      if (epic.features) {
        epic.features.forEach((feature: any) => {
          if (feature.tasks) {
            feature.tasks.forEach((task: any) => {
              allTasks.push({
                ...task,
                epicTitle: epic.title,
                featureTitle: feature.title,
                epicId: epic.epicId || epic.id,
                featureId: feature.featureId || feature.id,
                projectId: project.projectId || project.id
              });
            });
          }
        });
      }
    });

    return allTasks;
  };

  // Get unique statuses from all tasks
  const availableStatuses = useMemo(() => {
    const allTasks: any[] = [];
    
    if (!project.epics) return [];

    project.epics.forEach((epic: any) => {
      if (epic.features) {
        epic.features.forEach((feature: any) => {
          if (feature.tasks) {
            feature.tasks.forEach((task: any) => {
              allTasks.push(task);
            });
          }
        });
      }
    });

    const statuses = new Set<string>();
    allTasks.forEach(task => {
      if (task.status) statuses.add(task.status);
    });
    return Array.from(statuses).sort();
  }, [project]);

  // Get unique usernames from project owners
  const availableUsernames = useMemo(() => {
    if (!project.owners || !Array.isArray(project.owners)) return [];

    const usernames = project.owners
      .map((owner: any) => owner.username || owner.name)
      .filter((username: string) => username) // Remove any undefined/null values
      .sort();

    return usernames;
  }, [project]);

  // Filter tasks based on selected criteria
  const getFilteredTasks = () => {
    const allTasks = getAllTasksWithContext();

    if (filterCategory === 'status' && selectedStatus) {
      return allTasks.filter(task => task.status === selectedStatus);
    }

    if (filterCategory === 'username' && selectedUsername) {
      return allTasks.filter(task => {
        // Check both 'users' and 'assignedUsers' fields (GraphQL uses 'users', but might be transformed)
        const taskUsers = task.users || task.assignedUsers;
        
        if (!taskUsers || !Array.isArray(taskUsers) || taskUsers.length === 0) {
          return false;
        }
        
        // Check if any assigned user matches the selected username
        return taskUsers.some((user: any) => {
          const taskUsername = user.username || user.name;
          return taskUsername === selectedUsername;
        });
      });
    }

    return allTasks;
  };

  // Handle category change
  const handleCategoryChange = (newCategory: FilterCategory) => {
    setFilterCategory(newCategory);
    setSelectedStatus('');
    setSelectedUsername('');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return '#4CAF50';
      case 'In progress': return '#FF9800';
      case 'Need help': return '#E91E63';
      case 'Todo': return '#757575';
      case 'Blocked': return '#757575';
      default: return '#757575';
    }
  };

  // State for custom dropdown
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{
      maxHeight: '70vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '20px 500px 10px 50px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e0e6ed',
      textAlign: 'left'
    }}>
      {/* Filter Controls */}
      <div style={{
        backgroundColor: '#fff',
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e0e6ed',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{
            fontSize: '0.9rem',
            fontWeight: '500',
            color: '#022AFF'
          }}>
            Filter tasks by:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => handleCategoryChange(e.target.value as FilterCategory)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '2px solid #022AFF',
              backgroundColor: '#fff',
              color: '#022AFF',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            <option value="none">No filter</option>
            <option value="status">Status</option>
            <option value="username">Assigned User</option>
          </select>

          {/* Status Selection */}
          {filterCategory === 'status' && (
            <>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>→</span>
              <div ref={statusDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `2px solid ${selectedStatus ? getStatusColor(selectedStatus) : '#022AFF'}`,
                    backgroundColor: '#fff',
                    color: selectedStatus ? getStatusColor(selectedStatus) : '#022AFF',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontWeight: '500',
                    minWidth: '140px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{selectedStatus || 'Select status...'}</span>
                  <span style={{ marginLeft: '8px' }}>{isStatusDropdownOpen ? '▲' : '▼'}</span>
                </div>
                
                {isStatusDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '2px solid #e0e6ed',
                    borderRadius: '6px',
                    marginTop: '2px',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div
                      onClick={() => {
                        setSelectedStatus('');
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#666',
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fff'}
                    >
                      Clear selection
                    </div>
                    {availableStatuses.map(status => (
                      <div
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: getStatusColor(status),
                          fontWeight: '500',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fff'}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: getStatusColor(status)
                          }}
                        />
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Username Selection */}
          {filterCategory === 'username' && (
            <>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>→</span>
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '2px solid #2196F3',
                  backgroundColor: '#fff',
                  color: '#2196F3',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontWeight: '500'
                }}
              >
                <option value="">Select user...</option>
                {availableUsernames.map((username: string) => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Filtered Tasks Window */}
      {filterCategory !== 'none' && (selectedStatus || selectedUsername) && (
        <div style={{
          backgroundColor: '#fff',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '2px solid #022AFF',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#022AFF',
            borderBottom: '2px solid #e0e6ed',
            paddingBottom: '8px'
          }}>
            📊 Filtered Tasks 
            {filterCategory === 'status' && selectedStatus && ` - Status: ${selectedStatus}`}
            {filterCategory === 'username' && selectedUsername && ` - User: ${selectedUsername}`}
            {` (${getFilteredTasks().length} found)`}
          </h3>
          
          {getFilteredTasks().length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic', margin: '12px 0' }}>
              No tasks found matching the selected filter.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getFilteredTasks().map((task: any, index: number) => {
                const taskStatus = task.status;
                const isCompleted = taskStatus === 'Done';
                return (
                <div
                  key={task.id || task._id || `${task.title}-${index}`}
                  style={{
                    backgroundColor: isCompleted ? '#e8f5e9' : '#f8f9fa',
                    border: `1px solid ${isCompleted ? '#a5d6a7' : '#e0e6ed'}`,
                    borderRadius: '6px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isCompleted ? '#c8e6c9' : '#e6f0ff';
                    e.currentTarget.style.borderColor = isCompleted ? '#81c784' : '#022AFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCompleted ? '#e8f5e9' : '#f8f9fa';
                    e.currentTarget.style.borderColor = isCompleted ? '#a5d6a7' : '#e0e6ed';
                  }}
                  onClick={() => setEditNode({
                    ...task,
                    type: 'task',
                    id: task.id || task.taskId,
                    projectId: task.projectId,
                    epicId: task.epicId,
                    featureId: task.featureId,
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#022AFF',
                      fontSize: '0.9rem'
                    }}>
                      ✓ {task.title}
                    </span>
                    
                    {task.status && (
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: taskStatus === 'Done' ? '#4CAF50' : taskStatus === 'In progress' ? '#FF9800' : taskStatus === 'Need help' ? '#E91E63' : '#757575',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {task.status}
                      </span>
                    )}
                    
                    {(task.users || task.assignedUsers) && (task.users || task.assignedUsers).length > 0 && (
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#2196F3',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        👤 {(task.users || task.assignedUsers).map((u: any) => u.username).join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#666',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <span>📚 {task.epicTitle}</span>
                    <span>→</span>
                    <span>🎯 {task.featureTitle}</span>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* Project Header */}
      <div style={{
        backgroundColor: '#022AFF',
        color: '#fff',
        padding: '20px 20px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#001a66'}
      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#022AFF'}
      onClick={() => setEditNode({...project, type: 'project'})}
      >
        📋 {project.title || project.name}
      </div>

      {/* Epics Container */}
      <div style={{ marginLeft: '30px', width: '28%', maxWidth: '350px', minWidth: '260px' }}>
        {project.epics && project.epics.map((epic: any) => {
          const epicId = epic.id || epic._id || epic.title;
          const hasFeatures = Array.isArray(epic.features) && epic.features.length > 0;
          const isEpicExpanded = expandedEpic === epicId;

          return (
            <div key={epicId} style={{ marginBottom: '12px' }}>
              {/* Epic Item */}
              <div style={{
                backgroundColor: '#2456e6',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#1e4acc'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2456e6'}
              >
                <span 
                  onClick={() => setEditNode({ ...epic, type: 'epic', projectId: project.projectId || project.id })}
                  style={{ flex: 1, fontSize: '1rem', fontWeight: '500', textAlign: 'left' }}
                >
                  📚 {epic.title}
                </span>
                
                {hasFeatures && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedEpic(isEpicExpanded ? null : epicId); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    {isEpicExpanded ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {/* Features */}
              {hasFeatures && isEpicExpanded && (
                <div style={{ marginLeft: '30px', marginTop: '8px' }}>
                  {epic.features.map((feature: any) => {
                    const featureId = feature.id || feature._id || feature.title;
                    const hasTasks = Array.isArray(feature.tasks) && feature.tasks.length > 0;
                    const isFeatureExpanded = expandedFeature === featureId;

                    return (
                      <div key={featureId} style={{ marginBottom: '8px' }}>
                        {/* Feature Item */}
                        <div style={{
                          backgroundColor: '#fff',
                          color: '#022AFF',
                          border: '2px solid #022AFF',
                          padding: '8px 14px',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#f0f6ff';
                          (e.target as HTMLElement).style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#fff';
                          (e.target as HTMLElement).style.transform = 'translateX(0px)';
                        }}
                        >
                          <span 
                            onClick={() => setEditNode({ ...feature, type: 'feature', projectId: project.projectId || project.id, epicId: epic.epicId || epic.id })}
                            style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500', textAlign: 'left' }}
                          >
                            🎯 {feature.title}
                          </span>
                          
                          {hasTasks && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedFeature(isFeatureExpanded ? null : featureId); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#022AFF',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(2,42,255,0.1)'}
                              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                            >
                              {isFeatureExpanded ? '▲' : '▼'}
                            </button>
                          )}
                        </div>

                        {/* Tasks */}
                        {hasTasks && isFeatureExpanded && (
                          <div style={{ marginLeft: '30px', marginTop: '6px' }}>
                            {feature.tasks.map((task: any) => {
                              const taskStatus = task.status;
                              const isCompleted = taskStatus === 'Done';
                              return (
                              <div
                                key={task.id || task._id || task.title}
                                style={{
                                  backgroundColor: isCompleted ? '#e8f5e9' : '#e6f0ff',
                                  color: isCompleted ? '#2e7d32' : '#022AFF',
                                  border: `1px solid ${isCompleted ? '#a5d6a7' : '#b3d1ff'}`,
                                  borderRadius: '4px',
                                  padding: '6px 10px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  fontSize: '0.85rem',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = isCompleted ? '#c8e6c9' : '#cce6ff';
                                  (e.target as HTMLElement).style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = isCompleted ? '#e8f5e9' : '#e6f0ff';
                                  (e.target as HTMLElement).style.transform = 'translateX(0px)';
                                }}
                                onClick={() => setEditNode({
                                  ...task,
                                  type: 'task',
                                  id: task.id || task.taskId,
                                  projectId: project.projectId || project.id,
                                  epicId: epic.epicId || epic.id,
                                  featureId: feature.featureId || feature.id,
                                })}
                              >
                                ✓ {task.title}
                                {task.status && (
                                  <span style={{
                                    marginLeft: '8px',
                                    fontSize: '0.75rem',
                                    backgroundColor: task.status === 'Done' ? '#4CAF50' : task.status === 'In progress' ? '#FF9800' : task.status === 'Need help' ? '#E91E63' : '#757575',
                                    color: '#fff',
                                    padding: '2px 6px',
                                    borderRadius: '3px'
                                  }}>
                                    {task.status}
                                  </span>
                                )}
                                {(task.users || task.assignedUsers) && (task.users || task.assignedUsers).length > 0 && (
                                  <span style={{
                                    marginLeft: '8px',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#2196F3',
                                    color: '#fff',
                                    padding: '2px 6px',
                                    borderRadius: '3px'
                                  }}>
                                    👤 {(task.users || task.assignedUsers).map((u: any) => u.username).join(', ')}
                                  </span>
                                )}
                              </div>
                            );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editNode && (
        <EditFanout
          node={editNode}
          mode="edit"
          project={project}
          onClose={() => setEditNode(null)}
          onSave={async (data?: any) => {
            if (data?.action === 'create') {
              setCreateNode({
                type: data.nodeType,
                parentIds: data.parentIds,
                parentNode: data.parentNode
              });
            } else {
              await fetchProjectById();
            }
            setEditNode(null);
          }}
        />
      )}
      {createNode && (
        <EditFanout
          createNode={createNode}
          mode="create"
          project={project}
          onClose={() => setCreateNode(null)}
          onSave={async () => {
            await fetchProjectById();
            setCreateNode(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectListView;
