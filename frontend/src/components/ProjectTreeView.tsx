import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';
import EditFanout from './EditFanout';
import Tree from 'react-d3-tree';
import { NodeData } from '../utils/types';

interface ProjectTreeViewProps {
  treeData: NodeData[];
  project?: {
    id: string;
    title: string;
    epics?: any[];
    [key: string]: any;
  };
   fetchProjectById?: () => Promise<void>;
}

const ProjectTreeView: React.FC<{ treeData: any, fetchProjectById: () => void, project?: any, allUsers?: any[] }> = ({ treeData, fetchProjectById, project, allUsers = [] }) => {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: string]: boolean }>({});
  const [editNode, setEditNode] = useState<NodeData | null>(null);
  const [createNode, setCreateNode] = useState<{ type: string; parentIds: any; parentNode?: NodeData } | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<{ [id: string]: boolean }>({});

  const client = useApolloClient();

  const refetchProject = async () => {
    await client.refetchQueries({
      include: ['ProjectById'], // Match the query name in Project.tsx
    });
  };

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [treeData]);

  const handleNodeClick = (nodeDatum: any, event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    const node: NodeData = {
      type: nodeDatum.attributes?.type || 'project',
      id: nodeDatum.attributes?.id,
      title: nodeDatum.title,
      description: nodeDatum.description,
      status: nodeDatum.status,
      userIds: nodeDatum.users,
      projectId: nodeDatum.projectId,
      epicId: nodeDatum.epicId,
      featureId: nodeDatum.featureId,
    };
    setSelectedNode(node);
  };

  const handleToggleNode = (nodeId: string) =>
    setCollapsedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));

  const handleAddChild = (nodeDatum: NodeData) => {
    let nodeType = '';
    let parentIds: any = {};

    if (nodeDatum.type === 'project') {
      nodeType = 'epic';
      parentIds = { projectId: nodeDatum.id };
    } else if (nodeDatum.type === 'epic') {
      nodeType = 'feature';
      parentIds = { projectId: nodeDatum.projectId, epicId: nodeDatum.id };
    } else if (nodeDatum.type === 'feature') {
      nodeType = 'task';
      parentIds = { projectId: nodeDatum.projectId, epicId: nodeDatum.epicId, featureId: nodeDatum.id };
    }

    setCreateNode({ type: nodeType, parentIds, parentNode: nodeDatum });
  };

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

  function applyCollapsedState(node: NodeData, collapsedMap: { [key: string]: boolean }): NodeData {
    const id = node.id || node.title;
    if (!id) return node;
    const newNode: NodeData & { _collapsed?: boolean; children?: NodeData[] } = { ...node };
    if (node.children && node.children.length > 0) {
      newNode._collapsed = !!collapsedMap[id];
      newNode.children = node.children.map((child) => applyCollapsedState(child, collapsedMap));
    }
    return newNode;
  }

  function mapToTreeNode(node: NodeData & { _collapsed?: boolean; children?: NodeData[] }): any {
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
  }

  const treeDataWithCollapse = useMemo(() => {
    if (!treeData || treeData.length === 0) return [];
    return treeData.map((node) => applyCollapsedState(node, collapsedNodes));
  }, [treeData, collapsedNodes]);

  const treeDataForTree = useMemo(() => treeDataWithCollapse.map(mapToTreeNode), [treeDataWithCollapse]);

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
      {editNode && project && (
  <EditFanout
    node={editNode}
    mode="edit"
    project={{
      ...project,
      type: 'project',
      courseLevel: project.courseLevel || 0,
      owners: project.owners || [],
    }}
    onClose={() => {
      setEditNode(null);
      refetchProject();
    }}
    onSave={async () => {
      setEditNode(null);
      await refetchProject();
    }}
  />
)}

{createNode && project && (
  <EditFanout
    createNode={createNode}
    mode="create"
    project={{
      ...project,
      type: 'project',
      courseLevel: project.courseLevel || 0,
      owners: project.owners || [],
    }}
    onClose={() => setCreateNode(null)}
    onSave={async () => {
      setCreateNode(null);
      await refetchProject();
    }}
  />
)}

    </div>
  );
};

export default ProjectTreeView;
