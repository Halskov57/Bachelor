import React from 'react';
import { useEditFanout } from './EditFanout/hooks/useEditFanout';
import { ProjectForm } from './EditFanout/forms/ProjectForm';
import { TaskForm } from './EditFanout/forms/TaskForm';
import { BasicForm } from './EditFanout/forms/BasicForm';
import { StatusSelect } from './EditFanout/components/StatusSelect';
import { CourseSelect } from './EditFanout/components/CourseSelect';
import { UserManagement } from './EditFanout/components/UserManagement';
import { EditFanoutActions } from './EditFanout/actions/EditFanoutActions';
import { EditFanoutProps } from './EditFanout/types/EditFanoutTypes';
import { isAdmin } from '../utils/jwt';

const EditFanout: React.FC<EditFanoutProps> = ({
    node,
    createNode,
    onClose,
    onSave,
    mode = 'edit',
    project
}) => {
    const hookResult = useEditFanout({
        node,
        createNode,
        onClose,
        onSave,
        mode,
        project
    });

    const {
        formData,
        uiState,
        courseConfig,
        updateFormData,
        updateUiState,
        handleSave,
        handleDelete,
        handleAddChild,
        handleAddOwner,
        handleRemoveOwner,
        canCreateDelete,
        getNodeType
    } = hookResult;

    const { loading, managingOwners, userSearchTerm } = uiState;

    const nodeType = getNodeType();
    const isAdminUser = isAdmin();

    // Helper functions
    const getNodeTitle = () => {
        if (mode === 'create') {
            return `Create ${nodeType}`;
        }
        return `Edit ${nodeType}`;
    };

    const showDeleteButton = mode === 'edit' && canCreateDelete(nodeType);
    const showAddButton = mode === 'edit' && (nodeType === 'project' || nodeType === 'epic' || nodeType === 'feature');

    // User management handlers
    const handleAddUser = async (username: string) => {
        if (nodeType === 'project') {
            await handleAddOwner(username);
            setUserSearchTerm('');
        } else if (nodeType === 'task') {
            // Add to selected users for tasks
            const currentUsers = formData.selectedUsers;
            if (!currentUsers.includes(username)) {
                updateFormData({ 
                    selectedUsers: [...currentUsers, username] 
                });
            }
        }
    };

    const handleRemoveUser = async (username: string) => {
        if (nodeType === 'project') {
            return handleRemoveOwner(username);
        } else if (nodeType === 'task') {
            // Remove from selected users for tasks
            const currentUsers = formData.selectedUsers;
            updateFormData({ 
                selectedUsers: currentUsers.filter(u => u !== username) 
            });
        }
    };

    const setUserSearchTerm = (term: string) => {
        updateUiState({ userSearchTerm: term });
    };

    const setManagingOwners = (managing: boolean) => {
        updateUiState({ managingOwners: managing });
    };

    const renderFormContent = () => {
        switch (nodeType) {
            case 'project':
                return (
                    <ProjectForm
                        project={{
                            title: formData.title,
                            description: formData.description
                        }}
                        onProjectChange={(field: string, value: string) => {
                            if (field === 'title') {
                                updateFormData({ title: value });
                            } else if (field === 'description') {
                                updateFormData({ description: value });
                            }
                        }}
                        onProjectSubmit={() => {}}
                        disabled={loading}
                    />
                );

            case 'task':
                return (
                    <TaskForm
                        task={{
                            title: formData.title,
                            description: formData.description
                        }}
                        onTaskChange={(field: string, value: string | number) => {
                            if (field === 'title') {
                                updateFormData({ title: value as string });
                            } else if (field === 'description') {
                                updateFormData({ description: value as string });
                            }
                        }}
                        onTaskSubmit={() => {}}
                        disabled={loading}
                    />
                );

            default:
                // For epic and feature, use BasicForm
                return (
                    <BasicForm
                        title={formData.title}
                        description={formData.description}
                        onTitleChange={(value: string) => updateFormData({ title: value })}
                        onDescriptionChange={(value: string) => updateFormData({ description: value })}
                        disabled={loading}
                        titleLabel={`${nodeType} Name`}
                        descriptionLabel={`${nodeType} Description`}
                        titlePlaceholder={`Enter ${nodeType} name`}
                        descriptionPlaceholder={`Enter ${nodeType} description`}
                    />
                );
        }
    };

    const renderStatusSection = () => {
        // Only tasks should have status selection
        if (nodeType !== 'task') return null;

        return (
            <StatusSelect
                value={formData.status}
                onChange={(value: string) => updateFormData({ status: value })}
                disabled={loading}
                nodeType={nodeType}
            />
        );
    };



    const renderCourseLevelSection = () => {
        if (!isAdminUser && mode === 'edit') return null;

        return (
            <CourseSelect
                value={formData.courseLevel}
                onChange={(value: number) => updateFormData({ courseLevel: value })}
                disabled={loading}
                isAdmin={isAdminUser}
                mode={mode}
            />
        );
    };

    const renderUserManagement = () => {
        // Show owner management for projects (only in edit mode)
        if (nodeType === 'project' && mode === 'edit') {
            return (
                <UserManagement
                    type="owners"
                    selectedUsers={formData.selectedOwners}
                    onAdd={handleAddUser}
                    onRemove={handleRemoveUser}
                    loading={loading}
                    searchTerm={userSearchTerm}
                    onSearchChange={setUserSearchTerm}
                    isManaging={managingOwners}
                    onToggleManaging={() => setManagingOwners(!managingOwners)}
                    project={project}
                />
            );
        }

        // Show assignee management for tasks if enabled
        if (nodeType === 'task' && courseConfig.isTaskUserAssignmentEnabled) {
            return (
                <UserManagement
                    type="assignees"
                    selectedUsers={formData.selectedUsers}
                    onAdd={handleAddUser}
                    onRemove={handleRemoveUser}
                    loading={loading}
                    searchTerm={userSearchTerm}
                    onSearchChange={setUserSearchTerm}
                    isManaging={managingOwners}
                    onToggleManaging={() => setManagingOwners(!managingOwners)}
                    project={project}
                />
            );
        }

        return null;
    };

    return (
        <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 360,
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            borderRadius: 12,
            padding: 24,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>
                    {getNodeTitle()}
                </h3>
            </div>

            <div>
                {renderFormContent()}
                
                {renderStatusSection()}
                
                {renderCourseLevelSection()}
                
                {renderUserManagement()}
            </div>

            <div style={{ marginTop: '20px' }}>
                <EditFanoutActions
                    onSave={handleSave}
                    onDelete={showDeleteButton ? handleDelete : undefined}
                    onAddChild={showAddButton ? handleAddChild : undefined}
                    onClose={onClose}
                    loading={loading}
                    mode={mode}
                    showAddButton={showAddButton}
                    showDeleteButton={showDeleteButton}
                    nodeType={nodeType}
                    nodeName={formData.title}
                />
            </div>
        </div>
    );
};

export default EditFanout;