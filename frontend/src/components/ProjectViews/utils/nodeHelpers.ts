import { NodeData } from '../../../utils/types';

export const createNodeFromTreeData = (nodeDatum: any): NodeData => ({
  type: nodeDatum.attributes?.type || 'project',
  id: nodeDatum.attributes?.id,
  title: nodeDatum.title,
  description: nodeDatum.description,
  status: nodeDatum.status,
  userIds: nodeDatum.users,
  projectId: nodeDatum.projectId,
  epicId: nodeDatum.epicId,
  featureId: nodeDatum.featureId,
});

export const getAllTasksWithContext = (project: any) => {
  const allTasks: any[] = [];
  
  if (!project?.epics) return allTasks;

  project.epics.forEach((epic: any) => {
    if (epic.features) {
      epic.features.forEach((feature: any) => {
        if (feature.tasks) {
          feature.tasks.forEach((task: any) => {
            allTasks.push({
              ...task,
              epicTitle: epic.title,
              featureTitle: feature.title,
              epicId: epic.epicId || epic.id,
              featureId: feature.featureId || feature.id,
              projectId: project.projectId || project.id
            });
          });
        }
      });
    }
  });

  return allTasks;
};

export const getUniqueStatuses = (project: any): string[] => {
  const allTasks: any[] = [];
  
  if (!project?.epics) return [];

  project.epics.forEach((epic: any) => {
    if (epic.features) {
      epic.features.forEach((feature: any) => {
        if (feature.tasks) {
          feature.tasks.forEach((task: any) => {
            allTasks.push(task);
          });
        }
      });
    }
  });

  const statuses = new Set<string>();
  allTasks.forEach(task => {
    if (task.status) statuses.add(task.status);
  });
  return Array.from(statuses).sort();
};

export const getUniqueUsernames = (project: any): string[] => {
  if (!project?.owners || !Array.isArray(project.owners)) return [];

  const usernames = project.owners
    .map((owner: any) => owner.username || owner.name)
    .filter((username: string) => username) // Remove any undefined/null values
    .sort();

  return usernames;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Done': return '#4CAF50';
    case 'In progress': return '#FF9800';
    case 'Need help': return '#E91E63';
    case 'Todo': return '#757575';
    case 'Blocked': return '#757575';
    default: return '#757575';
  }
};