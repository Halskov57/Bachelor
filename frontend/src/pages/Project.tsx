import React, { useEffect, useState } from 'react';

const TreeView = ({ project }: { project: any }) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
    <ul style={{ textAlign: 'left', color: '#fff', minWidth: 300, borderLeft: '2px solid #022AFF', paddingLeft: 20 }}>
      <li>
        <span style={{ fontWeight: 700, color: '#022AFF' }}>{project.title || project.name}</span>
        <ul style={{ borderLeft: '2px solid #022AFF', marginLeft: 20, paddingLeft: 20 }}>
          {project.epics && project.epics.map((epic: any) => (
            <li key={epic.id || epic._id || epic.title}>
              <span style={{ fontWeight: 600 }}>{epic.title}</span>
              {epic.features && (
                <ul style={{ borderLeft: '2px solid #022AFF', marginLeft: 20, paddingLeft: 20 }}>
                  {epic.features.map((feature: any) => (
                    <li key={feature.id || feature._id || feature.title}>
                      <span style={{ fontWeight: 500 }}>{feature.title}</span>
                      {feature.tasks && (
                        <ul style={{ borderLeft: '2px solid #022AFF', marginLeft: 20, paddingLeft: 20 }}>
                          {feature.tasks.map((task: any) => (
                            <li key={task.id || task._id || task.title}>
                              <span>{task.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  </div>
);

const Project: React.FC = () => {
  const [project, setProject] = useState<any>(null);
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8081/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProject(data);
      });
  }, []);

  if (!project) return <div>Loading...</div>;

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          onClick={() => setView('list')}
          style={{
            marginRight: '12px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: view === 'list' ? '2px solid #022AFF' : '1px solid #aaa',
            background: view === 'list' ? '#022AFF' : '#fff',
            color: view === 'list' ? '#fff' : '#022AFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          List View
        </button>
        <button
          onClick={() => setView('tree')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: view === 'tree' ? '2px solid #022AFF' : '1px solid #aaa',
            background: view === 'tree' ? '#022AFF' : '#fff',
            color: view === 'tree' ? '#fff' : '#022AFF',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Tree View
        </button>
      </div>
      <h1 style={{
        textAlign: 'center',
        marginTop: '40px',
        color: '#022AFF',
        fontWeight: 800,
        fontSize: '2.5rem',
        zIndex: 2,
        position: 'relative'
      }}>
        {project.title || project.name}
      </h1>
      <div style={{ textAlign: 'center', marginTop: '10px', position: 'relative', zIndex: 2 }}>
        {view === 'list' ? (
          <ul style={{
            textAlign: 'left',
            display: 'inline-block',
            marginTop: '20px',
            color: '#fff',
            minWidth: '300px'
          }}>
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
                        background: '#022AFF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginBottom: '8px'
                      }}
                    >
                      {epic.title} {isEpicExpanded ? '▲' : '▼'}
                    </button>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{epic.title}</span>
                  )}
                  {hasFeatures && isEpicExpanded && (
                    <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
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
                                  background: '#fff',
                                  color: '#022AFF',
                                  border: '1.5px solid #022AFF',
                                  borderRadius: '6px',
                                  padding: '6px 14px',
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  marginBottom: '6px'
                                }}
                              >
                                {feature.title} {isFeatureExpanded ? '▲' : '▼'}
                              </button>
                            ) : (
                              <span style={{ fontWeight: 500, color: '#fff' }}>{feature.title}</span>
                            )}
                            {hasTasks && isFeatureExpanded && (
                              <ul style={{ marginLeft: '20px', marginTop: '6px' }}>
                                {feature.tasks.map((task: any) => (
                                  <li key={task.id || task._id || task.title} style={{ color: '#fff' }}>
                                    {task.title}
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
        ) : (
          <TreeView project={project} />
        )}
      </div>
    </>
  );
};

export default Project;