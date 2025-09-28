import React, { useEffect, useState } from 'react';

const Project: React.FC = () => {
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8081/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched project:", data);
        setProject(data);
      });
  }, []);

  if (!project) return <div>Loading...</div>;

  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '80px',
      position: 'relative',
      zIndex: 2
    }}>
      <h2>{project.title || project.name}</h2>
      <ul style={{
        textAlign: 'left',
        display: 'inline-block',
        marginTop: '32px',
        color: '#fff', // or '#022AFF'
      }}>
        {project.epics && project.epics.map((epic: any) => (
          <li key={epic.id || epic._id || epic.title}>
            <strong>{epic.title}</strong>
            {epic.features && (
              <ul>
                {epic.features.map((feature: any) => (
                  <li key={feature.id || feature._id || feature.title}>
                    {feature.title}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Project;