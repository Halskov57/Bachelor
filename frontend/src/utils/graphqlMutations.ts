import { gql } from '@apollo/client';
import { client } from './apolloClientSetup';
import { User, Project, CourseLevelConfig } from './types';

// --- GraphQL Queries and Mutations ---

export const GET_COURSE_LEVEL_CONFIG_QUERY = gql`
  query GetCourseLevelConfig($courseLevel: Int!) {
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
        courseLevel
      }
    }
  }
`;

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
  mutation UpdateUserRole($userId: ID!, $newRole: UserRole!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      id
      name
      email
      role
    }
  }
`;

export const SET_TEMPLATE_PROJECT_MUTATION = gql`
  mutation SetTemplateProject($projectId: ID!) {
    setTemplateProject(projectId: $projectId) {
      id
      title
      isTemplate
    }
  }
`;

export const GET_PROJECTS_BY_CURRENT_USER_QUERY = gql`
  query GetProjectsByCurrentUser {
    projectsByCurrentUser {
      id
      title
      description
      courseLevel
    }
  }
`;

// --- Node CRUD Mutations ---
export const ADD_EPIC_MUTATION = gql`
  mutation AddEpic($projectId: ID!, $title: String!, $description: String!) {
    addEpic(projectId: $projectId, title: $title, description: $description) {
      id
      title
      description
    }
  }
`;

export const ADD_FEATURE_MUTATION = gql`
  mutation AddFeature($projectId: ID!, $epicId: ID!, $title: String!, $description: String!) {
    addFeature(projectId: $projectId, epicId: $epicId, title: $title, description: $description) {
      id
      title
      description
    }
  }
`;

export const ADD_TASK_MUTATION = gql`
  mutation AddTask($projectId: ID!, $epicId: ID!, $featureId: ID!, $title: String!, $description: String!) {
    addTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, title: $title, description: $description) {
      id
      title
      description
      status
    }
  }
`;

export const ADD_PROJECT_MUTATION = gql`
  mutation AddProject($title: String!, $description: String!, $courseLevel: Int!) {
    addProject(title: $title, description: $description, courseLevel: $courseLevel) {
      id
      title
      description
      courseLevel
    }
  }
`;

export const UPDATE_PROJECT_TITLE_MUTATION = gql`
  mutation UpdateProjectTitle($projectId: ID!, $newTitle: String!) {
    updateProjectTitle(projectId: $projectId, newTitle: $newTitle) {
      id
      title
    }
  }
`;

export const UPDATE_PROJECT_DESCRIPTION_MUTATION = gql`
  mutation UpdateProjectDescription($projectId: ID!, $newDescription: String!) {
    updateProjectDescription(projectId: $projectId, newDescription: $newDescription) {
      id
      description
    }
  }
`;

export const UPDATE_PROJECT_COURSE_LEVEL_MUTATION = gql`
  mutation UpdateProjectCourseLevel($projectId: ID!, $newCourseLevel: Int!) {
    updateProjectCourseLevel(projectId: $projectId, newCourseLevel: $newCourseLevel) {
      id
      courseLevel
    }
  }
`;

export const UPDATE_EPIC_TITLE_MUTATION = gql`
  mutation UpdateEpicTitle($projectId: ID!, $epicId: ID!, $newTitle: String!) {
    updateEpicTitle(projectId: $projectId, epicId: $epicId, newTitle: $newTitle) {
      id
      title
    }
  }
`;

export const UPDATE_EPIC_DESCRIPTION_MUTATION = gql`
  mutation UpdateEpicDescription($projectId: ID!, $epicId: ID!, $newDescription: String!) {
    updateEpicDescription(projectId: $projectId, epicId: $epicId, newDescription: $newDescription) {
      id
      description
    }
  }
`;

export const UPDATE_FEATURE_TITLE_MUTATION = gql`
  mutation UpdateFeatureTitle($projectId: ID!, $epicId: ID!, $featureId: ID!, $newTitle: String!) {
    updateFeatureTitle(projectId: $projectId, epicId: $epicId, featureId: $featureId, newTitle: $newTitle) {
      id
      title
    }
  }
`;

export const UPDATE_FEATURE_DESCRIPTION_MUTATION = gql`
  mutation UpdateFeatureDescription($projectId: ID!, $epicId: ID!, $featureId: ID!, $newDescription: String!) {
    updateFeatureDescription(projectId: $projectId, epicId: $epicId, featureId: $featureId, newDescription: $newDescription) {
      id
      description
    }
  }
`;

export const UPDATE_TASK_TITLE_MUTATION = gql`
  mutation UpdateTaskTitle($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newTitle: String!) {
    updateTaskTitle(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newTitle: $newTitle) {
      id
      title
    }
  }
`;

export const UPDATE_TASK_DESCRIPTION_MUTATION = gql`
  mutation UpdateTaskDescription($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newDescription: String!) {
    updateTaskDescription(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newDescription: $newDescription) {
      id
      description
    }
  }
`;

export const UPDATE_TASK_STATUS_MUTATION = gql`
  mutation UpdateTaskStatus($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newStatus: String!) {
    updateTaskStatus(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newStatus: $newStatus) {
      id
      status
    }
  }
`;

export const UPDATE_TASK_USERS_MUTATION = gql`
  mutation UpdateTaskUsers($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $userIds: [ID!]!) {
    updateTaskUsers(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, userIds: $userIds) {
      id
      users {
        id
        username
      }
    }
  }
`;

// --- Delete Mutations ---

export const DELETE_EPIC_MUTATION = gql`
  mutation DeleteEpic($projectId: ID!, $epicId: ID!) {
    deleteEpic(projectId: $projectId, epicId: $epicId)
  }
`;

export const DELETE_FEATURE_MUTATION = gql`
  mutation DeleteFeature($projectId: ID!, $epicId: ID!, $featureId: ID!) {
    deleteFeature(projectId: $projectId, epicId: $epicId, featureId: $featureId)
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
      epics {
        id
        title
        description
        features {
          id
          title
          description
          courseLevel
        }
      }
    `;
    
    variables = { 
      courseLevel: courseLevel !== undefined ? courseLevel : 1,
      title,
      description: description || ''
    };
    
    return await runMutation(mutation, variables);
  } else if (nodeType === 'epic') {
    mutation = `
      mutation($projectId: ID!, $title: String!, $description: String) {
        addEpic(projectId: $projectId, title: $title, description: $description) {
          id title description
          tasks {
            id
            title
            description
            status
          }
        }
      }
    }
  }
`;

// --- Utility Functions ---

export const getCourseLevelConfig = async (courseLevel: number): Promise<CourseLevelConfig | null> => {
  const result = await client.query<{ courseLevelConfig: CourseLevelConfig }>({
    query: GET_COURSE_LEVEL_CONFIG_QUERY,
    variables: { courseLevel },
  });
  return result.data?.courseLevelConfig ?? null;
};

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

export const updateUserRole = async (userId: string, newRole: string): Promise<User> => {
  const result = await client.mutate<{ updateUserRole: User }>({
    mutation: UPDATE_USER_ROLE_MUTATION,
    variables: { userId, newRole },
  });
  if (!result.data?.updateUserRole) throw new Error('Failed to update user role');
  return result.data.updateUserRole;
};

// --- Template Functions (Apollo Client style) ---

// Set a project as the template for a course level
export const setTemplateProject = async (courseLevel: number, projectId: string): Promise<Project> => {
  const mutation = gql`
    mutation SetTemplateProject($courseLevel: Int!, $projectId: ID!) {
      setTemplateProject(courseLevel: $courseLevel, projectId: $projectId) {
        id
        title
        description
      }
    }
  `;

  const result = await client.mutate<{ setTemplateProject: Project }>({
    mutation,
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
  const result = await client.query<{ projectsByCurrentUser: Project[] }>({
    query: GET_PROJECTS_BY_CURRENT_USER_QUERY,
  });
  return result.data?.projectsByCurrentUser ?? [];
};

// --- Node CRUD Functions ---

export const updateNode = async (data: any, parentIds: any) => {
  switch (data.type) {
    case 'project':
      if (data.title) await client.mutate({ mutation: UPDATE_PROJECT_TITLE_MUTATION, variables: { projectId: data.id, newTitle: data.title } });
      if (data.description) await client.mutate({ mutation: UPDATE_PROJECT_DESCRIPTION_MUTATION, variables: { projectId: data.id, newDescription: data.description } });
      if (data.courseLevel) await client.mutate({ mutation: UPDATE_PROJECT_COURSE_LEVEL_MUTATION, variables: { projectId: data.id, newCourseLevel: data.courseLevel } });
      break;
    case 'epic':
      if (data.title) await client.mutate({ mutation: UPDATE_EPIC_TITLE_MUTATION, variables: { projectId: parentIds.projectId, epicId: data.id, newTitle: data.title } });
      if (data.description) await client.mutate({ mutation: UPDATE_EPIC_DESCRIPTION_MUTATION, variables: { projectId: parentIds.projectId, epicId: data.id, newDescription: data.description } });
      break;
    case 'feature':
      if (data.title) await client.mutate({ mutation: UPDATE_FEATURE_TITLE_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: data.id, newTitle: data.title } });
      if (data.description) await client.mutate({ mutation: UPDATE_FEATURE_DESCRIPTION_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: data.id, newDescription: data.description } });
      break;
    case 'task':
      if (data.title) await client.mutate({ mutation: UPDATE_TASK_TITLE_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, taskId: data.id, newTitle: data.title } });
      if (data.description) await client.mutate({ mutation: UPDATE_TASK_DESCRIPTION_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, taskId: data.id, newDescription: data.description } });
      if (data.status) await client.mutate({ mutation: UPDATE_TASK_STATUS_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, taskId: data.id, newStatus: data.status } });
      if (data.users) await client.mutate({ mutation: UPDATE_TASK_USERS_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, taskId: data.id, userIds: data.users } });
      break;
    default:
      throw new Error(`Unknown node type: ${data.type}`);
  }
};

export const addNode = async (
  type: string,
  parentIds: any,
  title: string,
  description: string,
  courseLevel?: number // <-- add optional argument
) => {
  switch (type) {
    case 'epic':
      return await client.mutate({
        mutation: ADD_EPIC_MUTATION,
        variables: { projectId: parentIds.projectId, title, description },
      });
    case 'feature':
      return await client.mutate({
        mutation: ADD_FEATURE_MUTATION,
        variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, title, description },
      });
    case 'task':
      return await client.mutate({
        mutation: ADD_TASK_MUTATION,
        variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, title, description },
      });
    case 'project':
      if (courseLevel === undefined) {
        throw new Error('courseLevel is required when creating a project');
      }
      return await client.mutate({
        mutation: ADD_PROJECT_MUTATION, // Make sure you have this mutation defined
        variables: { title, description, courseLevel },
      });
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};

export const deleteNode = async (node: any, parentIds: any) => {
  switch (node.type) {
    case 'epic':
      return await client.mutate({ mutation: DELETE_EPIC_MUTATION, variables: { projectId: parentIds.projectId, epicId: node.id } });
    case 'feature':
      return await client.mutate({ mutation: DELETE_FEATURE_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: node.id } });
    case 'task':
      return await client.mutate({ mutation: DELETE_TASK_MUTATION, variables: { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: parentIds.featureId, taskId: node.id } });
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  const res = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.projects;
}

export async function getProjectsByCurrentUser() {
  const query = `
    query {
      projectsByUsername(username: "${getCurrentUsername()}") {
        id
        title
        description
        courseLevel
        owners {
          id
          username
        }
      }
    }
  `;

  const res = await fetch(getGraphQLUrl(), {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.projectsByUsername;
}

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
    console.error('GraphQL errors:', json.errors);
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
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.removeUserFromProject;
}

// Helper function to get current username from JWT
function getCurrentUsername(): string {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.username;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
