import React from 'react';

interface StatusSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    nodeType?: 'project' | 'epic' | 'feature' | 'task';
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
    value,
    onChange,
    disabled = false
}) => {

    return (
        <React.Fragment>
            <label>Status</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                style={{ width: '100%', marginBottom: '12px' }}
            >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
                <option value="NEED_HELP">Need help</option>
            </select>
        </React.Fragment>
    );
};