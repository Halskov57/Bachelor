import React, { useState, useEffect } from 'react';
import { getCourseLevelConfig, updateCourseLevelConfig } from '../utils/graphqlMutations';

interface FeatureConfig {
  key: string;
  enabled: boolean;
}

interface CourseLevelConfig {
  id: string;
  courseLevel: number;
  features: FeatureConfig[];
}

const Admin: React.FC = () => {
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<number>(1);
  const [config, setConfig] = useState<CourseLevelConfig | null>(null);
  const [taskUserAssignmentEnabled, setTaskUserAssignmentEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Load configuration when course level changes
  useEffect(() => {
    loadConfig();
  }, [selectedCourseLevel]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configData = await getCourseLevelConfig(selectedCourseLevel);
      setConfig(configData);
      
      // Find task user assignment feature
      const taskUserFeature = configData.features.find((f: FeatureConfig) => f.key === 'TASK_USER_ASSIGNMENT');
      setTaskUserAssignmentEnabled(taskUserFeature ? taskUserFeature.enabled : true);
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const updatedConfig = await updateCourseLevelConfig(selectedCourseLevel, taskUserAssignmentEnabled);
      setConfig(updatedConfig);
      setMessage('Configuration saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Admin - Course Level Configuration</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Course Level:
        </label>
        <select
          value={selectedCourseLevel}
          onChange={(e) => setSelectedCourseLevel(Number(e.target.value))}
          style={{
            padding: '8px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '100px'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(level => (
            <option key={level} value={level}>
              Course Level {level}
            </option>
          ))}
        </select>
      </div>

      {config && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Configuration for Course Level {selectedCourseLevel}</h2>
          
          <div style={{ 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                <input
                  type="checkbox"
                  checked={taskUserAssignmentEnabled}
                  onChange={(e) => setTaskUserAssignmentEnabled(e.target.checked)}
                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                />
                Enable Task User Assignment
              </label>
              <p style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginLeft: '30px',
                marginTop: '5px'
              }}>
                When enabled, users can assign team members to specific tasks within projects.
              </p>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: message.includes('Failed') ? '#f8d7da' : '#d4edda',
          color: message.includes('Failed') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Failed') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}

      {loading && !message && (
        <div style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default Admin;