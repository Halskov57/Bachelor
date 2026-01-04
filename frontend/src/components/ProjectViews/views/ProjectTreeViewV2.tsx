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
import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import EditFanout from '../../EditFanout';
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
        marginTop: '-4px',
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
              {task.dueDate && (
                <span style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffc107',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}>
                  📅 {new Date(task.dueDate).toLocaleDateString('da-DK', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
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
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<any>(null);

  const handleNodeClick = useCallback((node: NodeData) => {
    setCurrentNode(node);
    if (!editSheetOpen) {
      setEditSheetOpen(true);
    }
  }, [editSheetOpen]);

  const handleSheetClose = () => {
    setEditSheetOpen(false);
    setCurrentNode(null);
  };

  const handleSaveNode = () => {
    fetchProjectById();
  };

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

    const verticalSpacing = 100;
    const horizontalSpacing = 200;
    //const taskSpacing = 40;

    // Calculate the total width a node and its descendants will occupy
    const calculateSubtreeWidth = (node: NodeData, collapsedNodes: Set<string>): number => {
      const nodeId = node.id || node.title;
      const isCollapsed = collapsedNodes.has(nodeId);
      
      if (!node.children || node.children.length === 0 || isCollapsed) {
        return horizontalSpacing;
      }

      const childrenAreTasks = node.children[0]?.type === 'task';
      
      if (childrenAreTasks) {
        return horizontalSpacing;
      } else {
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
          const taskContainerId = `task-container-${nodeId}`;
          const taskContainerWidth = 150;
          const nodeWidth = 150;
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          let nodeHeight = 42;
          
          if (context) {
            context.font = '600 14px system-ui, -apple-system, sans-serif';
            const metrics = context.measureText(node.title);
            const textWidth = metrics.width;
            
            const maxTextWidth = 145;
            const lines = Math.max(1, Math.ceil(textWidth / maxTextWidth));
            
            const lineHeight = 18.2;
            const verticalPadding = 16;
            const buffer = 2;
            nodeHeight = (lines * lineHeight) + verticalPadding + buffer;
            
            canvas.remove();
          }
          
          const taskContainerGap = 6;
          
          flowNodes.push({
            id: taskContainerId,
            type: 'taskContainer',
            position: {
              x: position.x + (nodeWidth / 2) - (taskContainerWidth / 2),
              y: position.y + nodeHeight + taskContainerGap,
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            data: {
              tasks: children,
              onNodeClick: handleNodeClick,
            },
          });
        } else {
          const childWidths = children.map(child => calculateSubtreeWidth(child, collapsedNodes));
          const totalWidth = childWidths.reduce((sum, width) => sum + width, 0);
          
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

    treeData?.forEach((rootNode: NodeData, index: number) => {
      processNode(rootNode, 0, { x: 400 + index * 300, y: 50 });
    });
    return { nodes: flowNodes, edges: flowEdges };
  }, [treeData, collapsedNodes, handleNodeClick, handleToggleNode]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

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
    <div className="flex gap-4">
      <div className="flex-1" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px' }}>
      <div style={{
        marginBottom: '10px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: '#8B7355',
          margin: 0,
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Project Tree Structure
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
      </div>

      {/* Edit Panel */}
      {editSheetOpen && currentNode && (
        <Card className="w-[400px] max-h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-end p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSheetClose}
              className="h-7 w-7 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pt-0">
            <EditFanout
              mode="edit"
              node={currentNode}
              project={project}
              onClose={handleSheetClose}
              onSave={handleSaveNode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectTreeViewV2;
