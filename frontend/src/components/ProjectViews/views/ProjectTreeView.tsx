import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { NodeData } from '../../../utils/types';
import { useProjectViewState } from '../hooks/useProjectViewState';
import { ProjectViewModal } from '../components/ProjectViewModal';
import { createNodeFromTreeData } from '../utils/nodeHelpers';

const ProjectTreeView: React.FC<{ treeData: any, fetchProjectById: () => void, project?: any }> = ({ treeData, fetchProjectById, project }) => {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [treeData]);

  const handleNodeClick = (nodeDatum: any, event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    const node = createNodeFromTreeData(nodeDatum);
    handleEditNode(node);
  };

  const handleToggleNode = (nodeId: string) =>
    setCollapsedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'project':
      case 'epic':
        return { background: '#2456e6', color: '#fff', border: '#001a66', fontWeight: 400 };
      case 'feature':
        return { background: '#4d8cff', color: '#fff', border: '#001a66', fontWeight: 400 };
      case 'task':
        return { background: '#b3d1ff', color: '#fff', border: '#001a66', fontWeight: 400 };
      default:
        return { background: '#fff', color: '#001a66', border: '#001a66', fontWeight: 400 };
    }
  };

  function measureTextWidth(text: string, font: string): number {
    const fn = measureTextWidth as typeof measureTextWidth & { canvas?: HTMLCanvasElement };
    const canvas = fn.canvas || (fn.canvas = document.createElement('canvas'));
    const context = canvas.getContext('2d');
    if (!context) return 100;
    context.font = font;
    return context.measureText(text).width;
  }

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const style = getNodeStyle(nodeDatum.attributes?.type || 'project');
    const fontSize = 20;
    const font = `normal ${style.fontWeight} ${fontSize}px Arial, sans-serif`;
    const textWidth = measureTextWidth(nodeDatum.title, font) + 10;
    const padding = 24;
    const iconArea = 44;
    const width = Math.max(80, textWidth + padding + iconArea);
    const height = 44;
    const iconSize = 44;

    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

    return (
      <g>
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill={style.background}
          stroke={style.border}
          strokeWidth={style.border ? 2 : 0}
        />
        <text
          x={-width / 2 + 18}
          y={2}
          textAnchor="start"
          alignmentBaseline="middle"
          fontSize={fontSize}
          fill="#fff"
          fontWeight="bold"
        >
          {nodeDatum.title}
        </text>
        {hasChildren && (
          <g
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleNode(nodeDatum.attributes?.id || nodeDatum.title);
              toggleNode();
            }}
          >
            <ellipse
              cx={width / 2 - iconSize / 2}
              cy={0}
              rx={iconSize / 2}
              ry={iconSize / 2}
              fill="#fff"
              stroke="#022AFF"
              strokeWidth={2}
            />
            <text
              x={width / 2 - iconSize / 2}
              y={2}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={22}
              fill="#022AFF"
            >
              {collapsedNodes[nodeDatum.attributes?.id || nodeDatum.title] ? '+' : '-'}
            </text>
          </g>
        )}
      </g>
    );
  };

  const applyCollapsedState = useCallback((node: NodeData, collapsedMap: { [key: string]: boolean }): NodeData => {
    const id = node.id || node.title;
    if (!id) return node;
    const newNode: NodeData & { _collapsed?: boolean; children?: NodeData[] } = { ...node };
    if (node.children && node.children.length > 0) {
      newNode._collapsed = !!collapsedMap[id];
      newNode.children = node.children.map((child) => applyCollapsedState(child, collapsedMap));
    }
    return newNode;
  }, []);

  const mapToTreeNode = useCallback((node: NodeData & { _collapsed?: boolean; children?: NodeData[] }): any => {
    return {
      name: node.title,
      title: node.title,
      description: node.description,
      status: node.status,
      projectId: node.projectId,
      epicId: node.epicId,
      featureId: node.featureId,
      users: node.userIds,
      attributes: { 
        type: node.type, 
        id: node.id,
        projectId: node.projectId,
        epicId: node.epicId,
        featureId: node.featureId,
      },
      children: node.children?.map(mapToTreeNode),
      _collapsed: node._collapsed,
    };
  }, []);

  const treeDataWithCollapse = useMemo(() => {
    if (!treeData || treeData.length === 0) return [];
    return treeData.map((node: NodeData) => applyCollapsedState(node, collapsedNodes));
  }, [treeData, collapsedNodes, applyCollapsedState]);

  const treeDataForTree = useMemo(() => treeDataWithCollapse.map(mapToTreeNode), [treeDataWithCollapse, mapToTreeNode]);

  return (
    <div
      ref={treeContainerRef}
      style={{ width: '100%', height: '700px', background: 'rgba(230,230,240,0.96)', borderRadius: 12 }}
    >
      <Tree
        data={treeDataForTree}
        orientation="vertical"
        translate={translate}
        renderCustomNodeElement={renderCustomNode}
        separation={{ siblings: 2, nonSiblings: 2.5 }}
        nodeSize={{ x: 100, y: 90 }}
        zoomable
        collapsible
        onNodeClick={handleNodeClick as any}
      />
      
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