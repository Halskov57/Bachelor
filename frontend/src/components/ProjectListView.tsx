import React, { useState } from 'react';
import EditFanout from './EditFanout';
import { deleteNode, addNode } from '../utils/graphqlMutations';

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

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void, allUsers?: any[] }> = ({ project, fetchProjectById, allUsers = [] }) => {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<any>(null);
  const [createNode, setCreateNode] = useState<{
    type: string;
    parentIds: any;
    parentNode?: any;
  } | null>(null);

  // Update the handleAdd child function to properly set parent IDs
  const handleAddChild = (parentNode: any) => {
    let nodeType = '';
    let parentIds: any = {};

    if (parentNode.type === 'project') {
      nodeType = 'epic';
      parentIds = { projectId: parentNode.id };
    } else if (parentNode.type === 'epic') {
      nodeType = 'feature';
      parentIds = { 
        projectId: parentNode.projectId || project?.id, 
        epicId: parentNode.id 
      };
    } else if (parentNode.type === 'feature') {
      nodeType = 'task';
      parentIds = { 
        projectId: parentNode.projectId || project?.id,
        epicId: parentNode.epicId || parentNode.epic?.id,
        featureId: parentNode.id 
      };
    }

    setCreateNode({ 
      type: nodeType, 
      parentIds: parentIds,
      parentNode: parentNode 
    });
  };

  const handleDelete = async (item: any) => {
    try {
      console.log('=== LIST VIEW DELETE DEBUG ===');
      console.log('Item to delete:', item);
      console.log('Item type:', item.type);
      console.log('Project structure:', project);

      let parentIds: any = {
        projectId: project?.id || project?.projectId
      };

      if (item.type === 'feature') {
        // In list view, we need to find which epic contains this feature
        let foundEpicId = null;
        
        // Search through project epics to find the parent epic
        if (project?.epics) {
          for (const epic of project.epics) {
            if (epic.features) {
              const foundFeature = epic.features.find((f: any) => 
                (f.id || f.featureId) === (item.id || item.featureId) ||
                f.title === item.title // fallback comparison
              );
              if (foundFeature) {
                foundEpicId = epic.id || epic.epicId;
                console.log('Found parent epic:', foundEpicId, 'for feature:', item.id || item.featureId);
                break;
              }
            }
          }
        }
        
        if (!foundEpicId) {
          throw new Error(`Could not find parent epic for feature: ${item.title || item.id}`);
        }
        
        parentIds.epicId = foundEpicId;
        
      } else if (item.type === 'task') {
        // For tasks, find both epic and feature parents
        let foundEpicId = null;
        let foundFeatureId = null;
        
        if (project?.epics) {
          outerLoop: for (const epic of project.epics) {
            if (epic.features) {
              for (const feature of epic.features) {
                if (feature.tasks) {
                  const foundTask = feature.tasks.find((t: any) =>
                    (t.id || t.taskId) === (item.id || item.taskId) ||
                    t.title === item.title // fallback comparison
                  );
                  if (foundTask) {
                    foundEpicId = epic.id || epic.epicId;
                    foundFeatureId = feature.id || feature.featureId;
                    console.log('Found parents - Epic:', foundEpicId, 'Feature:', foundFeatureId, 'for task:', item.id || item.taskId);
                    break outerLoop;
                  }
                }
              }
            }
          }
        }
        
        if (!foundEpicId || !foundFeatureId) {
          throw new Error(`Could not find parent epic/feature for task: ${item.title || item.id}`);
        }
        
        parentIds.epicId = foundEpicId;
        parentIds.featureId = foundFeatureId;
      }

      console.log('Final delete parameters:', {
        item: {
          type: item.type,
          id: item.id,
          featureId: item.featureId,
          taskId: item.taskId,
          title: item.title
        },
        parentIds
      });

      await deleteNode(item, parentIds);
      await fetchProjectById(); // Refresh the data
    
    } catch (error: any) {
      console.error('List view delete error:', error);
      alert(`Error deleting ${item.type}: ${error.message}`);
    }
  };

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
      <div style={{ 
        marginLeft: '30px',
        width: '28%',
        maxWidth: '350px',
        minWidth: '260px'
      }}>
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
                  onClick={() => setEditNode({
                    ...epic, 
                    type: 'epic',
                    projectId: project.projectId || project.id
                  })}
                  style={{ flex: 1, fontSize: '1rem', fontWeight: '500', textAlign: 'left' }}
                >
                  📚 {epic.title}
                </span>
                
                {hasFeatures && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedEpic(isEpicExpanded ? null : epicId);
                    }}
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

              {/* Features Container (indented) */}
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
                            onClick={() => setEditNode({
                              ...feature, 
                              type: 'feature', 
                              projectId: project.projectId || project.id,
                              epicId: epic.epicId || epic.id
                            })}
                            style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500', textAlign: 'left' }}
                          >
                            🎯 {feature.title}
                          </span>
                          
                          {hasTasks && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedFeature(isFeatureExpanded ? null : featureId);
                              }}
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

                        {/* Tasks Container (further indented) */}
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
              // Handle create mode trigger
              setCreateNode({
                type: data.nodeType,
                parentIds: data.parentIds,
                parentNode: data.parentNode
              });
            } else {
              // Normal save - refresh data
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
          allUsers={allUsers}
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

