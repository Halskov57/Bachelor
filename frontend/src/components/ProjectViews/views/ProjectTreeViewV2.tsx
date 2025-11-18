import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeData } from '../../../utils/types';
import { useProjectViewState } from '../hooks/useProjectViewState';
import { ProjectViewModal } from '../components/ProjectViewModal';
import { getStatusColor, getStatusBackgroundColor, getStatusDisplayName } from '../utils/nodeHelpers';

// Add CSS animations for smooth expansion
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes expandDown {
    from {
      opacity: 0;
      transform: scaleY(0);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }
  
  @keyframes taskSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .tree-node-label {
    max-width: 150px;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.3;
    text-align: center;
  }
  
  .tree-task-title {
    max-width: 130px;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.3;
  }
`;
if (!document.head.querySelector('style[data-tree-animations]')) {
  styleSheet.setAttribute('data-tree-animations', 'true');
  document.head.appendChild(styleSheet);
}

interface CustomNodeProps {
  data: {
    label: string;
    nodeData: NodeData;
    onNodeClick: (node: NodeData) => void;
    type: string;
    hasChildren?: boolean;
    isCollapsed?: boolean;
    onToggle?: () => void;
  };
}

interface TaskContainerProps {
  data: {
    tasks: NodeData[];
    onNodeClick: (node: NodeData) => void;
  };
}

const TaskContainer: React.FC<TaskContainerProps> = ({ data }) => {
  const getNodeColor = (task: any) => {
    const taskStatus = task.status;
    const isCompleted = taskStatus === 'DONE' || taskStatus === 'Done';
    return isCompleted ? '#e8f5e9' : '#e6f0ff';
  };

  const getTextColor = (task: any) => {
    const taskStatus = task.status;
    const isCompleted = taskStatus === 'DONE' || taskStatus === 'Done';
    return isCompleted ? '#2e7d32' : '#022AFF';
  };

  const getBorderColor = (task: any) => {
    const taskStatus = task.status;
    const isCompleted = taskStatus === 'DONE' || taskStatus === 'Done';
    return isCompleted ? '#a5d6a7' : '#b3d1ff';
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(230, 230, 240, 0.5)',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '2px solid #ccc',
        width: '150px',
        animation: 'expandDown 0.3s ease-out',
        transformOrigin: 'top center',
        marginTop: '-4px', // Pull it closer to the parent node
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.tasks.map((task: any, index: number) => (
          <div
            key={task.id || `task-${index}`}
            style={{
              padding: '8px 12px',
              backgroundColor: getNodeColor(task),
              color: getTextColor(task),
              border: `2px solid ${getBorderColor(task)}`,
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              animation: `taskSlideIn 0.3s ease-out ${index * 0.05}s backwards`,
            }}
            onClick={() => data.onNodeClick(task)}
            onMouseEnter={(e) => {
              const isCompleted = task.status === 'DONE' || task.status === 'Done';
              e.currentTarget.style.backgroundColor = isCompleted ? '#c8e6c9' : '#cce6ff';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = getNodeColor(task);
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '1.0rem' }}>📌</span> <span className="tree-task-title">{task.title}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '10px' }}>
              {task.status && (
                <span style={{
                  backgroundColor: getStatusBackgroundColor(task.status),
                  color: '#000',
                  border: `1px solid ${getStatusColor(task.status)}`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}>
                  {getStatusDisplayName(task.status)}
                </span>
              )}
              {(task.users || task.assignedUsers) && (task.users || task.assignedUsers).length > 0 && (
                <span style={{
                  backgroundColor: getNodeColor(task),
                  color: '#000',
                  border: `1px solid ${getBorderColor(task)}`,
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}>
                  👤 {(task.users || task.assignedUsers).map((u: any) => u.username).join(', ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'project': return '#022AFF';
      case 'epic': return '#4d8cff';
      case 'feature': return '#7aa3ff';
      case 'task': return '#a6c1ff';
      default: return '#ccc';
    }
  };

  return (
    <div
      style={{
        padding: '8px 16px',
        backgroundColor: getNodeColor(data.type),
        color: '#fff',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        width: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onClick={() => data.onNodeClick(data.nodeData)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="tree-node-label">{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      {data.hasChildren && data.onToggle && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            data.onToggle!();
          }}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#fff',
            border: '2px solid #333',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
          }}
        >
          {data.isCollapsed ? '+' : '−'}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  taskContainer: TaskContainer,
};

const ProjectTreeViewV2: React.FC<{ treeData: any, fetchProjectById: () => void, project?: any }> = ({ 
  treeData, 
  fetchProjectById, 
  project 
}) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const {
    editNode,
    createNode,
    handleEditNode,
    handleCloseEdit,
    handleCloseCreate,
    handleSave,
    handleSaveCreate,
  } = useProjectViewState(fetchProjectById);

  const handleNodeClick = useCallback((node: NodeData) => {
    handleEditNode(node);
  }, [handleEditNode]);

  const handleToggleNode = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Convert tree data to ReactFlow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let nodeIdCounter = 0;

    const verticalSpacing = 100; // Distance between parent and child layers
    const horizontalSpacing = 200; // Distance between siblings
    const taskSpacing = 40; // Distance between tasks in a list

    // Calculate the total width a node and its descendants will occupy
    const calculateSubtreeWidth = (node: NodeData, collapsedNodes: Set<string>): number => {
      const nodeId = node.id || node.title;
      const isCollapsed = collapsedNodes.has(nodeId);
      
      if (!node.children || node.children.length === 0 || isCollapsed) {
        return horizontalSpacing; // Base width for a leaf node
      }

      const childrenAreTasks = node.children[0]?.type === 'task';
      
      if (childrenAreTasks) {
        // Tasks are in a vertical list, so they don't add horizontal width
        return horizontalSpacing;
      } else {
        // Sum up the widths of all children
        const childrenWidth = node.children.reduce((sum, child) => {
          return sum + calculateSubtreeWidth(child, collapsedNodes);
        }, 0);
        return Math.max(childrenWidth, horizontalSpacing);
      }
    };

    const processNode = (
      node: NodeData,
      level: number,
      position: { x: number; y: number },
      parentId?: string
    ): number => {
      const nodeId = node.id || `node-${nodeIdCounter++}`;
      const isCollapsed = collapsedNodes.has(nodeId);
      const hasChildren = node.children && node.children.length > 0;

      flowNodes.push({
        id: nodeId,
        type: 'custom',
        position,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          label: node.title,
          nodeData: node,
          onNodeClick: handleNodeClick,
          type: node.type,
          hasChildren,
          isCollapsed,
          onToggle: hasChildren ? () => handleToggleNode(nodeId) : undefined,
        },
      });

      // Create edges for parent-child connections
      if (parentId) {
        flowEdges.push({
          id: `edge-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'straight',
          animated: false,
          style: { 
            stroke: '#666', 
            strokeWidth: 3
          },
        });
      }

      if (hasChildren && !isCollapsed) {
        const children = node.children!;
        const childrenAreTasks = children[0]?.type === 'task';

        if (childrenAreTasks) {
          // Create a single task container node with all tasks (no edge connection)
          const taskContainerId = `task-container-${nodeId}`;
          const taskContainerWidth = 150; // Same width as parent node
          const nodeWidth = 150; // Width of parent node
          
          // Calculate actual rendered height more accurately
          // Create a temporary canvas context to measure text
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          let nodeHeight = 42; // Default minimum height
          
          if (context) {
            context.font = '600 14px system-ui, -apple-system, sans-serif'; // Match the actual font
            const metrics = context.measureText(node.title);
            const textWidth = metrics.width;
            
            // Calculate how many lines the text will wrap to
            // Available width: 150px (max-width from CSS) - small margin for safety
            const maxTextWidth = 145; // Slightly less than max-width for word-break behavior
            const lines = Math.max(1, Math.ceil(textWidth / maxTextWidth));
            
            // Calculate height: lines * line-height + padding + small buffer
            const lineHeight = 18.2; // 14px * 1.3
            const verticalPadding = 16; // 8px top + 8px bottom
            const buffer = 2; // Small buffer for rendering variations
            nodeHeight = (lines * lineHeight) + verticalPadding + buffer;
            
            canvas.remove(); // Clean up
          }
          
          const taskContainerGap = 6; // Consistent gap between feature and task container
          
          flowNodes.push({
            id: taskContainerId,
            type: 'taskContainer',
            position: {
              // Center the container below parent: parent center - half container width
              x: position.x + (nodeWidth / 2) - (taskContainerWidth / 2),
              y: position.y + nodeHeight + taskContainerGap, // Position right below the node
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            data: {
              tasks: children,
              onNodeClick: handleNodeClick,
            },
          });
        } else {
          // Non-tasks are displayed horizontally with proper spacing
          // Calculate width for each child
          const childWidths = children.map(child => calculateSubtreeWidth(child, collapsedNodes));
          const totalWidth = childWidths.reduce((sum, width) => sum + width, 0);
          
          // Start from the left and position each child
          let currentX = position.x - totalWidth / 2;
          
          children.forEach((child, index) => {
            const childWidth = childWidths[index];
            const childPosition = {
              x: currentX + childWidth / 2,
              y: position.y + verticalSpacing,
            };
            processNode(child, level + 1, childPosition, nodeId);
            currentX += childWidth;
          });
        }
      }

      return nodeIdCounter;
    };

    // Process all root nodes
    treeData?.forEach((rootNode: NodeData, index: number) => {
      processNode(rootNode, 0, { x: 400 + index * 300, y: 50 });
    });

    console.log('TreeView V2 - Generated nodes:', flowNodes.length, 'edges:', flowEdges.length);
    console.log('Edges:', flowEdges);

    return { nodes: flowNodes, edges: flowEdges };
  }, [treeData, collapsedNodes, handleNodeClick, handleToggleNode]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes and edges when they change
  React.useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  if (!treeData || treeData.length === 0) {
    return (
      <div style={{
        background: 'rgba(230,230,240,0.96)',
        borderRadius: 12,
        padding: '40px',
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic'
      }}>
        No project data available
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(230,230,240,0.96)',
      borderRadius: 12,
      padding: '20px',
      minHeight: '600px',
      width: '100%',
      height: '600px',
      position: 'relative', // For absolute positioning of EditFanout
      overflow: 'visible', // Allow EditFanout to extend beyond container
    }}>
      <div style={{
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: '#022AFF',
          margin: 0,
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Project Tree Structure (Version 2 - ReactFlow)
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '4px'
        }}>
          Click nodes to edit • Use +/− to expand/collapse
        </div>
      </div>

      <div style={{ width: '100%', height: '520px' }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          elementsSelectable={true}
          nodesConnectable={false}
          nodesDraggable={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={true}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <ProjectViewModal
        editNode={editNode}
        createNode={createNode}
        project={project}
        onCloseEdit={handleCloseEdit}
        onCloseCreate={handleCloseCreate}
        onSave={handleSave}
        onSaveCreate={handleSaveCreate}
      />
    </div>
  );
};

export default ProjectTreeViewV2;
