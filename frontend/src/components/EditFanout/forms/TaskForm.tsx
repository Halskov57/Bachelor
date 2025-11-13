import React from 'react';
import { Task } from '../types/EditFanoutTypes';
import { BasicForm } from './BasicForm';

interface TaskFormProps {
    task: Partial<Task>;
    onTaskChange: (field: keyof Task, value: string | number) => void;
    onTaskSubmit: () => void;
    disabled?: boolean;
    isTaskDueDateEnabled?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
    task,
    onTaskChange,
    onTaskSubmit,
    disabled = false,
    isTaskDueDateEnabled = true
}) => {
    return (
        <div>
            <BasicForm
                title={task.title || ''}
                description={task.description || ''}
                onTitleChange={(value) => onTaskChange('title', value)}
                onDescriptionChange={(value) => onTaskChange('description', value)}
                disabled={disabled}
                titleLabel="Title"
                descriptionLabel="Description"
                titlePlaceholder="Enter task name"
                descriptionPlaceholder="Enter task description"
            />
            
            {/* Due Date Field - conditionally rendered */}
            {isTaskDueDateEnabled && (
                <div style={{ marginTop: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#333',
                        fontSize: '0.9rem'
                    }}>
                        Due Date
                    </label>
                    <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => {
                            console.log('Date changed to:', e.target.value);
                            onTaskChange('dueDate', e.target.value);
                        }}
                        disabled={disabled}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #e0e6ed',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => !disabled && (e.target.style.borderColor = '#022AFF')}
                        onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
                    />
                </div>
            )}
        </div>
    );
};