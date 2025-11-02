import React from 'react';

interface SaveButtonProps {
    onSave: () => Promise<void>;
    loading?: boolean;
    disabled?: boolean;
    mode?: 'edit' | 'create';
    nodeType?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
    onSave,
    loading = false,
    disabled = false,
    mode = 'edit',
    nodeType
}) => {
    const getButtonText = () => {
        if (loading) {
            return mode === 'create' ? 'Creating...' : 'Saving...';
        }
        return mode === 'create' ? `Create ${nodeType || 'Item'}` : 'Save Changes';
    };

    const getButtonClass = () => {
        let baseClass = 'btn';
        if (mode === 'create') {
            baseClass += ' btn-success';
        } else {
            baseClass += ' btn-primary';
        }
        if (loading) {
            baseClass += ' btn-loading';
        }
        return baseClass;
    };

    return (
        <button
            type="button"
            onClick={onSave}
            disabled={disabled || loading}
            className={getButtonClass()}
        >
            {loading && <span className="spinner-border spinner-border-sm me-2" />}
            {getButtonText()}
        </button>
    );
};