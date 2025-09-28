import React, { useEffect, useState } from 'react';
import { parseJwt } from '../utils/jwt';

interface Project {
  id: string;
  name: string;
  // add other fields as needed
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = parseJwt(token);
    const username = payload?.sub;
    if (!username) return;

    fetch(`http://localhost:8081/projects/user/${username}`, {
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
  }, []);

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
        marginTop: '150px', // smaller margin so header is visible
      }}
    >
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
            <button
              key={project.id}
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
              }}
              onClick={() => window.location.href = `/project?id=${project.id}`}
            >
              {project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;