import React from 'react';

const EditFanout: React.FC<{ node: any; onClose: () => void; onSave: (data: any) => void }> = ({ node, onClose, onSave }) => {
  // ...your form logic here...
  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: 320,
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      borderRadius: 12,
      padding: 24,
      zIndex: 100
    }}>
      <h3>Edit {node.type}</h3>
      {/* Example: */}
      <label>Title</label>
      <input defaultValue={node.name} />
      <label>Description</label>
      <textarea defaultValue={node.description} />
      {/* ... */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default EditFanout;