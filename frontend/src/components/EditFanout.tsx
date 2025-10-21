import React, { useState, useEffect } from 'react';
import { updateNode, addNode, deleteNode, getCourseLevelConfig } from '../utils/graphqlMutations';

interface CreateNodeData {
  type: string;
  parentIds: {
    projectId?: string;
    epicId?: string;
    featureId?: string;
  };
  parentNode?: any;
}

const EditFanout: React.FC<{ 
  node?: any; 
  createNode?: CreateNodeData;
  onClose: () => void; 
  onSave?: (data?: any) => void; 
  mode?: 'edit' | 'create';
  project?: any; // Add project data to access owners
}> = ({
  node,
  createNode,
  onClose,
  onSave,
  mode = 'edit',
  project
}) => {
  // Common fields
  const [title, setTitle] = useState(mode === 'create' ? '' : (node?.title || node?.name || ''));
  const [description, setDescription] = useState(mode === 'create' ? '' : (node?.description || ''));

  // Task-specific fields
  const [status, setStatus] = useState(node?.status || '');
  const [depth, setDepth] = useState(node?.depth ?? 0);
  const [courseLevel, setCourseLevel] = useState(node?.courseLevel ?? 1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    Array.isArray(node?.users) 
      ? node.users.map((user: any) => typeof user === 'string' ? user : user.username)
      : []
  );
  const [loading, setLoading] = useState(false);
  
  // Course level configuration state
  const [isTaskUserAssignmentEnabled, setIsTaskUserAssignmentEnabled] = useState<boolean>(true);
  const [isEpicCreateDeleteEnabled, setIsEpicCreateDeleteEnabled] = useState<boolean>(true);
  const [isFeatureCreateDeleteEnabled, setIsFeatureCreateDeleteEnabled] = useState<boolean>(true);
  const [isTaskCreateDeleteEnabled, setIsTaskCreateDeleteEnabled] = useState<boolean>(true);

  // Update state when node changes
  useEffect(() => {
    if (mode === 'edit' && node) {
      setTitle(node.title || node.name || '');
      setDescription(node.description || '');
      setStatus(node.status || '');
      setDepth(node.depth ?? 0);
      setCourseLevel(node.courseLevel ?? 1);
      setSelectedUsers(
        Array.isArray(node.users) 
          ? node.users.map((user: any) => typeof user === 'string' ? user : user.username)
          : []
      );
    } else if (mode === 'create') {
      // Reset to empty values for create mode
      setTitle('');
      setDescription('');
      setStatus('');
      setDepth(0);
      setCourseLevel(1);
      setSelectedUsers([]);
    }
  }, [node, mode]); // Re-run when node or mode changes

  // Load course level configuration to check feature availability
  useEffect(() => {
    const loadCourseLevelConfig = async () => {
      let projectCourseLevel = null;
      
      // Determine the course level to check
      if (project?.courseLevel) {
        projectCourseLevel = project.courseLevel;
      } else if (node?.courseLevel) {
        projectCourseLevel = node.courseLevel;
      } else if (mode === 'create' && createNode?.type === 'project') {
        projectCourseLevel = courseLevel; // Use the selected course level for new projects
      }
      
      if (projectCourseLevel) {
        try {
          const config = await getCourseLevelConfig(projectCourseLevel);
          console.log('DEBUG: Loaded config for course level', projectCourseLevel, ':', config);
          
          // Load all feature configurations
          const taskUserFeature = config.features.find((f: any) => f.key === 'TASK_USER_ASSIGNMENT');
          setIsTaskUserAssignmentEnabled(taskUserFeature ? taskUserFeature.enabled : true);
          
          const epicCreateDeleteFeature = config.features.find((f: any) => f.key === 'EPIC_CREATE_DELETE');
          setIsEpicCreateDeleteEnabled(epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true);
          console.log('DEBUG: Epic create/delete enabled:', epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true);
          
          const featureCreateDeleteFeature = config.features.find((f: any) => f.key === 'FEATURE_CREATE_DELETE');
          setIsFeatureCreateDeleteEnabled(featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true);
          console.log('DEBUG: Feature create/delete enabled:', featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true);
          
          const taskCreateDeleteFeature = config.features.find((f: any) => f.key === 'TASK_CREATE_DELETE');
          setIsTaskCreateDeleteEnabled(taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true);
          console.log('DEBUG: Task create/delete enabled:', taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true);
        } catch (error) {
          console.error('Failed to load course level config:', error);
          // Default to enabled if config loading fails
          setIsTaskUserAssignmentEnabled(true);
          setIsEpicCreateDeleteEnabled(true);
          setIsFeatureCreateDeleteEnabled(true);
          setIsTaskCreateDeleteEnabled(true);
        }
      }
    };
    
    loadCourseLevelConfig();
  }, [project, node, mode, createNode, courseLevel]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      console.log('handleSave called with selectedUsers:', selectedUsers);
      console.log('Node users:', node?.users);
      
      if (mode === 'create' && createNode) {
        // Check permissions for create operations
        if (createNode.type && !canCreateDelete(createNode.type)) {
          alert(`You don't have permission to create ${createNode.type}s in this course level.`);
          setLoading(false);
          return;
        }
        
        console.log('Creating node:', {
          type: createNode.type,
          parentIds: createNode.parentIds,
          title,
          description
        });
        
        const result = await addNode(
          createNode.type,
          createNode.parentIds,
          title,
          description,
          createNode.type === 'project' ? courseLevel : undefined
        );
        
        console.log('Create result:', result);
        onSave?.();
        onClose();
      } else if (mode === 'edit' && node) {
        // Existing edit logic
        const changedTitle = title !== (node.title || node.name || '');
        const changedDescription = description !== (node.description || '');
        const changedCourseLevel = node.type === 'project' && courseLevel !== (node.courseLevel ?? 1);

        let data: any = {};
        if (changedTitle) data.title = title;
        if (changedDescription) data.description = description;
        if (changedCourseLevel) data.courseLevel = courseLevel;

        // Always include type and id!
        data.type = node.type;
        if (node.type === 'project') data.id = node.id || node.projectId;
        if (node.type === 'epic') data.id = node.id || node.epicId;
        if (node.type === 'feature') data.id = node.id || node.featureId;
        if (node.type === 'task') data.id = node.id || node.taskId;

        if (node.type === 'task') {
          const changedStatus = status !== (node.status || '');
          const changedDepth = depth !== (node.depth ?? 0);
          // Convert node.users to usernames for comparison
          const nodeUsernames = (node.users || []).map((user: any) => 
            typeof user === 'string' ? user : user.username
          );
          const changedUsers = JSON.stringify(selectedUsers.sort()) !== JSON.stringify(nodeUsernames.sort());

          console.log('Task update debug:', {
            selectedUsers,
            nodeUsers: node.users,
            nodeUsernames,
            changedUsers,
            selectedUsersSorted: selectedUsers.sort(),
            nodeUsernamesSorted: nodeUsernames.sort()
          });

          if (changedStatus) data.status = status;
          if (changedDepth) data.depth = depth;
          if (changedUsers) data.users = selectedUsers;
          
          // Always include users for now to debug
          if (selectedUsers.length > 0) {
            data.users = selectedUsers;
            console.log('Force including users:', selectedUsers);
          }
        }

        const parentIds = {
          projectId: node.projectId || node.id || node.parentProjectId,
          epicId: node.epicId || node.parentEpicId,
          featureId: node.featureId || node.parentFeatureId,
        };

        const changedKeys = Object.keys(data).filter(k => k !== 'id' && k !== 'type');
        if (changedKeys.length > 0) {
          console.log('Calling updateNode with data:', data);
          console.log('Original node:', node);
          console.log('Parent IDs:', parentIds);
          await updateNode(data, parentIds);
        }

        onSave?.(); // Refresh the project data
        onClose();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!node) return;
    
    // Check permissions for delete operations
    if (node.type && !canCreateDelete(node.type)) {
      alert(`You don't have permission to delete ${node.type}s in this course level.`);
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${node.type}?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      
      // Determine parent IDs based on node type
      let parentIds: any = {
        projectId: node.projectId
      };

      if (node.type === 'feature') {
        parentIds.epicId = node.epicId;
      } else if (node.type === 'task') {
        parentIds.epicId = node.epicId;
        parentIds.featureId = node.featureId;
      }

      await deleteNode(node, parentIds);
      onSave?.(); // Refresh data
      onClose();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Error deleting ${node.type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = () => {
    if (!node) return;

    let nodeType = '';
    let parentIds: any = {};

    if (node.type === 'project') {
      nodeType = 'epic';
      parentIds = { projectId: node.id || node.projectId };
    } else if (node.type === 'epic') {
      nodeType = 'feature';
      parentIds = { 
        projectId: node.projectId, 
        epicId: node.id || node.epicId
      };
    } else if (node.type === 'feature') {
      nodeType = 'task';
      parentIds = { 
        projectId: node.projectId,
        epicId: node.epicId,
        featureId: node.id || node.featureId
      };
    } else {
      // Tasks can't have children
      return;
    }

    // Close current edit and open create mode
    onClose();
    // You'll need to pass a callback to open create mode
    // This will be handled by the parent component
    setTimeout(() => {
      // Trigger create mode in parent component
      if (onSave) {
        onSave({ 
          action: 'create', 
          nodeType, 
          parentIds, 
          parentNode: node 
        });
      }
    }, 100);
  };

  const getDisplayType = () => {
    if (mode === 'create' && createNode) {
      return createNode.type.charAt(0).toUpperCase() + createNode.type.slice(1);
    }
    if (node?.type) {
      return node.type.charAt(0).toUpperCase() + node.type.slice(1);
    }
    return 'Item';
  };

  const getAddButtonText = () => {
    if (!node) return '';
    
    switch (node.type) {
      case 'project': return 'Add Epic';
      case 'epic': return 'Add Feature';
      case 'feature': return 'Add Task';
      default: return '';
    }
  };

  const canCreateDelete = (type: string) => {
    const result = (() => {
      switch (type) {
        case 'epic': return isEpicCreateDeleteEnabled;
        case 'feature': return isFeatureCreateDeleteEnabled;
        case 'task': return isTaskCreateDeleteEnabled;
        default: return true;
      }
    })();
    console.log('DEBUG: canCreateDelete(' + type + ') = ' + result);
    return result;
  };

  const showAddButton = node && ['project', 'epic', 'feature'].includes(node.type) && (() => {
    const result = (() => {
      switch (node.type) {
        case 'project': return canCreateDelete('epic');
        case 'epic': return canCreateDelete('feature');
        case 'feature': return canCreateDelete('task');
        default: return false;
      }
    })();
    console.log('DEBUG: showAddButton for', node.type, '= canCreateDelete result:', result);
    return result;
  })();
  
  const showDeleteButton = node && ['epic', 'feature', 'task'].includes(node.type) && canCreateDelete(node.type);
  console.log('DEBUG: showDeleteButton for', node?.type, '=', showDeleteButton);

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: 360,
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      borderRadius: 12,
      padding: 24,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>
          {mode === 'create' ? `Create ${getDisplayType()}` : `Edit ${getDisplayType()}`}
        </h3>
        
        {/* Info icon only when task user assignment is disabled */}
        {(node?.type === 'task' || (mode === 'create' && createNode?.type === 'task')) && !isTaskUserAssignmentEnabled && (
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginLeft: '8px'
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'rgba(130, 130, 130, 1)',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'help',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              title="⚠️ User Assignment Disabled"
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1.1)';
                target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.transform = 'scale(1)';
                target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
              }}
            >
              i
            </span>
          </div>
        )}
      </div>
      
      {/* Existing form fields */}
      <label>Title</label>
      <input 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        style={{ width: '100%', marginBottom: '12px' }} 
      />
      
      <label>Description</label>
      <textarea 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        style={{ width: '100%', marginBottom: '12px' }} 
      />

      {/* Project-specific fields */}
      {(node?.type === 'project' || (mode === 'create' && createNode?.type === 'project')) && (
        <>
          <label>Course Level</label>
          <select
            value={courseLevel}
            onChange={e => setCourseLevel(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            {[1, 2, 3, 4, 5, 6].map(level => (
              <option key={level} value={level}>
                Course Level {level}
              </option>
            ))}
          </select>

          {/* Only show owners for edit mode */}
          {mode === 'edit' && (
            <>
              <label>Project Owners</label>
              <div style={{
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e0e6ed'
              }}>
                {node.owners && node.owners.length > 0 ? (
                  <div>
                    {node.owners.map((owner: any, index: number) => (
                      <span key={index} style={{
                        display: 'inline-block',
                        backgroundColor: '#022AFF',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        margin: '2px 4px 2px 0'
                      }}>
                        {owner.username || owner.name || 'Unknown User'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>
                    {node.owner ? `Single Owner: ${node.owner.username || node.owner.name}` : 'No owners assigned'}
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Task-specific fields */}
      {(node?.type === 'task' || (mode === 'create' && createNode?.type === 'task')) && (
        <React.Fragment>
          <label>Status</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <option value="">Select status</option>
            <option value="TODO">TODO</option>
            <option value="NOT_STARTED">NOT STARTED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          
          <label>Depth</label>
          <input
            type="number"
            value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '12px' }}
          />
          
          {/* Only show user assignment if enabled for this course level */}
          {isTaskUserAssignmentEnabled && (
            <React.Fragment>
              <label>Assigned Users</label>
              <div style={{ marginBottom: '12px' }}>
                {/* Get project owners from the node's project context */}
                {(() => {
                  // Try to get owners from various sources
                  const getProjectOwners = () => {
                    // If we have project prop passed directly
                    if (project?.owners) return project.owners;
                    
                    // Try to get from node context (works for all node types)
                    if (node?.projectOwners) return node.projectOwners;
                    
                    // For project nodes, get owners directly
                    if (node?.type === 'project' && node?.owners) return node.owners;
                    
                    // Fallback to single owner if available
                    if (node?.owner) return [node.owner];
                    if (project?.owner) return [project.owner];
                    
                    return [];
                  };

                  const projectOwners = getProjectOwners();
              
              if (projectOwners.length === 0) {
                return (
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    color: '#856404'
                  }}>
                    No project owners available for assignment
                  </div>
                );
              }

              return (
                <React.Fragment>
                  {/* Selected users display */}
                  <div style={{
                    minHeight: '40px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e6ed',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    {selectedUsers.length === 0 ? (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>No users assigned</span>
                    ) : (
                      selectedUsers.map((username, index) => (
                        <span key={index} style={{
                          display: 'inline-block',
                          backgroundColor: '#022AFF',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          margin: '2px 4px 2px 0',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          console.log('Removing user from task:', username);
                          setSelectedUsers(prev => {
                            const newUsers = prev.filter(u => u !== username);
                            console.log('Updated selectedUsers after removal:', newUsers);
                            return newUsers;
                          });
                        }}
                        title="Click to remove"
                        >
                          {username} ×
                        </span>
                      ))
                    )}
                  </div>
                  
                  {/* Available users dropdown */}
                  <select
                    onChange={e => {
                      const username = e.target.value;
                      if (username && !selectedUsers.includes(username)) {
                        console.log('Adding user to task:', username);
                        setSelectedUsers(prev => {
                          const newUsers = [...prev, username];
                          console.log('Updated selectedUsers:', newUsers);
                          return newUsers;
                        });
                      }
                      e.target.value = ''; // Reset dropdown
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e0e6ed' }}
                  >
                    <option value="">Select user to assign...</option>
                    {projectOwners
                      .filter((owner: any) => !selectedUsers.includes(owner.username || owner.name))
                      .map((owner: any, index: number) => (
                        <option key={index} value={owner.username || owner.name}>
                          {owner.username || owner.name}
                        </option>
                      ))
                    }
                  </select>
                </React.Fragment>
              );
            })()}
          </div>
          </React.Fragment>
        )}
        </React.Fragment>
      )}
      <div style={{ 
        marginTop: 20, 
        display: 'flex', 
        gap: 8, 
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        {/* Left side - Close and Save */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Save')}
          </button>
        </div>

        {/* Right side - Add and Delete */}
        <div style={{ display: 'flex', gap: 8 }}>
          {showAddButton && (
            <button 
              onClick={handleAddChild}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffb800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ {getAddButtonText()}
            </button>
          )}
          
          {showDeleteButton && (
            <button 
              onClick={handleDelete}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditFanout;