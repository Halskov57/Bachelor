import { gql } from '@apollo/client';

/**
 * GraphQL Fragments for reusable field sets across queries and mutations.
 */

export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    description
    depth
    users
    status
    # Ensure all fields used in the toTreeData function are included here
  }
`;

export const FEATURE_FIELDS = gql`
  fragment FeatureFields on Feature {
    id
    title
    description
  }
`;

export const EPIC_FIELDS = gql`
  fragment EpicFields on Epic {
    id
    title
    description
  }
`;

export const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    title
    name # Included for compatibility with the toTreeData function's logic
    description
  }
`;
