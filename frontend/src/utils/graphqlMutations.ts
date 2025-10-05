export async function updateNode(node: any, parentIds: any) {
  let results = {};

  // Helper to run a mutation
  async function runMutation(mutation: string, variables: any) {
    const res = await fetch('http://localhost:8081/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = await res.json();
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
  }

  if (!didUpdate) throw new Error('No valid mutation for node type/fields');
  return results;
}