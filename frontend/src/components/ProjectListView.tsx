import React, { useState } from 'react';
import EditFanout from './EditFanout';
import ThreeDotsMenu from './ThreeDotsMenu'; // Import the ThreeDotsMenu component

const getNodeStyle = (type: string) => {
  switch (type) {
    case 'project':
    case 'epic':
      return { background: '#022AFF', color: '#fff', border: 'none', fontWeight: 500 };
    case 'feature':
      return { background: '#fff', color: '#022AFF', border: '1.5px solid #022AFF', fontWeight: 400 };
    case 'task':
      return { background: '#e6f0ff', color: '#022AFF', border: 'none', fontWeight: 400 };
    default:
      return {};
  }
};

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void }> = ({ project, fetchProjectById }) => {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<any>(null);

  return (
    <ul style={{
      textAlign: 'left',
      display: 'inline-block',
      marginTop: '20px',
      minWidth: '300px',
      padding: 0,
      listStyle: 'none'
    }}>
      {/* Project node */}
      <li style={{
        ...getNodeStyle('project'),
        borderRadius: '22px',
        padding: '10px 24px',
        marginBottom: '16px',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>{project.title || project.name}</span>
        <ThreeDotsMenu
          onEdit={() => setEditNode({
            ...project,
            type: 'project',
            id: project.id || project.projectId, // <-- ensure this is present!
          })}
          onAddChild={() => {/* handle add epic */}}
          onDelete={() => {/* handle delete project */}}
          iconColor="#fff"
          size={22}
        />
        <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
          {project.epics && project.epics.map((epic: any) => {
            const epicId = epic.id || epic._id || epic.title;
            const hasFeatures = Array.isArray(epic.features) && epic.features.length > 0;
            const isEpicExpanded = expandedEpic === epicId;
            return (
              <li key={epicId} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {epic.title}
                  {hasFeatures && (
                    <button
                      onClick={() => setExpandedEpic(isEpicExpanded ? null : epicId)}
                      style={{
                        marginLeft: 8,
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isEpicExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </span>
                <ThreeDotsMenu
                  onEdit={() => {
                    // Debug log (outside JSX if needed)
                    console.log('project.id:', project.id, 'project.projectId:', project.projectId);
                    console.log('epic.id:', epic.id, 'epic.epicId:', epic.epicId);

                    setEditNode({
                      ...epic,
                      type: 'epic',
                      id: epic.epicId || epic.id, // always use epicId for the epic
                      projectId: project.projectId || project.id, // always use projectId for the project
                    });
                  }}
                  onAddChild={() => {/* handle add feature */}}
                  onDelete={() => {/* handle delete epic */}}
                  iconColor="#fff"
                  size={20}
                />
                {hasFeatures && isEpicExpanded && (
                  <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
                    {epic.features.map((feature: any) => {
                      const featureId = feature.id || feature._id || feature.title;
                      const hasTasks = Array.isArray(feature.tasks) && feature.tasks.length > 0;
                      const isFeatureExpanded = expandedFeature === featureId;
                      return (
                        <li key={featureId} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>
                            {feature.title}
                            {hasTasks && (
                              <button
                                onClick={() => setExpandedFeature(isFeatureExpanded ? null : featureId)}
                                style={{
                                  marginLeft: 8,
                                  background: 'none',
                                  border: 'none',
                                  color: 'rgba(255, 255, 255, 1)',
                                  fontSize: '1rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {isFeatureExpanded ? '▲' : '▼'}
                              </button>
                            )}
                          </span>
                          <ThreeDotsMenu
                            onEdit={() => setEditNode({
                              ...feature,
                              type: 'feature',
                              id: feature.id,
                              projectId: project.projectId || project.id, // <-- add this!
                              epicId: epic.epicId || epic.id,             // <-- add this!
                            })}
                            onAddChild={() => {/* handle add task */}}
                            onDelete={() => {/* handle delete feature */}}
                            iconColor="rgba(252, 252, 252, 1)"
                            size={18}
                          />
                          {hasTasks && isFeatureExpanded && (
                            <ul style={{ marginLeft: '20px', marginTop: '6px', padding: 0, listStyle: 'none' }}>
                              {feature.tasks.map((task: any) => (
                                <li
                                  key={task.id || task._id || task.title}
                                  style={{
                                    ...getNodeStyle('task'),
                                    borderRadius: '8px',
                                    padding: '4px 12px',
                                    marginBottom: '4px',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <span>{task.title}</span>
                                  <ThreeDotsMenu
                                    onEdit={() => setEditNode({
                                      ...task,
                                      type: 'task',
                                      id: task.id || task.taskId,
                                      projectId: project.projectId || project.id,   // <-- add this!
                                      epicId: epic.epicId || epic.id,               // <-- add this!
                                      featureId: feature.featureId || feature.id,   // <-- add this!
                                    })}
                                    onDelete={() => {/* handle delete task */}}
                                    iconColor="#022AFF"
                                    size={16}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </li>
      {editNode && (
        <EditFanout
          node={editNode}
          onClose={() => {
            setEditNode(null);
            fetchProjectById(); // <-- refresh after closing the fanout
          }}
          onSave={data => {
            setEditNode(null);
            fetchProjectById(); // <-- refresh after saving
          }}
        />
      )}
    </ul>
  );
};

export default ProjectListView;

