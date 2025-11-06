import { useState, useEffect } from 'react';
import { updateNode, addNode, deleteNode, getCourseLevelConfig, addUserToProject, removeUserFromProject } from '../../../utils/graphqlMutations';
import { isAdmin } from '../../../utils/jwt';
import { useToast } from '../../../utils/toastContext';
import { EditFanoutProps, FormData, CourseConfig } from '../types/EditFanoutTypes';

export const useEditFanout = ({
  node,
  createNode,
  onClose,
  onSave,
  mode = 'edit',
  project
}: EditFanoutProps) => {
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    title: mode === 'create' ? '' : (node?.title || node?.name || ''),
    description: mode === 'create' ? '' : (node?.description || ''),
    status: (() => {
      // If creating a task, default to 'TODO'
      if (mode === 'create' && createNode?.type === 'task') {
        return 'TODO';
      }
      // If editing a task, use the node's current status or default to 'TODO'
      if (mode === 'edit' && node?.type === 'task') {
        return node?.status || 'TODO';
      }
      // For other node types, use their status or empty string
      return node?.status || '';
    })(),
    depth: node?.depth ?? 0,
    courseLevel: (() => {
      // If editing, use the node's course level
      if (mode === 'edit' && node?.courseLevel !== undefined) {
        return node.courseLevel;
      }
      // If creating and admin, default to 0 (template)
      if (mode === 'create' && isAdmin()) {
        return node?.courseLevel ?? 0;
      }
      // If creating and non-admin, default to 1
      return node?.courseLevel ?? 1;
    })(),
    selectedUsers: Array.isArray(node?.users) 
      ? node.users.map((user: any) => typeof user === 'string' ? user : user.username)
      : [],
    selectedOwners: mode === 'edit' && node?.type === 'project' && Array.isArray(node?.owners)
      ? node.owners.map((owner: any) => owner.username || owner.name)
      : []
  });

  // UI state
  const [uiState, setUiState] = useState({
    managingOwners: false,
    userSearchTerm: '',
    loading: false
  });

  // Course configuration state
  const [courseConfig, setCourseConfig] = useState<CourseConfig>({
    isTaskUserAssignmentEnabled: true,
    isEpicCreateDeleteEnabled: true,
    isFeatureCreateDeleteEnabled: true,
    isTaskCreateDeleteEnabled: true
  });

  const { showSuccess, showError } = useToast();

  // Update form data when node changes
  useEffect(() => {
    if (mode === 'edit' && node) {
      setFormData({
        title: node.title || node.name || '',
        description: node.description || '',
        status: node.status || (node.type === 'task' ? 'TODO' : ''),
        depth: node.depth ?? 0,
        courseLevel: node.courseLevel ?? 0,
        selectedUsers: Array.isArray(node.users) 
          ? node.users.map((user: any) => typeof user === 'string' ? user : user.username)
          : [],
        selectedOwners: node.type === 'project' && Array.isArray(node.owners)
          ? node.owners.map((owner: any) => owner.username || owner.name)
          : []
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        status: createNode?.type === 'task' ? 'TODO' : '',
        depth: 0,
        courseLevel: isAdmin() ? 0 : 1,
        selectedUsers: [],
        selectedOwners: []
      });
    }
  }, [node, mode, createNode]);

  // Load course level configuration
  useEffect(() => {
    const loadCourseLevelConfig = async () => {
      let projectCourseLevel = null;
      
      if (project?.courseLevel !== undefined && project?.courseLevel !== null) {
        projectCourseLevel = project.courseLevel;
      } else if (node?.type === 'project' && node?.courseLevel !== undefined && node?.courseLevel !== null) {
        projectCourseLevel = node.courseLevel;
      } else if (mode === 'create' && createNode?.type === 'project') {
        projectCourseLevel = formData.courseLevel;
      }
      
      if (projectCourseLevel !== null && projectCourseLevel !== undefined) {
        try {
          const config = await getCourseLevelConfig(projectCourseLevel);
          
          const taskUserFeature = config.features.find((f: any) => f.key === 'TASK_USER_ASSIGNMENT');
          const epicCreateDeleteFeature = config.features.find((f: any) => f.key === 'EPIC_CREATE_DELETE');
          const featureCreateDeleteFeature = config.features.find((f: any) => f.key === 'FEATURE_CREATE_DELETE');
          const taskCreateDeleteFeature = config.features.find((f: any) => f.key === 'TASK_CREATE_DELETE');
          
          setCourseConfig({
            isTaskUserAssignmentEnabled: taskUserFeature ? taskUserFeature.enabled : true,
            isEpicCreateDeleteEnabled: epicCreateDeleteFeature ? epicCreateDeleteFeature.enabled : true,
            isFeatureCreateDeleteEnabled: featureCreateDeleteFeature ? featureCreateDeleteFeature.enabled : true,
            isTaskCreateDeleteEnabled: taskCreateDeleteFeature ? taskCreateDeleteFeature.enabled : true
          });
        } catch (error) {
          console.error('Failed to load course level config:', error);
          setCourseConfig({
            isTaskUserAssignmentEnabled: true,
            isEpicCreateDeleteEnabled: true,
            isFeatureCreateDeleteEnabled: true,
            isTaskCreateDeleteEnabled: true
          });
        }
      }
    };
    
    loadCourseLevelConfig();
  }, [project, node, mode, createNode, formData.courseLevel]);

  // Helper function to check permissions
  const canCreateDelete = (nodeType: string): boolean => {
    switch (nodeType) {
      case 'epic': return courseConfig.isEpicCreateDeleteEnabled;
      case 'feature': return courseConfig.isFeatureCreateDeleteEnabled;
      case 'task': return courseConfig.isTaskCreateDeleteEnabled;
      default: return true;
    }
  };

  // Update form data
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Update UI state
  const updateUiState = (updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };

  // Owner management functions
  const handleAddOwner = async (username: string) => {
    if (!node || node.type !== 'project') return;
    
    try {
      setUiState(prev => ({ ...prev, loading: true }));
      await addUserToProject(node.id || node.projectId, username);
      updateFormData({ 
        selectedOwners: [...formData.selectedOwners, username] 
      });
      showSuccess(`User "${username}" successfully added to the project!`);
      
      if (node.owners) {
        node.owners.push({ username });
      }
    } catch (error: any) {
      console.error('Error adding owner:', error);
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('not found') || 
          errorMessage.toLowerCase().includes('does not exist') ||
          errorMessage.toLowerCase().includes('user with username')) {
        showError(`User "${username}" not found. Please check the username and try again.`);
      } else {
        showError(`Error adding owner: ${errorMessage}`);
      }
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRemoveOwner = async (username: string) => {
    if (!node || node.type !== 'project') return;
    
    try {
      setUiState(prev => ({ ...prev, loading: true }));
      await removeUserFromProject(node.id || node.projectId, username);
      updateFormData({ 
        selectedOwners: formData.selectedOwners.filter(u => u !== username) 
      });
      showSuccess(`User "${username}" removed from the project`);
      
      if (project && node.owners) {
        node.owners = node.owners.filter((owner: any) => 
          (owner.username || owner.name) !== username
        );
      }
    } catch (error: any) {
      console.error('Error removing owner:', error);
      showError(`Error removing owner: ${error.message}`);
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Main save function
  const handleSave = async () => {
    try {
      setUiState(prev => ({ ...prev, loading: true }));
      
      if (mode === 'create' && createNode) {
        if (createNode.type && !canCreateDelete(createNode.type)) {
          showError(`You don't have permission to create ${createNode.type}s in this course level.`);
          setUiState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        await addNode(
          createNode.type,
          createNode.parentIds,
          formData.title,
          formData.description,
          createNode.type === 'project' ? formData.courseLevel : undefined
        );
        
        onSave?.();
        onClose();
      } else if (mode === 'edit' && node) {
        const changedTitle = formData.title !== (node.title || node.name || '');
        const changedDescription = formData.description !== (node.description || '');
        const changedCourseLevel = node.type === 'project' && formData.courseLevel !== (node.courseLevel ?? 0);

        let data: any = {};
        if (changedTitle) data.title = formData.title;
        if (changedDescription) data.description = formData.description;
        if (changedCourseLevel) data.courseLevel = formData.courseLevel;

        data.type = node.type;
        if (node.type === 'project') data.id = node.id || node.projectId;
        if (node.type === 'epic') data.id = node.id || node.epicId;
        if (node.type === 'feature') data.id = node.id || node.featureId;
        if (node.type === 'task') data.id = node.id || node.taskId;

        if (node.type === 'task') {
          const changedStatus = formData.status !== (node.status || '');
          const changedDepth = formData.depth !== (node.depth ?? 0);
          const nodeUsernames = (node.users || []).map((user: any) => 
            typeof user === 'string' ? user : user.username
          );
          const changedUsers = JSON.stringify(formData.selectedUsers.sort()) !== JSON.stringify(nodeUsernames.sort());

          if (changedStatus) data.status = formData.status;
          if (changedDepth) data.depth = formData.depth;
          if (changedUsers) data.users = formData.selectedUsers;
        }

        const parentIds = {
          projectId: node.projectId || node.id || node.parentProjectId,
          epicId: node.epicId || node.parentEpicId,
          featureId: node.featureId || node.parentFeatureId,
        };

        const changedKeys = Object.keys(data).filter(k => k !== 'id' && k !== 'type');
        if (changedKeys.length > 0) {
          await updateNode(data, parentIds);
        }

        onSave?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showError(`Error: ${error.message}`);
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Delete function
  const handleDelete = async () => {
    if (!node) return;
    
    if (node.type && !canCreateDelete(node.type)) {
      showError(`You don't have permission to delete ${node.type}s in this course level.`);
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${node.type}?`);
    if (!confirmDelete) return;

    try {
      setUiState(prev => ({ ...prev, loading: true }));
      
      let parentIds: any = {
        projectId: node.projectId
      };

      if (node.type === 'feature') {
        parentIds.epicId = node.epicId;
      } else if (node.type === 'task') {
        parentIds.epicId = node.epicId;
        parentIds.featureId = node.featureId;
      }

      await deleteNode(node, parentIds);
      showSuccess(`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} deleted successfully`);
      onSave?.();
      onClose();
    } catch (error: any) {
      console.error('Delete error:', error);
      showError(`Error deleting ${node.type}: ${error.message}`);
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  // Add child function
  const handleAddChild = () => {
    if (!node) return;

    let nodeType = '';
    let parentIds: any = {};

    if (node.type === 'project') {
      nodeType = 'epic';
      parentIds = { projectId: node.id || node.projectId };
    } else if (node.type === 'epic') {
      nodeType = 'feature';
      parentIds = { 
        projectId: node.projectId, 
        epicId: node.id || node.epicId
      };
    } else if (node.type === 'feature') {
      nodeType = 'task';
      parentIds = { 
        projectId: node.projectId,
        epicId: node.epicId,
        featureId: node.id || node.featureId
      };
    } else {
      return;
    }

    onClose();
    setTimeout(() => {
      if (onSave) {
        onSave({ 
          action: 'create', 
          nodeType, 
          parentIds, 
          parentNode: node 
        });
      }
    }, 100);
  };

  // Get node type helper
  const getNodeType = () => {
    if (createNode) return createNode.type;
    if (node) return node.type;
    return '';
  };

  return {
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
  };
};