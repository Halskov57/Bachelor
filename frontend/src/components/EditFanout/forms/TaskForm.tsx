import React from 'react';
import { Task } from '../types/EditFanoutTypes';
import { BasicForm } from './BasicForm';
import { DatePicker } from '../components/DatePicker';

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
        <div className="space-y-4">
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
                <DatePicker
                    value={task.dueDate || ''}
                    onChange={(value) => onTaskChange('dueDate', value)}
                    disabled={disabled}
                    label="Due Date"
                />
            )}
        </div>
    );
};