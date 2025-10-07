import React, { useState } from 'react';
import { updateNode, addNode } from '../utils/graphqlMutations';

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
  mode?: 'edit' | 'create' 
}> = ({
  node,
  createNode,
  onClose,
  onSave,
  mode = 'edit'
}) => {
  // Use createNode data when in create mode, otherwise use node data
  const activeNode = mode === 'create' ? createNode : node;
  
  // Common fields
  const [title, setTitle] = useState(mode === 'create' ? '' : (node?.title || node?.name || ''));
  const [description, setDescription] = useState(mode === 'create' ? '' : (node?.description || ''));

  // Task-specific fields
  const [status, setStatus] = useState(node?.status || '');
  const [depth, setDepth] = useState(node?.depth ?? 0);
  const [users, setUsers] = useState<string>(Array.isArray(node?.users) ? node.users.join(', ') : '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (mode === 'create' && createNode) {
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
          description
        );
        
        console.log('Create result:', result);
        onSave?.();
        onClose();
      } else if (mode === 'edit' && node) {
        // Existing edit logic
        const changedTitle = title !== (node.title || node.name || '');
        const changedDescription = description !== (node.description || '');

        let data: any = {};
        if (changedTitle) data.title = title;
        if (changedDescription) data.description = description;

        // Always include type and id!
        data.type = node.type;
        if (node.type === 'project') data.id = node.id || node.projectId;
        if (node.type === 'epic') data.id = node.id || node.epicId;
        if (node.type === 'feature') data.id = node.id || node.featureId;
        if (node.type === 'task') data.id = node.id || node.taskId;

        if (node.type === 'task') {
          const changedStatus = status !== (node.status || '');
          const changedDepth = depth !== (node.depth ?? 0);
          const changedUsers = users !== (Array.isArray(node.users) ? node.users.join(', ') : '');

          if (changedStatus) data.status = status;
          if (changedDepth) data.depth = depth;
          if (changedUsers) data.users = users.split(',').map((u: string) => u.trim());
        }

        const parentIds = {
          projectId: node.projectId || node.id || node.parentProjectId,
          epicId: node.epicId || node.parentEpicId,
          featureId: node.featureId || node.parentFeatureId,
        };

        const changedKeys = Object.keys(data).filter(k => k !== 'id' && k !== 'type');
        if (changedKeys.length > 0) {
          console.log('Calling updateNode with:', data, node, parentIds);
          await updateNode(data, parentIds);
        }

        onClose();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: 340,
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      borderRadius: 12,
      padding: 24,
      zIndex: 100
    }}>
      <h3>
        {mode === 'create' ? `Create ${getDisplayType()}` : `Edit ${getDisplayType()}`}
      </h3>
      <label>Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />

      {(node?.type === 'task' || node?.taskId || (mode === 'create' && createNode?.type === 'task')) && (
        <>
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
            <option value="">Select status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <label>Depth</label>
          <input
            type="number"
            value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <label>Users (comma separated)</label>
          <input
            value={users}
            onChange={e => setUsers(e.target.value)}
            placeholder="username1, username2"
            style={{ width: '100%' }}
          />
        </>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose}>Close</button>
        <button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Save')}
        </button>
      </div>
    </div>
  );
};

export default EditFanout;