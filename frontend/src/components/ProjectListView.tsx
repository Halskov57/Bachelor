import React, { useState } from 'react';
import EditFanout from './EditFanout';

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void, allUsers?: any[] }> = ({ project, fetchProjectById, allUsers = [] }) => {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<any>(null);
  const [createNode, setCreateNode] = useState<{
    type: string;
    parentIds: any;
    parentNode?: any;
  } | null>(null);

  return (
    <div style={{
      maxHeight: '70vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '20px 500px 10px 50px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e0e6ed',
      textAlign: 'left'
    }}>
      {/* Project Header */}
      <div style={{
        backgroundColor: '#022AFF',
        color: '#fff',
        padding: '20px 20px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#001a66'}
      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#022AFF'}
      onClick={() => setEditNode({...project, type: 'project'})}
      >
        📋 {project.title || project.name}
      </div>

      {/* Epics Container */}
      <div style={{ marginLeft: '30px', width: '28%', maxWidth: '350px', minWidth: '260px' }}>
        {project.epics && project.epics.map((epic: any) => {
          const epicId = epic.id || epic._id || epic.title;
          const hasFeatures = Array.isArray(epic.features) && epic.features.length > 0;
          const isEpicExpanded = expandedEpic === epicId;

          return (
            <div key={epicId} style={{ marginBottom: '12px' }}>
              {/* Epic Item */}
              <div style={{
                backgroundColor: '#2456e6',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#1e4acc'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2456e6'}
              >
                <span 
                  onClick={() => setEditNode({ ...epic, type: 'epic', projectId: project.projectId || project.id })}
                  style={{ flex: 1, fontSize: '1rem', fontWeight: '500', textAlign: 'left' }}
                >
                  📚 {epic.title}
                </span>
                
                {hasFeatures && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedEpic(isEpicExpanded ? null : epicId); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    {isEpicExpanded ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {/* Features */}
              {hasFeatures && isEpicExpanded && (
                <div style={{ marginLeft: '30px', marginTop: '8px' }}>
                  {epic.features.map((feature: any) => {
                    const featureId = feature.id || feature._id || feature.title;
                    const hasTasks = Array.isArray(feature.tasks) && feature.tasks.length > 0;
                    const isFeatureExpanded = expandedFeature === featureId;

                    return (
                      <div key={featureId} style={{ marginBottom: '8px' }}>
                        {/* Feature Item */}
                        <div style={{
                          backgroundColor: '#fff',
                          color: '#022AFF',
                          border: '2px solid #022AFF',
                          padding: '8px 14px',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#f0f6ff';
                          (e.target as HTMLElement).style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = '#fff';
                          (e.target as HTMLElement).style.transform = 'translateX(0px)';
                        }}
                        >
                          <span 
                            onClick={() => setEditNode({ ...feature, type: 'feature', projectId: project.projectId || project.id, epicId: epic.epicId || epic.id })}
                            style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500', textAlign: 'left' }}
                          >
                            🎯 {feature.title}
                          </span>
                          
                          {hasTasks && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedFeature(isFeatureExpanded ? null : featureId); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#022AFF',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(2,42,255,0.1)'}
                              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                            >
                              {isFeatureExpanded ? '▲' : '▼'}
                            </button>
                          )}
                        </div>

                        {/* Tasks */}
                        {hasTasks && isFeatureExpanded && (
                          <div style={{ marginLeft: '30px', marginTop: '6px' }}>
                            {feature.tasks.map((task: any) => (
                              <div
                                key={task.id || task._id || task.title}
                                style={{
                                  backgroundColor: '#e6f0ff',
                                  color: '#022AFF',
                                  border: '1px solid #b3d1ff',
                                  borderRadius: '4px',
                                  padding: '6px 10px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  fontSize: '0.85rem',
                                  textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = '#cce6ff';
                                  (e.target as HTMLElement).style.transform = 'translateX(4px)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.backgroundColor = '#e6f0ff';
                                  (e.target as HTMLElement).style.transform = 'translateX(0px)';
                                }}
                                onClick={() => setEditNode({
                                  ...task,
                                  type: 'task',
                                  id: task.id || task.taskId,
                                  projectId: project.projectId || project.id,
                                  epicId: epic.epicId || epic.id,
                                  featureId: feature.featureId || feature.id,
                                })}
                              >
                                ✓ {task.title}
                                {task.status && (
                                  <span style={{
                                    marginLeft: '8px',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#022AFF',
                                    color: '#fff',
                                    padding: '2px 6px',
                                    borderRadius: '3px'
                                  }}>
                                    {task.status}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editNode && (
        <EditFanout
          node={editNode}
          mode="edit"
          project={project}
          allUsers={allUsers}
          onClose={() => setEditNode(null)}
          onSave={async (data?: any) => {
            if (data?.action === 'create') {
              setCreateNode({
                type: data.nodeType,
                parentIds: data.parentIds,
                parentNode: data.parentNode
              });
            } else {
              await fetchProjectById();
            }
            setEditNode(null);
          }}
        />
      )}
      {createNode && (
        <EditFanout
          createNode={createNode}
          mode="create"
          project={project}
          onClose={() => setCreateNode(null)}
          onSave={async () => {
            await fetchProjectById();
            setCreateNode(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectListView;
