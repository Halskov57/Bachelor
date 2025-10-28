export interface NodeData {
  type: 'project' | 'epic' | 'feature' | 'task';
  id?: string;
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | string;
  userIds?: string[];
  courseLevel?: number;
  projectId?: string;
  epicId?: string;
  featureId?: string;

  // Recursive children
  children?: NodeData[];

  // For tree collapse state
  _collapsed?: boolean;
}


// ----------------------
// --- User
// ----------------------
export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
}

// ----------------------
// --- Project
// ----------------------
export interface Project {
  id: string;
  title: string;
  description?: string;
  courseLevel?: number;
  isTemplate?: boolean;

  // Use IDs only to avoid circular references
  epicIds?: string[];
}

// ----------------------
// --- Epic
// ----------------------
export interface Epic {
  id: string;
  title: string;
  description?: string;
  projectId: string;

  // Use IDs only
  featureIds?: string[];
}

// ----------------------
// --- Feature
// ----------------------
export interface Feature {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  epicId: string;
  task: Task[];

  // Use IDs only
  taskIds?: string[];
}

// ----------------------
// --- Task
// ----------------------
export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | string;
  projectId: string;
  epicId: string;
  featureId: string;

  // Use IDs only
  userIds?: string[];
}

// ----------------------
// --- Feature Config for Course Level
// ----------------------
export interface FeatureConfig {
  key: string;
  enabled: boolean;
}

// ----------------------
// --- Course Level Config
// ----------------------
export interface CourseLevelConfig {
  id: string;
  courseLevel: number;
  features: FeatureConfig[];
  templateProject?: Project;
}
