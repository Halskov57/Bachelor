import React, { useState, useEffect } from 'react';
import { updateNode, addNode, deleteNode, getCourseLevelConfig } from '../utils/graphqlMutations';
import { CourseLevelConfig, FeatureConfig } from '../utils/types';

interface TaskUser {
  username: string;
}

interface Node {
  id?: string;
  type: 'project' | 'epic' | 'feature' | 'task';
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  depth?: number;
  courseLevel?: number;
  users?: TaskUser[] | string[];
  projectId?: string;
  epicId?: string;
  featureId?: string;
  owners?: TaskUser[];
  owner?: TaskUser;
  projectOwners?: TaskUser[];
  parentProjectId?: string;
  parentEpicId?: string;
  parentFeatureId?: string;
}

interface ProjectNode extends Node {
  courseLevel: number;
  owners: TaskUser[];
}

interface CreateNodeData {
  type: string;
  parentIds: {
    projectId?: string;
    epicId?: string;
    featureId?: string;
  };
  parentNode?: Node;
}

interface EditFanoutProps {
  node?: Node;
  createNode?: CreateNodeData;
  onClose: () => void;
  onSave?: (data?: any) => void;
  mode?: 'edit' | 'create';
  project?: ProjectNode;
}

const EditFanout: React.FC<EditFanoutProps> = ({
  project?: any; // Add project data to access owners
  allUsers?: any[]; // Add list of all users
}> = ({
  node,
  createNode,
  onClose,
  onSave,
  mode = 'edit',
  project,
  allUsers = []
}) => {
  // --- State ---
  const [title, setTitle] = useState(node?.title || node?.name || '');
  const [description, setDescription] = useState(node?.description || '');
  const [status, setStatus] = useState(node?.status || '');
  const [depth, setDepth] = useState(node?.depth ?? 0);
  const [courseLevel, setCourseLevel] = useState(node?.courseLevel ?? 0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    node && Array.isArray(node.users)
    ? node.users.map(u => (typeof u === 'string' ? u : u.username))
    : []
  );
  const [selectedOwners, setSelectedOwners] = useState<string[]>(
    mode === 'edit' && node?.type === 'project' && Array.isArray(node?.owners)
      ? node.owners.map((owner: any) => owner.username || owner.name)
      : []
  );
  const [managingOwners, setManagingOwners] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Course level config flags
  const [isTaskUserAssignmentEnabled, setIsTaskUserAssignmentEnabled] = useState(true);
  const [isEpicCreateDeleteEnabled, setIsEpicCreateDeleteEnabled] = useState(true);
  const [isFeatureCreateDeleteEnabled, setIsFeatureCreateDeleteEnabled] = useState(true);
  const [isTaskCreateDeleteEnabled, setIsTaskCreateDeleteEnabled] = useState(true);

  // --- Effects ---

  // Update local state when node changes
  useEffect(() => {
    if (mode === 'edit' && node) {
      setTitle(node.title || node.name || '');
      setDescription(node.description || '');
      setStatus(node.status || '');
      setDepth(node.depth ?? 0);
      setCourseLevel(node.courseLevel ?? 0);
      setSelectedUsers(
        Array.isArray(node.users)
          ? node.users.map(u => (typeof u === 'string' ? u : u.username))
          : []
      );
      if (node.type === 'project' && Array.isArray(node.owners)) {
        setSelectedOwners(node.owners.map((owner: any) => owner.username || owner.name));
      }
    } else if (mode === 'create') {
      setTitle('');
      setDescription('');
      setStatus('');
      setDepth(0);
      setCourseLevel(0);
      setSelectedUsers([]);
      setSelectedOwners([]);
    }
  }, [node, mode]);

  // Load course level config
  useEffect(() => {
    const loadConfig = async () => {
      let projectCourseLevel = node?.courseLevel ?? project?.courseLevel ?? courseLevel;
      if (mode === 'create' && createNode?.type === 'project') {
        projectCourseLevel = courseLevel;
      }

      if (!projectCourseLevel) return;

      try {
        const config: CourseLevelConfig | null = await getCourseLevelConfig(projectCourseLevel);
        
        // Use optional chaining and provide defaults
        const features = config?.features ?? [];

        // Find features with proper typing
        const taskUserFeature = features.find((f: FeatureConfig) => f.key === 'TASK_USER_ASSIGNMENT');
        const epicCreateDeleteFeature = features.find((f: FeatureConfig) => f.key === 'EPIC_CREATE_DELETE');
        const featureCreateDeleteFeature = features.find((f: FeatureConfig) => f.key === 'FEATURE_CREATE_DELETE');
        const taskCreateDeleteFeature = features.find((f: FeatureConfig) => f.key === 'TASK_CREATE_DELETE');

        setIsTaskUserAssignmentEnabled(taskUserFeature ? taskUserFeature.enabled : true);
        setIsEpicCreateDeleteEnabled(epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true);
        setIsFeatureCreateDeleteEnabled(featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true);
        setIsTaskCreateDeleteEnabled(taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true);
      } catch (err) {
        console.error('Failed to load course level config:', err);
        // Set defaults on error
        setIsTaskUserAssignmentEnabled(true);
        setIsEpicCreateDeleteEnabled(true);
        setIsFeatureCreateDeleteEnabled(true);
        setIsTaskCreateDeleteEnabled(true);
      }
    };

    loadConfig();
  }, [project, node, createNode, courseLevel, mode]);

  // --- Helpers ---

  const canCreateDelete = (type: string) => {
    switch (type) {
      case 'epic': return isEpicCreateDeleteEnabled;
      case 'feature': return isFeatureCreateDeleteEnabled;
      case 'task': return isTaskCreateDeleteEnabled;
      default: return true;
    }
  };

  const getParentIds = () => ({
    projectId: node?.projectId ?? node?.id ?? node?.parentProjectId,
    epicId: node?.epicId ?? node?.parentEpicId,
    featureId: node?.featureId ?? node?.parentFeatureId,
  });

  const getDisplayType = () => {
    if (mode === 'create' && createNode) return createNode.type.charAt(0).toUpperCase() + createNode.type.slice(1);
    if (node?.type) return node.type.charAt(0).toUpperCase() + node.type.slice(1);
    return 'Item';
  };

  // --- Event handlers ---
  const handleSave = async () => {
    try {
      setLoading(true);

      if (mode === 'create' && createNode) {
        if (createNode.type && !canCreateDelete(createNode.type)) {
          alert(`You don't have permission to create ${createNode.type}s in this course level.`);
          return;
        }
        
        console.log('Creating node:', {
          type: createNode.type,
          parentIds: createNode.parentIds,
          title,
          description,
          courseLevel: courseLevel
        });
        
        const result = await addNode(
        await addNode(
          createNode.type,
          createNode.parentIds,
          title,
          description,
          createNode.type === 'project' ? courseLevel : undefined
        );
        onSave?.();
        onClose();
        return;
      }

      if (mode === 'edit' && node) {
        const data: any = {};
        if (title !== (node.title || node.name)) data.title = title;
        if (description !== (node.description || '')) data.description = description;
        if (node.type === 'project' && courseLevel !== (node.courseLevel ?? 1)) data.courseLevel = courseLevel;

        if (node.type === 'task') {
          if (status !== (node.status || '')) data.status = status;
          if (depth !== (node.depth ?? 0)) data.depth = depth;
          const nodeUsernames = (node.users ?? []).map(u => typeof u === 'string' ? u : u.username);
          if (JSON.stringify(selectedUsers.sort()) !== JSON.stringify(nodeUsernames.sort())) {
            data.users = selectedUsers;
          }
        }

        data.type = node.type;
        data.id = node.id ?? node.projectId ?? node.epicId ?? node.featureId ?? node.title;

        const parentIds = getParentIds();
        if (Object.keys(data).length > 2) {
          await updateNode(data, parentIds);
        }
        onSave?.();
        onClose();
      }

    } catch (err: any) {
      console.error('Save error:', err);
      alert(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!node || !canCreateDelete(node.type)) return;

    const confirmed = window.confirm(`Are you sure you want to delete this ${node.type}?`);
    if (!confirmed) return;

    try {
      setLoading(true);

      const parentIds = getParentIds();
      await deleteNode(node, parentIds);

      onSave?.();
      onClose();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Error deleting ${node.type}: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = () => {
    if (!node) return;

    let nodeType = '';
    let parentIds: any = {};
    switch (node.type) {
      case 'project':
        nodeType = 'epic';
        parentIds = { projectId: node.id };
        break;
      case 'epic':
        nodeType = 'feature';
        parentIds = { projectId: node.projectId, epicId: node.id };
        break;
      case 'feature':
        nodeType = 'task';
        parentIds = { projectId: node.projectId, epicId: node.epicId, featureId: node.id };
        break;
      default:
        return;
    }

    onClose();
    setTimeout(() => {
      onSave?.({ action: 'create', nodeType, parentIds, parentNode: node });
    }, 100);
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

  // --- Display flags ---
  const showAddButton = node && ['project', 'epic', 'feature'].includes(node.type) && canCreateDelete(node.type === 'project' ? 'epic' : node.type === 'epic' ? 'feature' : 'task');
  const showDeleteButton = node && ['epic', 'feature', 'task'].includes(node.type) && canCreateDelete(node.type);

  // --- Render ---
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
          {mode === 'create'
          ? `Create ${createNode?.type ? createNode.type.charAt(0).toUpperCase() + createNode.type.slice(1) : 'Node'}`
        : `Edit ${node?.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Node'}`}
        </h3>

        {(node?.type === 'task' || (mode === 'create' && createNode?.type === 'task')) && !isTaskUserAssignmentEnabled && (
          <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
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

      {(node?.type === 'project' || (mode === 'create' && createNode?.type === 'project')) && (
        <>
          <label>Course Level</label>
          <select
            value={courseLevel}
            onChange={e => {
              const newValue = Number(e.target.value);
              console.log('Course level dropdown changed to:', newValue);
              setCourseLevel(newValue);
            }}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <option value={0}>Default Template (All Course Levels)</option>
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

      {(node?.type === 'task' || (mode === 'create' && createNode?.type === 'task')) && (
        <>
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

          {isTaskUserAssignmentEnabled && (
            <>
              <label>Assigned Users</label>
              <div style={{ marginBottom: '12px' }}>
                {selectedUsers.length === 0 ? (
                  <span style={{ fontStyle: 'italic', color: '#666' }}>No users assigned</span>
                ) : (
                  selectedUsers.map(username => (
                    <span
                      key={username}
                      onClick={() => setSelectedUsers(prev => prev.filter(u => u !== username))}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#022AFF',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        margin: '2px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {username} ×
                    </span>
                  ))
                )}

                <select
                  onChange={e => {
                    const user = e.target.value;
                    if (user && !selectedUsers.includes(user)) {
                      setSelectedUsers(prev => [...prev, user]);
                    }
                    e.target.value = '';
                  }}
                  style={{ width: '100%', marginTop: '4px', padding: '8px' }}
                >
                  <option value="">Select user to assign...</option>
                  {(project?.owners ?? []).filter(owner => !selectedUsers.includes(owner.username)).map(owner => (
                    <option key={owner.username} value={owner.username}>{owner.username}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid #ddd', backgroundColor: '#f5f5f5', cursor: 'pointer' }}>
            Close
          </button>
          <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', backgroundColor: '#0066cc', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(node && ['project', 'epic', 'feature'].includes(node.type) && (() => {
            if (node.type === 'project') return canCreateDelete('epic');
            if (node.type === 'epic') return canCreateDelete('feature');
            if (node.type === 'feature') return canCreateDelete('task');
            return false;
          })()) && (
            <button onClick={handleAddChild} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', backgroundColor: '#ffb800', color: '#fff', cursor: 'pointer' }}>
              ✕ {node?.type === 'project' ? 'Add Epic' : node?.type === 'epic' ? 'Add Feature' : 'Add Task'}
            </button>
          )}

          {(node && ['epic', 'feature', 'task'].includes(node.type) && canCreateDelete(node.type)) && (
            <button onClick={handleDelete} disabled={loading} style={{ padding: '8px 16px', borderRadius: 4, border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              🗑️ Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditFanout;