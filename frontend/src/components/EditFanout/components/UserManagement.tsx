import React from 'react';
import { User } from '../types/EditFanoutTypes';

interface UserManagementProps {
    type: 'owners' | 'assignees';
    selectedUsers: string[];
    onAdd: (username: string) => Promise<void>;
    onRemove: (username: string) => Promise<void>;
    canManage?: boolean;
    loading?: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    isManaging: boolean;
    onToggleManaging: () => void;
    project?: any;
    availableUsers?: User[];
    isEnabled?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
    type,
    selectedUsers,
    onAdd,
    onRemove,
    loading = false,
    searchTerm,
    onSearchChange,
    isManaging,
    onToggleManaging,
    project,
    isEnabled = true
}) => {
    
    if (type === 'owners' && project) {
        // Project Owner Management
        return (
            <React.Fragment>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Project Owners</label>
                    <button
                        onClick={onToggleManaging}
                        style={{
                            padding: '4px 12px',
                            backgroundColor: isManaging ? '#dc3545' : '#0066cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {isManaging ? 'Done' : 'Manage Users'}
                    </button>
                </div>

                <div style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e0e6ed',
                    textAlign: 'left'
                }}>
                    {selectedUsers.length > 0 ? (
                        <div>
                            {selectedUsers.map((username: string, index: number) => (
                                <span key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    backgroundColor: '#022AFF',
                                    color: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    margin: '2px 4px 2px 0',
                                    cursor: isManaging ? 'pointer' : 'default'
                                }}
                                onClick={() => isManaging && onRemove(username)}
                                title={isManaging ? "Click to remove" : undefined}
                                >
                                    {username}
                                    {isManaging && <span style={{ marginLeft: '6px' }}>×</span>}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>
                            No owners assigned
                        </span>
                    )}
                </div>

                {/* Add owner input when managing */}
                {isManaging && (
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                            Add User by Username
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Enter username..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchTerm.trim()) {
                                        onAdd(searchTerm.trim());
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    fontSize: '14px',
                                    border: '1px solid #e0e6ed',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                disabled={loading}
                            />
                            <button
                                onClick={() => {
                                    if (searchTerm.trim()) {
                                        onAdd(searchTerm.trim());
                                    }
                                }}
                                disabled={loading || !searchTerm.trim()}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: loading || !searchTerm.trim() ? '#ccc' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading || !searchTerm.trim() ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Add
                            </button>
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            Type username and press Enter or click Add
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }

    if (type === 'assignees') {
        // Task User Assignment
        
        // If disabled, show info message
        if (!isEnabled) {
            return (
                <React.Fragment>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <label style={{ margin: 0 }}>Assigned Users</label>
                        <span 
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'help'
                            }}
                            title="Task user assignment is disabled for this course level"
                        >
                            i
                        </span>
                    </div>
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        color: '#6c757d',
                        fontSize: '14px',
                        fontStyle: 'italic'
                    }}>
                        User assignment is disabled for this course level
                    </div>
                </React.Fragment>
            );
        }
        
        const getProjectOwners = () => {
            if (project?.owners) return project.owners;
            return [];
        };

        const projectOwners = getProjectOwners();

        if (projectOwners.length === 0) {
            return (
                <React.Fragment>
                    <label>Assigned Users</label>
                    <div style={{ 
                        padding: '8px', 
                        backgroundColor: '#fff3cd', 
                        border: '1px solid #ffeaa7',
                        borderRadius: '4px',
                        color: '#856404',
                        marginBottom: '12px'
                    }}>
                        No project owners available for assignment
                    </div>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <label>Assigned Users</label>
                <div style={{ marginBottom: '12px' }}>
                    {/* Selected users display */}
                    <div style={{
                        minHeight: '40px',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e6ed',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        textAlign: 'left'
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
                                onClick={() => onRemove(username)}
                                title="Click to remove"
                                >
                                    {username} ×
                                </span>
                            ))
                        )}
                    </div>
                    
                    {/* Available users dropdown */}
                    <select
                        onChange={(e) => {
                            const username = e.target.value;
                            if (username && !selectedUsers.includes(username)) {
                                onAdd(username);
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
                </div>
            </React.Fragment>
        );
    }

    return null;
};