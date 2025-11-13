// Re-export types from utils for consistency
export type { 
  User, 
  Project, 
  Epic, 
  Feature, 
  Task 
} from '../../../utils/types';

export interface CreateNodeData {
  type: string;
  parentIds: {
    projectId?: string;
    epicId?: string;
    featureId?: string;
  };
  parentNode?: any;
}

export interface EditFanoutProps {
  node?: any; 
  createNode?: CreateNodeData;
  onClose: () => void; 
  onSave?: (data?: any) => void; 
  mode?: 'edit' | 'create';
  project?: any;
}

export interface FormData {
  title: string;
  description: string;
  status: string;
  courseLevel: number;
  selectedUsers: string[];
  selectedOwners: string[];
}

export interface CourseConfig {
  isTaskUserAssignmentEnabled: boolean;
  isEpicCreateDeleteEnabled: boolean;
  isFeatureCreateDeleteEnabled: boolean;
  isTaskCreateDeleteEnabled: boolean;
}

export interface EditFanoutState extends FormData {
  managingOwners: boolean;
  userSearchTerm: string;
  loading: boolean;
}

export interface UserManagementProps {
  type: 'owners' | 'assignees';
  selectedUsers: string[];
  onAdd: (username: string) => Promise<void>;
  onRemove: (username: string) => Promise<void>;
  canManage?: boolean;
  loading?: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isManaging: boolean;
  onToggleManaging: () => void;
  project?: any;
}

export interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export interface FormComponentProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  courseConfig: CourseConfig;
  mode?: 'edit' | 'create';
  project?: any;
  node?: any;
  createNode?: CreateNodeData;
  loading?: boolean;
}

export interface ActionsProps {
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onAddChild?: () => void;
  onClose: () => void;
  loading: boolean;
  mode?: 'edit' | 'create';
  showAddButton: boolean;
  showDeleteButton: boolean;
  nodeType?: string;
}

export type NodeType = 'project' | 'epic' | 'feature' | 'task';