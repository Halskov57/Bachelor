import React, { useState } from 'react';
import EditFanout from './EditFanout';
import ThreeDotsMenu from './ThreeDotsMenu'; // Import the ThreeDotsMenu component
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

const ProjectListView: React.FC<{ project: any, fetchProjectById: () => void }> = ({ project, fetchProjectById }) => {
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
          onAddChild={() => {
            setCreateNode({
              type: 'epic',
              parentIds: { projectId: project.projectId || project.id },
              parentNode: project,
            });
          }}
          addChildText="Add Epic"
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
                  onAddChild={() => {
                    setCreateNode({
                      type: 'feature',
                      parentIds: {
                        projectId: project.projectId || project.id,
                        epicId: epic.epicId || epic.id
                      },
                      parentNode: epic
                    });
                  }}
                  addChildText="Add Feature"
                  onDelete={async () => {
                    try {
                      await deleteNode(
                        { type: 'epic', id: epic.epicId || epic.id },
                        { projectId: project.projectId || project.id }
                      );
                      fetchProjectById(); // refresh after delete
                    } catch (error) {
                      console.error('Failed to delete epic:', error);
                      alert('Failed to delete epic. Please try again.');
                    }
                  }}
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
                              id: feature.id || feature.featureId,
                              projectId: project.projectId || project.id, // <-- add this!
                              epicId: epic.epicId || epic.id,             // <-- add this!
                            })}
                            onAddChild={() => {
                              setCreateNode({
                                type: 'task',
                                parentIds: {
                                  projectId: project.projectId || project.id,
                                  epicId: epic.epicId || epic.id,
                                  featureId: feature.featureId || feature.id
                                },
                                parentNode: feature
                              });
                            }}
                            addChildText="Add Task"
                            onDelete={async () => {
                              try {
                                await deleteNode(
                                  { type: 'feature', id: feature.id || feature.featureId },
                                  { 
                                    projectId: project.projectId || project.id,
                                    epicId: epic.epicId || epic.id
                                  }
                                );
                                fetchProjectById(); // refresh after delete
                              } catch (error) {
                                console.error('Failed to delete feature:', error);
                                alert('Failed to delete feature. Please try again.');
                              }
                            }}
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
                                    onDelete={async () => {
                                      try {
                                        await deleteNode(
                                          { type: 'task', id: task.id || task.taskId },
                                          { 
                                            projectId: project.projectId || project.id,
                                            epicId: epic.epicId || epic.id,
                                            featureId: feature.featureId || feature.id
                                          }
                                        );
                                        fetchProjectById(); // refresh after delete
                                      } catch (error) {
                                        console.error('Failed to delete task:', error);
                                        alert('Failed to delete task. Please try again.');
                                      }
                                    }}
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
      {createNode && (
        <EditFanout
          createNode={createNode}
          mode="create"
          onClose={() => setCreateNode(null)}
          onSave={async () => {
            await fetchProjectById();
            setCreateNode(null);
          }}
        />
      )}
    </ul>
  );
};

export default ProjectListView;

