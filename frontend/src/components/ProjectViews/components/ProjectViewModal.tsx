import React from 'react';
import EditFanout from '../../EditFanout';
import { NodeData } from '../../../utils/types';
import { CreateNodeData } from '../hooks/useProjectViewState';

interface ProjectViewModalProps {
  editNode: NodeData | null;
  createNode: CreateNodeData | null;
  project: any;
  onCloseEdit: () => void;
  onCloseCreate: () => void;
  onSave: (data?: any) => void;
  onSaveCreate: () => void;
}

export const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
  editNode,
  createNode,
  project,
  onCloseEdit,
  onCloseCreate,
  onSave,
  onSaveCreate,
}) => {
  const projectWithDefaults = {
    ...project,
    type: 'project',
    courseLevel: project?.courseLevel || 0,
    owners: project?.owners || [],
  };

  return (
    <>
      {editNode && project && (
        <EditFanout
          node={editNode}
          mode="edit"
          project={projectWithDefaults}
          onClose={onCloseEdit}
          onSave={onSave}
        />
      )}

      {createNode && project && (
        <EditFanout
          createNode={createNode}
          mode="create"
          project={projectWithDefaults}
          onClose={onCloseCreate}
          onSave={onSaveCreate}
        />
      )}
    </>
  );
};