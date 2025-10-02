import React, { useEffect, useState, useMemo, useRef } from 'react';
import Tree from 'react-d3-tree';

function toTreeData(project: any) {
  if (!project || !(project.title || project.name)) return null;
  return {
    name: String(project.title || project.name),
    type: 'project',
    children: (project.epics || []).map((epic: any) => ({
      name: String(epic.title),
      type: 'epic',
      children: (epic.features || []).map((feature: any) => ({
        name: String(feature.title),
        type: 'feature',
        children: (feature.tasks || []).map((task: any) => ({
          name: String(task.title),
          type: 'task',
        })),
      })),
    })),
  };
}

const Project: React.FC = () => {
  const [project, setProject] = useState<any>(null);
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8081/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProject(data));
  }, []);

  const treeData = useMemo(() => {
    const tree = toTreeData(project);
    return tree ? [tree] : [];
  }, [project]);

  useEffect(() => {
    if (treeContainerRef.current) {
      const { width } = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, [view, project]);

  // Color and style logic for both views
  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'project':
        return {
          background: '#022AFF',
          color: '#fff',
          border: 'none',
          fontWeight: 500,
        };
      case 'epic':
        return {
          background: '#022AFF',
          color: '#fff',
          border: 'none',
          fontWeight: 500,
        };
      case 'feature':
        return {
          background: '#fff',
          color: '#022AFF',
          border: '1.5px solid #022AFF',
          fontWeight: 400,
        };
      case 'task':
        return {
          background: '#e6f0ff',
          color: '#022AFF',
          border: 'none',
          fontWeight: 400,
        };
      default:
        return {};
    }
  };

  const renderCustomNode = ({ nodeDatum, hierarchyPointNode }: any) => {
    const text = nodeDatum.name;
    const padding = 24;
    const fontSize = 16;
    const width = Math.max(100, text.length * fontSize * 0.6 + padding);
    const height = 44;
    const type = nodeDatum.type || (
      hierarchyPointNode.depth === 0 ? 'project' :
      hierarchyPointNode.depth === 1 ? 'epic' :
      hierarchyPointNode.depth === 2 ? 'feature' : 'task'
    );
    const style = getNodeStyle(type);

    return (
      <g>
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill={style.background}
          stroke={style.border ? '#022AFF' : style.background}
          strokeWidth={style.border ? 2 : 0}
        />
        <text
          fill={style.color}
          fontSize={fontSize}
          x={0}
          y={5}
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{
            fontWeight: style.fontWeight,
            pointerEvents: 'none',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          {text}
        </text>
      </g>
    );
  };

  if (!project) return <div>Loading...</div>;

  // List view with project as root node
  return (
    <>
      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(230,230,240,0.96)',
          padding: '16px 0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(2,42,255,0.08)',
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
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
              fontSize: '1.2rem'
            }}>
              {project.title || project.name}
              <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
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
                            ...getNodeStyle('epic'),
                            borderRadius: '18px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            marginBottom: '8px',
                            fontSize: '1rem'
                          }}
                        >
                          {epic.title} {isEpicExpanded ? '▲' : '▼'}
                        </button>
                      ) : (
                        <span style={{ ...getNodeStyle('epic'), borderRadius: '18px', padding: '8px 16px' }}>{epic.title}</span>
                      )}
                      {hasFeatures && isEpicExpanded && (
                        <ul style={{ marginLeft: '24px', marginTop: '8px', padding: 0, listStyle: 'none' }}>
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
                                      ...getNodeStyle('feature'),
                                      borderRadius: '12px',
                                      padding: '6px 14px',
                                      cursor: 'pointer',
                                      marginBottom: '6px',
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {feature.title} {isFeatureExpanded ? '▲' : '▼'}
                                  </button>
                                ) : (
                                  <span style={{ ...getNodeStyle('feature'), borderRadius: '12px', padding: '6px 14px' }}>{feature.title}</span>
                                )}
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
                                          fontSize: '1rem'
                                        }}
                                      >
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
            </li>
          </ul>
        ) : (
          <div
            ref={treeContainerRef}
            style={{ width: '100%', height: '700px', background: 'rgba(230,230,240,0.96)', borderRadius: 12 }}
          >
            <Tree
              data={treeData}
              orientation="vertical"
              translate={translate}
              renderCustomNodeElement={renderCustomNode}
              separation={{ siblings: 2.5, nonSiblings: 3.5 }}
              nodeSize={{ x: 220, y: 90 }}
              zoomable={true}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Project;