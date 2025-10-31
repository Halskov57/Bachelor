import React from 'react';
import { Task } from '../types/EditFanoutTypes';
import { BasicForm } from './BasicForm';

interface TaskFormProps {
    task: Partial<Task>;
    onTaskChange: (field: keyof Task, value: string | number) => void;
    onTaskSubmit: () => void;
    disabled?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
    task,
    onTaskChange,
    onTaskSubmit,
    disabled = false
}) => {
    return (
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
    );
};