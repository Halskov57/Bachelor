import { gql } from '@apollo/client';
import { TASK_FIELDS, FEATURE_FIELDS, EPIC_FIELDS, PROJECT_FIELDS } from './graphqlFragments'; // Assuming fragments are imported here

// --- Project Level Subscription (Used in Project.tsx) ---
// This is the least efficient but easiest to use, as it pushes the whole project state.
export const PROJECT_UPDATE_SUBSCRIPTION = gql`
  subscription ProjectUpdated($id: ID!) {
    projectUpdated(id: $id) {
      ...ProjectFields
      epics {
        ...EpicFields
        features {
          ...FeatureFields
          tasks {
            ...TaskFields
          }
        }
      }
    }
  }
  ${PROJECT_FIELDS}
  ${EPIC_FIELDS}
  ${FEATURE_FIELDS}
  ${TASK_FIELDS}
`;


// --- Epic Subscriptions ---
// Used to listen for a new Epic being added to the project.
export const EPIC_ADDED_SUBSCRIPTION = gql`
  subscription EpicAdded($id: ID!) {
    epicAdded(id: $id) {
      ...EpicFields
    }
  }
  ${EPIC_FIELDS}
`;

// Used to listen for an Epic being updated (e.g., title/description).
export const EPIC_UPDATED_SUBSCRIPTION = gql`
  subscription EpicUpdated($id: ID!) {
    epicUpdated(id: $id) {
      ...EpicFields
    }
  }
  ${EPIC_FIELDS}
`;

// --- Feature Subscriptions ---
// Used to listen for a new Feature being added to an Epic.
// The Feature response must include the parent Epic ID for cache update logic.
export const FEATURE_ADDED_SUBSCRIPTION = gql`
  subscription FeatureAdded($id: ID!) {
    featureAdded(id: $id) {
      ...FeatureFields
      epicId
    }
  }
  ${FEATURE_FIELDS}
`;

// Used to listen for a Feature being updated.
export const FEATURE_UPDATED_SUBSCRIPTION = gql`
  subscription FeatureUpdated($id: ID!) {
    featureUpdated(id: $id) {
      ...FeatureFields
      epicId
    }
  }
  ${FEATURE_FIELDS}
`;


// --- Task Subscriptions (Enhanced for real-time collaboration) ---
// Used to listen for a new Task being added to a Feature.
export const TASK_ADDED_SUBSCRIPTION = gql`
  subscription TaskAdded($projectId: ID!) {
    taskAdded(projectId: $projectId) {
      ...TaskFields
      featureId # Crucial for finding parent feature in cache
      epicId    # Crucial for finding parent epic in cache
      assignedUsers {
        id
        username
      }
    }
  }
  ${TASK_FIELDS}
`;

// Used to listen for a Task being updated (e.g., status, assigned users).
export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription TaskUpdated($projectId: ID!) {
    taskUpdated(projectId: $projectId) {
      ...TaskFields
      featureId # Crucial for identifying location of the update
      epicId
      assignedUsers {
        id
        username
      }
    }
  }
  ${TASK_FIELDS}
`;

// Real-time task assignment updates
export const TASK_ASSIGNMENT_UPDATED = gql`
  subscription TaskAssignmentUpdated($projectId: ID!) {
    taskAssignmentUpdated(projectId: $projectId) {
      taskId
      assignedUsers {
        id
        username
      }
      updatedBy {
        id
        username
      }
    }
  }
`;

// Real-time task status changes
export const TASK_STATUS_CHANGED = gql`
  subscription TaskStatusChanged($projectId: ID!) {
    taskStatusChanged(projectId: $projectId) {
      id
      status
      title
      updatedBy {
        id
        username
      }
    }
  }
`;

// Real-time task deletion
export const TASK_DELETED_SUBSCRIPTION = gql`
  subscription TaskDeleted($projectId: ID!) {
    taskDeleted(projectId: $projectId) {
      id
      title
      featureId
      epicId
      deletedBy {
        id
        username
      }
    }
  }
`;

// --- Feature Subscriptions (Enhanced) ---
export const FEATURE_DELETED_SUBSCRIPTION = gql`
  subscription FeatureDeleted($projectId: ID!) {
    featureDeleted(projectId: $projectId) {
      id
      title
      epicId
      deletedBy {
        id
        username
      }
    }
  }
`;

// --- Epic Subscriptions (Enhanced) ---
export const EPIC_DELETED_SUBSCRIPTION = gql`
  subscription EpicDeleted($projectId: ID!) {
    epicDeleted(projectId: $projectId) {
      id
      title
      deletedBy {
        id
        username
      }
    }
  }
`;

// --- Project Structure Updates (for major changes) ---
export const PROJECT_STRUCTURE_UPDATED = gql`
  subscription ProjectStructureUpdated($projectId: ID!) {
    projectStructureUpdated(projectId: $projectId) {
      type
      action
      data {
        id
        title
        type
        parentId
      }
      updatedBy {
        id
        username
      }
    }
  }
`;

// --- User Activity Subscriptions ---
export const USER_ACTIVITY_UPDATED = gql`
  subscription UserActivityUpdated($projectId: ID!) {
    userActivityUpdated(projectId: $projectId) {
      userId
      username
      action
      targetType
      targetId
      targetTitle
      timestamp
    }
  }
`;
