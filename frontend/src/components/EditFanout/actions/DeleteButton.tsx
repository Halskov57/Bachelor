import React, { useState } from 'react';

interface DeleteButtonProps {
    onDelete: () => Promise<void>;
    loading?: boolean;
    disabled?: boolean;
    nodeType?: string;
    nodeName?: string;
    confirmationRequired?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
    onDelete,
    loading = false,
    disabled = false,
    nodeType = 'item',
    nodeName,
    confirmationRequired = true
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleDelete = async () => {
        if (confirmationRequired && !showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        try {
            await onDelete();
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setShowConfirmation(false);
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    if (showConfirmation) {
        return (
            <div className="delete-confirmation">
                <div className="confirmation-message">
                    <p>
                        Are you sure you want to delete this {nodeType}
                        {nodeName ? ` "${nodeName}"` : ''}?
                    </p>
                    <p className="text-warning">This action cannot be undone.</p>
                </div>
                <div className="confirmation-buttons">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="btn btn-danger btn-sm"
                    >
                        {loading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="btn btn-secondary btn-sm ms-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={disabled || loading}
            className="btn btn-danger"
            title={`Delete ${nodeType}`}
        >
            {loading ? 'Deleting...' : `Delete ${nodeType}`}
        </button>
    );
};