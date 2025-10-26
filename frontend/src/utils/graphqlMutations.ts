import { getGraphQLUrl, getApiUrl } from '../config/environment';

// Helper function to get headers with JWT token
function getGraphQLHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Course Level Config mutations
export async function updateCourseLevelConfig(
  courseLevel: number, 
  features: { key: string; enabled: boolean }[]
) {
  const mutation = `
    mutation($courseLevel: Int!, $features: [FeatureConfigInput!]!) {
      updateCourseLevelConfig(courseLevel: $courseLevel, features: $features) {
        id
        courseLevel
        features {
          key
          enabled
        }
      }
    }
  `;
  
  const variables = { courseLevel, features };
  
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
  
  return json.data.updateCourseLevelConfig;
}

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
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }
  
  return json.data.courseLevelConfig;
}

export async function getAllCourseLevelConfigs() {
  const query = `
    query {
      allCourseLevelConfigs {
        id
        courseLevel
        features {
          key
          enabled
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
  
  return json.data.allCourseLevelConfigs;
}

export async function updateNode(node: any, parentIds: any) {
  let results = {};

  // Helper to run a mutation
  async function runMutation(mutation: string, variables: any) {
    console.log('runMutation called with:', { mutation, variables });
    
    const res = await fetch(getGraphQLUrl(), {
      method: 'POST',
      headers: getGraphQLHeaders(),
      body: JSON.stringify({ query: mutation, variables }),
    });
    
    console.log('GraphQL response status:', res.status);
    const json = await res.json();
    console.log('GraphQL response:', json);
    console.log('GraphQL response data:', json.data);
    console.log('GraphQL response data values:', json.data && Object.values(json.data));
    
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }
    
    return json.data && Object.values(json.data)[0];
  }

  if (node.type === 'project') {
    let didUpdate = false;
    // Update title if changed
    if (node.title !== undefined) {
      const mutation = `
        mutation($projectId: ID!, $newTitle: String!) {
          updateProjectTitle(projectId: $projectId, newTitle: $newTitle) {
            id title description
          }
        }
      `;
      const variables = { projectId: node.id, newTitle: node.title };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    // Update description if changed
    if (node.description !== undefined) {
      const mutation = `
        mutation($projectId: ID!, $newDescription: String!) {
          updateProjectDescription(projectId: $projectId, newDescription: $newDescription) {
            id title description
          }
        }
      `;
      const variables = { projectId: node.id, newDescription: node.description };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    // Update course level if changed
    if (node.courseLevel !== undefined) {
      const mutation = `
        mutation($projectId: ID!, $newCourseLevel: Int!) {
          updateProjectCourseLevel(projectId: $projectId, newCourseLevel: $newCourseLevel) {
            id title description courseLevel
          }
        }
      `;
      const variables = { projectId: node.id, newCourseLevel: node.courseLevel };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (!didUpdate) {
      throw new Error('No valid mutation for node type/fields');
    }
    return results;
  }

  // For epic, feature, task
  let mutation = '';
  let variables: any = {};
  let didUpdate = false;

  if (node.type === 'epic') {
    console.log('Epic updateNode:', { node, parentIds });
    if (node.title !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $newTitle: String!) {
          updateEpicTitle(projectId: $projectId, epicId: $epicId, newTitle: $newTitle) {
            id title description
          }
        }
      `;
      variables = { 
        projectId: parentIds.projectId, 
        epicId: node.id, 
        newTitle: node.title 
      };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (node.description !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $newDescription: String!) {
          updateEpicDescription(projectId: $projectId, epicId: $epicId, newDescription: $newDescription) {
            id title description
          }
        }
      `;
      variables = { projectId: parentIds.projectId, epicId: node.id, newDescription: node.description };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
  } else if (node.type === 'feature') {
    if (node.title !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $newTitle: String!) {
          updateFeatureTitle(projectId: $projectId, epicId: $epicId, featureId: $featureId, newTitle: $newTitle) {
            id title description
          }
        }
      `;
      variables = { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: node.id, newTitle: node.title };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (node.description !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $newDescription: String!) {
          updateFeatureDescription(projectId: $projectId, epicId: $epicId, featureId: $featureId, newDescription: $newDescription) {
            id title description
          }
        }
      `;
      variables = { projectId: parentIds.projectId, epicId: parentIds.epicId, featureId: node.id, newDescription: node.description };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
  } else if (node.type === 'task') {
    if (node.title !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newTitle: String!) {
          updateTaskTitle(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newTitle: $newTitle) {
            id title description status
          }
        }
      `;
      variables = {
        projectId: parentIds.projectId,
        epicId: parentIds.epicId,
        featureId: parentIds.featureId,
        taskId: node.id,
        newTitle: node.title,
      };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (node.description !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newDescription: String!) {
          updateTaskDescription(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newDescription: $newDescription) {
            id title description status
          }
        }
      `;
      variables = {
        projectId: parentIds.projectId,
        epicId: parentIds.epicId,
        featureId: parentIds.featureId,
        taskId: node.id,
        newDescription: node.description,
      };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (node.status !== undefined) {
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $newStatus: String!) {
          updateTaskStatus(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, newStatus: $newStatus) {
            id title description status
          }
        }
      `;
      variables = {
        projectId: parentIds.projectId,
        epicId: parentIds.epicId,
        featureId: parentIds.featureId,
        taskId: node.id,
        newStatus: node.status,
      };
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
    if (node.users !== undefined) {
      console.log('updateTaskUsers - node.users:', node.users);
      console.log('updateTaskUsers - parentIds:', parentIds);
      
      mutation = `
        mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!, $userIds: [ID!]!) {
          updateTaskUsers(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId, userIds: $userIds) {
            id title description users {
              id username
            }
          }
        }
      `;
      variables = {
        projectId: parentIds.projectId,
        epicId: parentIds.epicId,
        featureId: parentIds.featureId,
        taskId: node.id,
        userIds: node.users,
      };
      console.log('updateTaskUsers - variables:', variables);
      results = await runMutation(mutation, variables);
      didUpdate = true;
    }
  }

  if (!didUpdate) throw new Error('No valid mutation for node type/fields');
  return results;
}

export async function deleteNode(node: any, parentIds: any) {
  // Helper to run a mutation
  async function runMutation(mutation: string, variables: any) {
    console.log('=== DELETE NODE DEBUG ===');
    console.log('Node:', node);
    console.log('Parent IDs:', parentIds);
    console.log('Variables being sent:', variables);
    
    const res = await fetch(getGraphQLUrl(), {
      method: 'POST',
      headers: getGraphQLHeaders(),
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = await res.json();
    
    console.log('Response:', json);
    
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0].message);
    }
    return json.data && Object.values(json.data)[0];
  }

  let mutation = '';
  let variables: any = {};

  if (node.type === 'epic') {
    mutation = `
      mutation($projectId: ID!, $epicId: ID!) {
        deleteEpic(projectId: $projectId, epicId: $epicId)
      }
    `;
    variables = { 
      projectId: parentIds.projectId, 
      epicId: node.id 
    };
  } else if (node.type === 'feature') {
    const featureId = node.id;
    const epicId = parentIds.epicId;
    const projectId = parentIds.projectId;
    
    console.log('Feature deletion - extracted IDs:', {
      featureId,
      epicId, 
      projectId
    });
    
    if (!featureId) {
      throw new Error(`Feature ID is null/undefined. Node: ${JSON.stringify(node)}`);
    }
    if (!epicId) {
      throw new Error(`Epic ID is null/undefined. ParentIds: ${JSON.stringify(parentIds)}`);
    }
    if (!projectId) {
      throw new Error(`Project ID is null/undefined. ParentIds: ${JSON.stringify(parentIds)}`);
    }
    
    mutation = `
      mutation($projectId: ID!, $epicId: ID!, $featureId: ID!) {
        deleteFeature(projectId: $projectId, epicId: $epicId, featureId: $featureId)
      }
    `;
    variables = { 
      projectId, 
      epicId, 
      featureId 
    };
  } else if (node.type === 'task') {
    mutation = `
      mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $taskId: ID!) {
        deleteTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, taskId: $taskId)
      }
    `;
    variables = {
      projectId: parentIds.projectId,
      epicId: parentIds.epicId,
      featureId: parentIds.featureId,
      taskId: node.id,
    };
  } else {
    throw new Error(`Delete not supported for node type: ${node.type}`);
  }

  return await runMutation(mutation, variables);
}

// Update addNode function with better logging

export async function addNode(nodeType: string, parentIds: any, title: string, description?: string, courseLevel?: number) {
  console.log('addNode called with:', { nodeType, parentIds, title, description, courseLevel });
  
  // Helper to run a mutation
  async function runMutation(mutation: string, variables: any) {
    console.log('Running mutation:', { mutation, variables });
    
    const res = await fetch(getGraphQLUrl(), {
      method: 'POST',
      headers: getGraphQLHeaders(),
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = await res.json();
    console.log('Mutation response:', json);
    
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      throw new Error(json.errors[0].message);
    }
    return json.data && Object.values(json.data)[0];
  }

  let mutation = '';
  let variables: any = {};

  if (nodeType === 'project') {
    // Use the createProjectFromTemplate GraphQL mutation which handles templates
    const mutation = `
      mutation($courseLevel: Int!, $title: String!, $description: String!) {
        createProjectFromTemplate(courseLevel: $courseLevel, title: $title, description: $description) {
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
        }
      }
    `;
    variables = { 
      projectId: parentIds.projectId, 
      title: title,
      description: description || ''
    };
  } else if (nodeType === 'feature') {
    mutation = `
      mutation($projectId: ID!, $epicId: ID!, $title: String!, $description: String) {
        addFeature(projectId: $projectId, epicId: $epicId, title: $title, description: $description) {
          id title description
        }
      }
    `;
    variables = { 
      projectId: parentIds.projectId, 
      epicId: parentIds.epicId, 
      title: title,
      description: description || ''
    };
  } else if (nodeType === 'task') {
    mutation = `
      mutation($projectId: ID!, $epicId: ID!, $featureId: ID!, $title: String!, $description: String) {
        addTask(projectId: $projectId, epicId: $epicId, featureId: $featureId, title: $title, description: $description) {
          id title description status
        }
      }
    `;
    variables = {
      projectId: parentIds.projectId,
      epicId: parentIds.epicId,
      featureId: parentIds.featureId,
      title: title,
      description: description || ''
    };
  } else {
    throw new Error(`Add not supported for node type: ${nodeType}`);
  }

  return await runMutation(mutation, variables);
}

// User management functions
export async function getAllNonSuperAdminUsers() {
  const query = `
    query {
      nonSuperAdminUsers {
        id
        username
        role
      }
    }
  `;

  const res = await fetch('http://localhost:8081/graphql', {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.nonSuperAdminUsers;
}

export async function updateUserRole(username: string, newRole: string) {
  const mutation = `
    mutation($username: String!, $newRole: String!) {
      updateUserRole(username: $username, newRole: $newRole) {
        id
        username
        role
      }
    }
  `;

  const variables = { username, newRole };

  const res = await fetch('http://localhost:8081/graphql', {
    method: 'POST',
    headers: getGraphQLHeaders(),
    body: JSON.stringify({ query: mutation, variables }),
  });

  const json = await res.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data.updateUserRole;
}

// Template-related mutations
export async function setTemplateProject(courseLevel: number, projectId: string) {
  const mutation = `
    mutation($courseLevel: Int!, $projectId: ID!) {
      setTemplateProject(courseLevel: $courseLevel, projectId: $projectId) {
        id
        courseLevel
        templateProject {
          id
          title
          description
        }
      }
    }
  `;

  const variables = { courseLevel, projectId };

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

  return json.data.setTemplateProject;
}

export async function createProjectFromTemplate(courseLevel: number, title: string, description: string) {
  const mutation = `
    mutation($courseLevel: Int!, $title: String!, $description: String!) {
      createProjectFromTemplate(courseLevel: $courseLevel, title: $title, description: $description) {
        id
        title
        description
        courseLevel
      }
    }
  `;

  const variables = { courseLevel, title, description };

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

  return json.data.createProjectFromTemplate;
}

export async function getAllProjects() {
  const query = `
    query {
      projects {
        id
        title
        description
        courseLevel
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
}