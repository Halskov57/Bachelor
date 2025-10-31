import React, { useState } from 'react';
import { NodeData } from '../../../utils/types';
import { useProjectViewState } from '../hooks/useProjectViewState';
import { ProjectViewModal } from '../components/ProjectViewModal';

interface TreeNodeProps {
  node: NodeData;
  level: number;
  collapsed: { [key: string]: boolean };
  onToggle: (id: string) => void;
  onNodeClick: (node: NodeData) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, collapsed, onToggle, onNodeClick }) => {
  const hasChildren = node.children && node.children.length > 0;
  const nodeId = node.id || node.title;
  const isCollapsed = collapsed[nodeId];

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
    <div style={{ 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: level > 0 ? '60px' : '0'
    }}>
      {/* Connection line from parent (comes from above) */}
      {level > 0 && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '40px',
          backgroundColor: '#999',
          pointerEvents: 'none',
          zIndex: 1
        }} />
      )}
      
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: getNodeColor(node.type),
          color: '#fff',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          zIndex: 2,
          minWidth: '120px',
          justifyContent: 'center'
        }}
        onClick={() => onNodeClick(node)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }}
      >
        <div style={{
          fontWeight: '600',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {node.title}
        </div>
        
        {/* Expand/collapse indicator */}
        {hasChildren && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle(nodeId);
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
              color: '#333'
            }}
          >
            {isCollapsed ? '+' : '−'}
          </div>
        )}
      </div>
      
      {hasChildren && !isCollapsed && (
        <div style={{ position: 'relative' }}>
          {/* Check if children are tasks (show as list) or other types (show as tree) */}
          {node.children![0]?.type === 'task' ? (
            /* Tasks as vertical list */
            <div>
              {/* Vertical line down from feature to task list */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: '40px',
                backgroundColor: '#999',
                zIndex: 1
              }} />
              
              {/* Tasks container */}
              <div style={{
                marginTop: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                {node.children!.map((task, index) => (
                  <div key={task.id || task.title}>
                    {/* Task node */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        backgroundColor: getNodeColor(task.type),
                        color: '#fff',
                        borderRadius: '15px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '100px',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      onClick={() => onNodeClick(task)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                      }}
                    >
                      {task.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Non-tasks as horizontal tree */
            <div>
              {/* Vertical line down from this node */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '2px',
                height: '40px',
                backgroundColor: '#999',
                zIndex: 1
              }} />
              
              {/* Horizontal line connecting all children */}
              {node.children!.length > 1 && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: `${(node.children!.length - 1) * 120}px`,
                  height: '2px',
                  backgroundColor: '#999',
                  zIndex: 1
                }} />
              )}
              
              {/* Vertical lines from horizontal connector to each child */}
              {node.children!.map((child, index) => {
                const childCount = node.children!.length;
                const offsetFromCenter = (index - (childCount - 1) / 2) * 120;
                
                return (
                  <div
                    key={`connector-${child.id || child.title}`}
                    style={{
                      position: 'absolute',
                      top: '60px',
                      left: '50%',
                      transform: `translateX(${offsetFromCenter - 1}px)`,
                      width: '2px',
                      height: '40px',
                      backgroundColor: '#999',
                      zIndex: 1
                    }}
                  />
                );
              })}
              
              {/* Children container */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '120px',
                marginTop: '100px',
                position: 'relative'
              }}>
                {node.children!.map((child, index) => (
                  <TreeNode
                    key={child.id || child.title}
                    node={child}
                    level={level + 1}
                    collapsed={collapsed}
                    onToggle={onToggle}
                    onNodeClick={onNodeClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectTreeView: React.FC<{ treeData: any, fetchProjectById: () => void, project?: any }> = ({ treeData, fetchProjectById, project }) => {
  const [collapsedNodes, setCollapsedNodes] = useState<{ [id: string]: boolean }>({});

  const {
    editNode,
    createNode,
    handleEditNode,
    handleCloseEdit,
    handleCloseCreate,
    handleSave,
    handleSaveCreate,
  } = useProjectViewState(fetchProjectById);

  const handleToggleNode = (nodeId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleNodeClick = (node: NodeData) => {
    handleEditNode(node);
  };

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
      padding: '40px',
      minHeight: '400px',
      width: '100%',
      overflow: 'visible'
    }}>
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: '#022AFF',
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
      
      {treeData.map((rootNode: NodeData, index: number) => (
        <TreeNode
          key={rootNode.id || rootNode.title}
          node={rootNode}
          level={0}
          collapsed={collapsedNodes}
          onToggle={handleToggleNode}
          onNodeClick={handleNodeClick}
        />
      ))}
      
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

export default ProjectTreeView;