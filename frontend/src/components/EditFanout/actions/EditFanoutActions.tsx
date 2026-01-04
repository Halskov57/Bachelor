import React from 'react';

interface EditFanoutActionsProps {
    onSave: () => Promise<void>;
    onDelete?: () => Promise<void>;
    onAddChild?: () => void;
    onClose: () => void;
    loading: boolean;
    mode?: 'edit' | 'create';
    showAddButton: boolean;
    showDeleteButton: boolean;
    nodeType?: string;
    nodeName?: string;
}

export const EditFanoutActions: React.FC<EditFanoutActionsProps> = ({
    onSave,
    onDelete,
    onAddChild,
    onClose,
    loading,
    mode = 'edit',
    showAddButton,
    showDeleteButton,
    nodeType,
    nodeName
}) => {
    const getAddButtonText = () => {
        switch (nodeType) {
            case 'project':
                return 'Add Epic';
            case 'epic':
                return 'Add Feature';
            case 'feature':
                return 'Add Task';
            default:
                return 'Add Child';
        }
    };

    return (
        <div style={{ 
            marginTop: 20, 
            display: 'flex', 
            gap: 8, 
            flexWrap: 'nowrap',
            justifyContent: 'space-between'
        }}>
            {/* Left side - Close and Save */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button 
                    onClick={onClose}
                    disabled={loading}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Close
                </button>
                
                <button 
                    onClick={onSave} 
                    disabled={loading}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Save')}
                </button>
            </div>

            {/* Right side - Add and Delete */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {showAddButton && onAddChild && (
                    <button 
                        onClick={onAddChild}
                        disabled={loading}
                        style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            backgroundColor: '#ffb800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ✕ {getAddButtonText()}
                    </button>
                )}
                
                {showDeleteButton && onDelete && (
                    <button 
                        onClick={onDelete}
                        disabled={loading}
                        style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🗑️ Delete
                    </button>
                )}
            </div>
        </div>
    );
};