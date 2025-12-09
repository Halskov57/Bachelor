import { gql } from '@apollo/client';
import { client } from './apolloClientSetup';
import { User, Project, CourseLevelConfig } from './types';
import { getCurrentUsername } from './jwt';
import { getGraphQLUrl } from '../config/environment';

// Helper function to check for authorization errors and redirect to login
const handleAuthError = (error: any) => {
  const errorMessage = error?.message || '';
  if (errorMessage.includes('Access denied') || 
      errorMessage.includes('not authorized') || 
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('User not authenticated')) {
    alert('Your session has expired or you do not have access. Redirecting to login...');
    localStorage.removeItem('token');
    window.location.href = '/';
    return true;
  }
  return false;
};

// --- GraphQL Queries and Mutations ---

export const UPDATE_COURSE_LEVEL_CONFIG_MUTATION = gql`
  mutation UpdateCourseLevelConfig($courseLevel: Int!, $features: [FeatureConfigInput!]!) {
    updateCourseLevelConfig(courseLevel: $courseLevel, features: $features) {
      id
      courseLevel
      features {
        key
        enabled
      }
      templateProject {
        id
        title
        description
      }
    }
  }
`;

export const GET_ALL_NON_SUPER_ADMIN_USERS_QUERY = gql`
  query GetAllNonSuperAdminUsers {
    nonSuperAdminUsers {
      id
      username
      role
    }
  }
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($username: String!, $newRole: String!) {
    updateUserRole(username: $username, newRole: $newRole) {
      id
      username
      role
    }
  }
`;

export const SET_TEMPLATE_PROJECT_MUTATION = gql`
  mutation SetTemplateProject($courseLevel: Int!, $projectId: ID!) {
    setTemplateProject(courseLevel: $courseLevel, projectId: $projectId) {
      id
      courseLevel
      features {
        key
        enabled
      }
      templateProject {
        id
        title
        description
      }
    }
  }
`;

export const GET_PROJECTS_BY_CURRENT_USER_QUERY = gql`
  query ProjectsByUsername($username: String!) {
    projectsByUsername(username: $username) {
      id
      title
      description
      courseLevel
    }
  }
`;

// ===== PROJECT MUTATIONS =====

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      title
      description
      courseLevel
    }
  }
`;

// ===== EPIC MUTATIONS =====

export const UPDATE_EPIC_MUTATION = gql`
  mutation UpdateEpic($projectId: ID!, $epicId: ID!, $input: EpicInput!) {
    updateEpic(projectId: $projectId, epicId: $epicId, input: $input) {
      id
      title
      description
    }
  }
`;

export const CREATE_EPIC_MUTATION = gql`
  mutation CreateEpic($projectId: ID!, $input: CreateEpicInput!) {
    createEpic(projectId: $projectId, input: $input) {
      id
      title
      description
    }
  }
`;

export const DELETE_EPIC_MUTATION = gql`
  mutation DeleteEpic($projectId: ID!, $epicId: ID!) {
    deleteEpic(projectId: $projectId, epicId: $epicId)
  }
`;

// ===== FEATURE MUTATIONS =====

export const UPDATE_FEATURE_MUTATION = gql`
  mutation UpdateFeature($projectId: ID!, $epicId: ID!, $featureId: ID!, $input: FeatureInput!) {
    updateFeature(projectId: $projectId, epicId: $epicId, featureId: $featureId, input: $input) {
      id
      title
      description
    }
  }
`;

export const CREATE_FEATURE_MUTATION = gql`
  mutation CreateFeature($projectId: ID!, $epicId: ID!, $input: CreateFeatureInput!) {
    createFeature(projectId: $projectId, epicId: $epicId, input: $input) {
      id
      title
      description
    }
  }
`;

export const DELETE_FEATURE_MUTATION = gql`
  mutation DeleteFeature($projectId: ID!, $epicId: ID!, $featureId: ID!) {
    deleteFeature(projectId: $projectId, epicId: $epicId, featureId: $featureId)
  }
`;

// ===== TASK MUTATIONS =====

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $input: TaskInput!) {
    updateTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, input: $input) {
      id
      title
      description
      status
      dueDate
      users {
        id
        username
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($projectId: ID!, $epicId: ID!, $featureId: ID!, $input: CreateTaskInput!) {
    createTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, input: $input) {
      id
      title
      description
      status
      dueDate
      users {
        id
        username
      }
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!) {
    deleteTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId)
  }
`;

// --- Project By ID Query ---

export const GET_PROJECT_BY_ID_QUERY = gql`
  query ProjectById($id: ID!) {
    projectById(id: $id) {
      id
      title
      description
      courseLevel
      owners {
        id
        username
      }
      epics {
        id
        title
        description
        features {
          id
          title
          description
          courseLevel
          tasks {
            id
            title
            description
            status
            dueDate
            users {
              id
              username
            }
          }
        }
      }
    }
  }
`;

// --- Utility Functions ---

export async function getCourseLevelConfig(courseLevel: number) {
  const query = `
    query($courseLevel: Int!) {
      courseLevelConfig(courseLevel: $courseLevel) {
        id
        courseLevel
        features {
          key
          enabled
        }
        templateProject {
          id
          title
          description
        }
      }
    }
  `;
    const variables = { courseLevel };
  
  const res = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query, variables }),
  });
  
  const json = await res.json();
  
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }
  
  return json.data.courseLevelConfig;
}

export const updateCourseLevelConfig = async (courseLevel: number, features: any[]): Promise<CourseLevelConfig> => {
  const result = await client.mutate<{ updateCourseLevelConfig: CourseLevelConfig }>({
    mutation: UPDATE_COURSE_LEVEL_CONFIG_MUTATION,
    variables: { courseLevel, features },
  });
  if (!result.data?.updateCourseLevelConfig) throw new Error('Failed to update course level config');
  return result.data.updateCourseLevelConfig;
};

// --- Admin Functions ---

export const getAllNonSuperAdminUsers = async (): Promise<User[]> => {
  const result = await client.query<{ nonSuperAdminUsers: User[] }>({
    query: GET_ALL_NON_SUPER_ADMIN_USERS_QUERY,
  });
  return result.data?.nonSuperAdminUsers ?? [];
};

export const updateUserRole = async (username: string, newRole: string): Promise<User> => {
  const result = await client.mutate<{ updateUserRole: User }>({
    mutation: UPDATE_USER_ROLE_MUTATION,
    variables: { username, newRole },
  });
  if (!result.data?.updateUserRole) throw new Error('Failed to update user role');
  return result.data.updateUserRole;
};

// --- Template Functions (Apollo Client style) ---

// Set a project as the template for a course level
export const setTemplateProject = async (courseLevel: number, projectId: string): Promise<CourseLevelConfig> => {
  const result = await client.mutate<{ setTemplateProject: CourseLevelConfig }>({
    mutation: SET_TEMPLATE_PROJECT_MUTATION,
    variables: { courseLevel, projectId },
  });

  if (!result.data?.setTemplateProject) throw new Error('Failed to set template project');
  return result.data.setTemplateProject;
};

// Create a project from a template
export const createProjectFromTemplate = async (
  courseLevel: number,
  title: string,
  description: string
): Promise<Project> => {
  const mutation = gql`
    mutation CreateProjectFromTemplate($courseLevel: Int!, $title: String!, $description: String!) {
      createProjectFromTemplate(courseLevel: $courseLevel, title: $title, description: $description) {
        id
        title
        description
        courseLevel
      }
    }
  `;

  const result = await client.mutate<{ createProjectFromTemplate: Project }>({
    mutation,
    variables: { courseLevel, title, description },
  });

  if (!result.data?.createProjectFromTemplate) throw new Error('Failed to create project from template');
  return result.data.createProjectFromTemplate;
};

// Get all projects (optionally for admin)
export const getAllProjects = async (): Promise<Project[]> => {
  const query = gql`
    query GetAllProjects {
      projects {
        id
        title
        description
        courseLevel
      }
    }
  `;

  const result = await client.query<{ projects: Project[] }>({ query });
  return result.data?.projects ?? [];
};

export const getProjectsByCurrentUser = async (): Promise<Project[]> => {
  const username = getCurrentUsername();
  if (!username) {
    throw new Error('No username found in token');
  }
  
  const result = await client.query<{ projectsByUsername: Project[] }>({
    query: GET_PROJECTS_BY_CURRENT_USER_QUERY,
    variables: { username },
  });
  return result.data?.projectsByUsername ?? [];
};

// --- Node CRUD Functions ---

export const updateNode = async (data: any, parentIds: any) => {
  try {
    const { type, id, ...input } = data;

    switch (type) {
      case 'project':
        return await client.mutate({
          mutation: UPDATE_PROJECT_MUTATION,
          variables: { id, input }
        });

      case 'epic':
        return await client.mutate({
          mutation: UPDATE_EPIC_MUTATION,
          variables: { 
            projectId: parentIds.projectId, 
            epicId: id, 
            input 
          }
        });

      case 'feature':
        return await client.mutate({
          mutation: UPDATE_FEATURE_MUTATION,
          variables: { 
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            featureId: id,
            input
          }
        });

      case 'task':
        // Convert users array to userIds for TaskInput
        const taskInput = { ...input };
        if (taskInput.users) {
          taskInput.userIds = taskInput.users;
          delete taskInput.users;
        }
        
        return await client.mutate({
          mutation: UPDATE_TASK_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            featureId: parentIds.featureId,
            taskId: id,
            input: taskInput
          }
        });

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  } catch (error: any) {
    // Check for authorization errors
    if (error.graphQLErrors) {
      if (error.graphQLErrors.some((err: any) => handleAuthError(err))) {
        throw new Error('Authentication required');
      }
    }
    throw error;
  }
};

export const addNode = async (
  type: string,
  parentIds: any,
  title: string,
  description: string,
  courseLevel?: number,
  taskData?: { status?: string; dueDate?: string; selectedUsers?: string[] }
) => {
  try {
    switch (type) {
      case 'epic':
        return await client.mutate({
          mutation: CREATE_EPIC_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            input: { title, description }
          }
        });

      case 'feature':
        return await client.mutate({
          mutation: CREATE_FEATURE_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            input: { title, description }
          }
        });

      case 'task':
        const taskInput: any = { 
          title, 
          description, 
          status: taskData?.status || 'TODO' 
        };
        
        // Add optional task fields if provided
        if (taskData?.dueDate) {
          taskInput.dueDate = taskData.dueDate;
        }
        if (taskData?.selectedUsers && taskData.selectedUsers.length > 0) {
          taskInput.userIds = taskData.selectedUsers;
        }
        
        return await client.mutate({
          mutation: CREATE_TASK_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            featureId: parentIds.featureId,
            input: taskInput
          }
        });

      case 'project':
        if (courseLevel === undefined) {
          throw new Error('courseLevel is required when creating a project');
        }
        return await createProjectFromTemplate(courseLevel, title, description);

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  } catch (error: any) {
    // Check for authorization errors
    if (error.graphQLErrors) {
      if (error.graphQLErrors.some((err: any) => handleAuthError(err))) {
        throw new Error('Authentication required');
      }
    }
    throw error;
  }
};

export const deleteNode = async (node: any, parentIds: any) => {
  try {
    const nodeId = node.id || node.epicId || node.featureId || node.taskId;

    switch (node.type) {
      case 'epic':
        return await client.mutate({
          mutation: DELETE_EPIC_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: nodeId
          }
        });

      case 'feature':
        return await client.mutate({
          mutation: DELETE_FEATURE_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            featureId: nodeId
          }
        });

      case 'task':
        return await client.mutate({
          mutation: DELETE_TASK_MUTATION,
          variables: {
            projectId: parentIds.projectId,
            epicId: parentIds.epicId,
            featureId: parentIds.featureId,
            taskId: nodeId
          }
        });

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  } catch (error: any) {
    // Check for authorization errors
    if (error.graphQLErrors) {
      if (error.graphQLErrors.some((err: any) => handleAuthError(err))) {
        throw new Error('Authentication required');
      }
    }
    throw error;
  }
};

// Helper function to get headers with JWT token
const getGraphQLHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function addUserToProject(projectId: string, username: string) {
  const mutation = `
    mutation AddUserToProject($projectId: ID!, $username: String!) {
      addUserToProject(projectId: $projectId, username: $username) {
        id
        title
        owners {
          id
          username
        }
      }
    }
  `;

  const variables = { projectId, username };

  const res = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query: mutation, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    // Check for auth errors and redirect if needed
    if (json.errors.some((err: any) => handleAuthError(err))) {
      throw new Error('Authentication required');
    }
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.addUserToProject;
}

export async function removeUserFromProject(projectId: string, username: string) {
  const mutation = `
    mutation RemoveUserFromProject($projectId: ID!, $username: String!) {
      removeUserFromProject(projectId: $projectId, username: $username) {
        id
        title
        owners {
          id
          username
        }
      }
    }
  `;

  const variables = { projectId, username };

  const res = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query: mutation, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    // Check for auth errors and redirect if needed
    if (json.errors.some((err: any) => handleAuthError(err))) {
      throw new Error('Authentication required');
    }
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.removeUserFromProject;
}
