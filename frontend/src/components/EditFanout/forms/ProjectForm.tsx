import React from 'react';
import { Project } from '../types/EditFanoutTypes';
import { BasicForm } from './BasicForm';

interface ProjectFormProps {
    project: Partial<Project>;
    onProjectChange: (field: keyof Project, value: string) => void;
    onProjectSubmit: () => void;
    disabled?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    project,
    onProjectChange,
    onProjectSubmit,
    disabled = false
}) => {
    return (
        <div className="project-form">
            <h3>Project Details</h3>
            <form onSubmit={(e) => { e.preventDefault(); onProjectSubmit(); }}>
                <BasicForm
                    title={project.title || ''}
                    description={project.description || ''}
                    onTitleChange={(value) => onProjectChange('title', value)}
                    onDescriptionChange={(value) => onProjectChange('description', value)}
                    disabled={disabled}
                    titleLabel="Project Name"
                    descriptionLabel="Project Description"
                    titlePlaceholder="Enter project name"
                    descriptionPlaceholder="Enter project description"
                />
            </form>
        </div>
    );
};