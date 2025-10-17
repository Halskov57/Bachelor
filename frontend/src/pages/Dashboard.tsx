import React, { useEffect, useState } from 'react';
import { parseJwt } from '../utils/jwt';
import EditFanout from '../components/EditFanout'; // Import your fanout component

interface Project {
  id: string;
  name: string;
  // add other fields as needed
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = parseJwt(token);
    const username = payload?.sub;
    if (!username) return;

    fetch(process.env.REACT_APP_API_URL || `http://localhost:8081/projects/user/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const mappedProjects = Array.isArray(data)
          ? data.map((p: any) => ({
              id: p.projectId || p.id,
              name: p.title || p.name,
            }))
          : [];
        setProjects(mappedProjects);
        setLoading(false);
      });
  };

  const handleDelete = (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const token = localStorage.getItem('token');
    fetch(process.env.REACT_APP_API_URL || `http://localhost:8081/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      setProjects(projects => projects.filter(p => p.id !== projectId));
    });
  };

  const handleCreate = (data: { title: string; description: string }) => {
    setCreating(true);
    const token = localStorage.getItem('token');
    const payload = parseJwt(token!);
    const username = payload?.sub;
    fetch(process.env.REACT_APP_API_URL || `http://localhost:8081/projects?username=${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setShowCreate(false);
        setCreating(false);
        fetchProjects();
      });
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        margin: 'auto',
        padding: '20px 20px 20px 20px',
        maxWidth: '800px',
        textAlign: 'center',
        background: 'rgba(230,230,240,0.92)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(2,42,255,0.18), 0 0 32px 8px rgba(255,255,255,0.10)',
        marginTop: '150px',
      }}
    >
      <button
        style={{
          marginBottom: 24,
          padding: '10px 24px',
          borderRadius: '8px',
          background: '#022AFF',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={() => setShowCreate(true)}
      >
        + Create Project
      </button>

      {showCreate && (
        <EditFanout
          node={{ type: 'project' }}
          mode="create"
          onClose={() => {
            setShowCreate(false);
            fetchProjects(); // Refresh after closing the fanout
          }}
          onSave={() => {}} // Not needed, EditFanout handles everything
        />
      )}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
        }}>
          {projects.map(project => (
            <div key={project.id} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                style={{
                  minWidth: '160px',
                  minHeight: '80px',
                  background: '#fff',
                  border: '2px solid #022AFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(2,42,255,0.08)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#022AFF',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  padding: '16px',
                  width: '100%',
                }}
                onClick={() => window.location.href = `/project?id=${project.id}`}
              >
                {project.name}
              </button>
              <span
                title="Delete project"
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: '#d11a2a',
                  background: '#fff',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  cursor: 'pointer',
                  border: '1px solid #d11a2a',
                  boxShadow: '0 1px 4px rgba(2,42,255,0.08)',
                  zIndex: 2,
                }}
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
              >
                🗑
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;