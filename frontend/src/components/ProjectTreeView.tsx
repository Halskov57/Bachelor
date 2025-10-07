import React, { useState, useRef, useEffect, useMemo } from 'react';
import EditFanout from './EditFanout';
import Tree from 'react-d3-tree';
import ThreeDotsMenu from './ThreeDotsMenu';

function measureTextWidth(text: string, font: string): number {
  const fn = measureTextWidth as typeof measureTextWidth & { canvas?: HTMLCanvasElement };
  const canvas = fn.canvas || (fn.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) return 100;
  context.font = font;
  return context.measureText(text).width;
}

const getNodeStyle = (type: string) => {
  switch (type) {
    case 'project':
      return { background: '#022AFF', color: '#fff', border: '#001a66', fontWeight: 400 };
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

const ProjectTreeView: React.FC<{ treeData: any, fetchProjectById: () => void }> = ({ treeData, fetchProjectById }) => {
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: string]: boolean }>({});
  const [editNode, setEditNode] = useState<any>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [treeData]);

  const handleNodeClick = (nodeData: any) => {
    setSelectedNode(nodeData);
  };

  const handleNodeHover = (nodeData: any) => {
    // Optionally show a tooltip or highlight
  };

  const handleToggleNode = (nodeId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const style = getNodeStyle(nodeDatum.type);
    const fontSize = 20;
    const fontWeight = style.fontWeight || 400;
    const fontFamily = 'Arial, sans-serif';
    const font = `normal ${fontWeight} ${fontSize}px ${fontFamily}`;
    const textWidth = measureTextWidth(nodeDatum.name, font)+10;
    const padding = 24;
    const iconArea = 44;
    const width = Math.max(80, textWidth + padding + iconArea);
    const height = 44;
    const iconSize = 44;

    const isFeature = nodeDatum.type === 'feature';
    const featureKey = nodeDatum.__rd3t?.id || nodeDatum.name;
    const hasTasks = nodeDatum.tasks && nodeDatum.tasks.length > 0;
    const isTaskListOpen = expandedFeatures[featureKey];
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

    return (
      <g>
        {/* Main rounded button */}
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
        {/* Transparent clickable rect for edit */}
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          fill="transparent"
          stroke="transparent"
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            setEditNode({
              ...nodeDatum,
              type: nodeDatum.type,
              id: nodeDatum.id,
              projectId: nodeDatum.projectId,
              epicId: nodeDatum.epicId,
              featureId: nodeDatum.featureId,
            });
          }}
        />
        {/* Title text (no onClick needed) */}
        <text
          x={-width / 2 + 18}
          y={2}
          textAnchor="start"
          alignmentBaseline="middle"
          fontSize={fontSize}
          fill="#fff"
          fontWeight="bold"
          style={{
            fontWeight: style.fontWeight,
            fontFamily: 'Arial, sans-serif',
            pointerEvents: 'none',
            userSelect: 'none',
            stroke: 'none',
            strokeWidth: 0,
            textShadow: 'none'
          }}
        >
          {nodeDatum.name}
        </text>
        {/* Small circle button for +/- */}
        {hasChildren && (
          <g
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={e => {
              e.stopPropagation();
              handleToggleNode(nodeDatum.__rd3t?.id || nodeDatum.name); // update icon state
              toggleNode(); // built-in collapse/expand
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
              {collapsedNodes[featureKey] ? '+' : '-'}
            </text>
          </g>
        )}
        {/* Feature: show task list toggle */}
        {isFeature && hasTasks && !nodeDatum._collapsed && (
          <g
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={e => {
              e.stopPropagation();
              setExpandedFeatures(f => ({ ...f, [featureKey]: !isTaskListOpen }));
            }}
          >
            <ellipse
              cx={width / 2 - iconSize + 22}
              cy={0}
              rx={iconSize / 2.5+3}
              ry={iconSize / 2.5+3}
              fill="#fff"
              stroke="#022AFF"
              strokeWidth={1}
            />
            <text
              x={width / 2 - iconSize + 22}
              y={2}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={18}
              fill="#022AFF"
            >
              {isTaskListOpen ? '-' : '+'}
            </text>
          </g>
        )}
        {/* Render tasks as a list below feature node */}
        {isFeature && hasTasks && isTaskListOpen && !nodeDatum._collapsed && (
          <g>
            {nodeDatum.tasks.map((task: any, idx: number) => (
              <g key={task.name}>
                <rect
                  x={-width / 2}
                  y={height / 2 + 8 + idx * 32}
                  width={width}
                  height={28}
                  rx={14}
                  fill="#e6f0ff"
                  stroke="#022AFF"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={height / 2 + 28 + idx * 32 - 6}
                  fill="#022AFF"
                  fontSize={14}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {task.name}
                </text>
              </g>
            ))}
          </g>
        )}
        {/* Three dots menu for editing */}
        <foreignObject
          x={width / 2 + 8}
          y={-height / 2}
          width={40}
          height={40}
          style={{ overflow: 'visible' }}
        >
          <ThreeDotsMenu
            onEdit={() => setEditNode({
              ...nodeDatum,
              type: nodeDatum.type,
              id: nodeDatum.id,
              projectId: nodeDatum.projectId,
              epicId: nodeDatum.epicId,
              featureId: nodeDatum.featureId,
            })}
            onAddChild={() => {/* your add child logic */}}
            onDelete={() => {/* your delete logic */}}
            iconColor="#fff"
            size={22}
          />
        </foreignObject>
      </g>
    );
  };

  function applyCollapsedState(node: any, collapsedMap: any) {
    const id = node.__rd3t?.id || node.name; // Use a unique id if possible
    const newNode = { ...node };
    if (node.children && node.children.length > 0) {
      newNode._collapsed = !!collapsedMap[id];
      newNode.children = node.children.map((child: any) => applyCollapsedState(child, collapsedMap));
    }
    return newNode;
  }

  const treeDataWithCollapse = useMemo(() => {
    if (!treeData || !treeData[0]) return [];
    return [applyCollapsedState(treeData[0], collapsedNodes)];
  }, [treeData, collapsedNodes]);

  return (
    <div
      ref={treeContainerRef}
      style={{ width: '100%', height: '700px', background: 'rgba(230,230,240,0.96)', borderRadius: 12 }}
    >
      <Tree
        data={treeData}
        orientation="vertical"
        translate={translate}
        renderCustomNodeElement={renderCustomNode}
        separation={{ siblings: 2, nonSiblings: 2.5 }}
        nodeSize={{ x: 100, y: 90 }}
        zoomable={true}
        collapsible={true}
        onNodeClick={handleNodeClick}
        onNodeMouseOver={handleNodeHover}
      />
      {editNode && (
        <EditFanout
          node={editNode}
          mode="edit"
          onClose={() => {
            setEditNode(null);
            fetchProjectById(); // <-- refreshes the current project data
          }}
          onSave={(data: any) => {
            setEditNode(null);
            fetchProjectById(); // Optionally refresh after save
          }}
        />
      )}
    </div>
  );
};

export default ProjectTreeView;
