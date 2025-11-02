import { useState, useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { NodeData } from '../../../utils/types';

export interface CreateNodeData {
  type: string;
  parentIds: any;
  parentNode?: NodeData;
}

export const useProjectViewState = (fetchProjectById?: () => void | Promise<void>) => {
  const [editNode, setEditNode] = useState<NodeData | null>(null);
  const [createNode, setCreateNode] = useState<CreateNodeData | null>(null);
  const client = useApolloClient();

  const refetchProject = useCallback(async () => {
    if (fetchProjectById) {
      const result = fetchProjectById();
      if (result && typeof result.then === 'function') {
        await result;
      }
    } else {
      await client.refetchQueries({
        include: ['ProjectById'], // Match the query name in Project.tsx
      });
    }
  }, [client, fetchProjectById]);

  const handleEditNode = useCallback((node: NodeData) => {
    // Close any existing create fanout when opening edit fanout
    setCreateNode(null);
    setEditNode(node);
  }, []);

  const handleCreateNode = useCallback((nodeData: CreateNodeData) => {
    // Close any existing edit fanout when opening create fanout
    setEditNode(null);
    setCreateNode(nodeData);
  }, []);

  const handleCloseEdit = useCallback(async () => {
    setEditNode(null);
    await refetchProject();
  }, [refetchProject]);

  const handleCloseCreate = useCallback(async () => {
    setCreateNode(null);
    await refetchProject();
  }, [refetchProject]);

  const handleSave = useCallback(async (data?: any) => {
    if (data?.action === 'create') {
      setCreateNode({
        type: data.nodeType,
        parentIds: data.parentIds,
        parentNode: data.parentNode
      });
    } else {
      await refetchProject();
    }
    setEditNode(null);
  }, [refetchProject]);

  const handleSaveCreate = useCallback(async () => {
    await refetchProject();
    setCreateNode(null);
  }, [refetchProject]);

  return {
    editNode,
    createNode,
    setEditNode,
    setCreateNode,
    refetchProject,
    handleEditNode,
    handleCreateNode,
    handleCloseEdit,
    handleCloseCreate,
    handleSave,
    handleSaveCreate,
  };
};