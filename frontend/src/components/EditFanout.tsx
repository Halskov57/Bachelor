import React, { useState } from 'react';
import { updateNode } from '../utils/graphqlMutations';

const EditFanout: React.FC<{ node: any; onClose: () => void; onSave: (data: any) => void; mode?: 'edit' | 'create' }> = ({
  node,
  onClose,
  onSave,
  mode = 'edit'
}) => {
  // Common fields
  const [title, setTitle] = useState(node.title || node.name || '');
  const [description, setDescription] = useState(node.description || '');

  // Task-specific fields
  const [status, setStatus] = useState(node.status || '');
  const [depth, setDepth] = useState(node.depth ?? 0);
  const [users, setUsers] = useState<string>(Array.isArray(node.users) ? node.users.join(', ') : '');

  const handleSave = async () => {
    if (mode === 'create' && node.type === 'project') {
      // Call the REST endpoint for project creation
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
      const username = payload?.sub;
      await fetch(`http://localhost:8081/projects?username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      onClose();
      return;
    }

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
        {mode === 'create'
          ? `Create ${node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Project'}`
          : `Edit ${node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Project'}`}
      </h3>
      <label>Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />

      {(node.type === 'task' || node.taskId) && (
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
        <button onClick={handleSave}>{mode === 'create' ? 'Create' : 'Save'}</button>
      </div>
    </div>
  );
};

export default EditFanout;