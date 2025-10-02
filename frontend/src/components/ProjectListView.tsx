import React, { useState } from 'react';
import EditFanout from './EditFanout';

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

const ProjectListView: React.FC<{ project: any }> = ({ project }) => {
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
        fontSize: '1.2rem'
      }}>
        {project.title || project.name}
        <span
          style={{ marginLeft: 8, cursor: 'pointer', color: '#fff', fontSize: '1em' }}
          onClick={() => setEditNode(project)}
          title="Edit"
        >
          ✎
        </span>
        <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
          {project.epics && project.epics.map((epic: any) => {
            const epicId = epic.id || epic._id || epic.title;
            const hasFeatures = Array.isArray(epic.features) && epic.features.length > 0;
            const isEpicExpanded = expandedEpic === epicId;
            return (
              <li key={epicId} style={{ marginBottom: '16px' }}>
                {hasFeatures ? (
                  <button
                    onClick={() => setExpandedEpic(isEpicExpanded ? null : epicId)}
                    style={{
                      ...getNodeStyle('epic'),
                      borderRadius: '18px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      fontSize: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {epic.title}
                    <span
                      style={{ marginLeft: 8, cursor: 'pointer', color: '#fff', fontSize: '1em' }}
                      onClick={e => {
                        e.stopPropagation();
                        setEditNode(epic);
                      }}
                      title="Edit"
                    >
                      ✎
                    </span>
                    {isEpicExpanded ? ' ▲' : ' ▼'}
                  </button>
                ) : (
                  <span style={{ ...getNodeStyle('epic'), borderRadius: '18px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center' }}>
                    {epic.title}
                    <span
                      style={{ marginLeft: 8, cursor: 'pointer', color: '#fff', fontSize: '1em' }}
                      onClick={e => {
                        e.stopPropagation();
                        setEditNode(epic);
                      }}
                      title="Edit"
                    >
                      ✎
                    </span>
                  </span>
                )}
                {hasFeatures && isEpicExpanded && (
                  <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
                    {epic.features.map((feature: any) => {
                      const featureId = feature.id || feature._id || feature.title;
                      const hasTasks = Array.isArray(feature.tasks) && feature.tasks.length > 0;
                      const isFeatureExpanded = expandedFeature === featureId;
                      return (
                        <li key={featureId} style={{ marginBottom: '10px' }}>
                          {hasTasks ? (
                            <button
                              onClick={() => setExpandedFeature(isFeatureExpanded ? null : featureId)}
                              style={{
                                ...getNodeStyle('feature'),
                                borderRadius: '12px',
                                padding: '6px 14px',
                                cursor: 'pointer',
                                marginBottom: '6px',
                                fontSize: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              {feature.title}
                              <span
                                style={{ marginLeft: 8, cursor: 'pointer', color: '#022AFF', fontSize: '1em' }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditNode(feature);
                                }}
                                title="Edit"
                              >
                                ✎
                              </span>
                              {isFeatureExpanded ? ' ▲' : ' ▼'}
                            </button>
                          ) : (
                            <span style={{ ...getNodeStyle('feature'), borderRadius: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center' }}>
                              {feature.title}
                              <span
                                style={{ marginLeft: 8, cursor: 'pointer', color: '#022AFF', fontSize: '1em' }}
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditNode(feature);
                                }}
                                title="Edit"
                              >
                                ✎
                              </span>
                            </span>
                          )}
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
                                    alignItems: 'center'
                                  }}
                                >
                                  {task.title}
                                  <span
                                    style={{ marginLeft: 8, cursor: 'pointer', color: '#022AFF', fontSize: '1em' }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditNode(task);
                                    }}
                                    title="Edit"
                                  >
                                    ✎
                                  </span>
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
          onClose={() => setEditNode(null)}
          onSave={data => {
            // handle save logic here
            setEditNode(null);
          }}
        />
      )}
    </ul>
  );
};

export default ProjectListView;