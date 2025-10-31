import React, { useMemo } from 'react';

interface TaskWithUsers {
  taskId: string;
  taskTitle: string;
  assignedUsers: { id: string; username: string }[];
}

interface UserTaskTableProps {
  project: any;
}

const UserTaskTable: React.FC<UserTaskTableProps> = ({ project }) => {
  // Extract all tasks with their assigned users
  const taskUserData = useMemo(() => {
    const tasks: TaskWithUsers[] = [];
    
    if (!project?.epics) return tasks;

    project.epics.forEach((epic: any) => {
      if (epic.features) {
        epic.features.forEach((feature: any) => {
          if (feature.tasks) {
            feature.tasks.forEach((task: any) => {
              // Only include tasks with "Done" status
              if (task.status === 'Done') {
                tasks.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  assignedUsers: task.users || [],
                });
              }
            });
          }
        });
      }
    });

    return tasks;
  }, [project]);

  return (
    <div style={{ 
      background: 'rgba(230,230,240,0.96)', 
      borderRadius: 12, 
      padding: '20px',
      margin: '20px 0'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#022AFF',
        textAlign: 'center'
      }}>
        Completed Task Assignments
      </h3>

      {taskUserData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          No completed tasks found in this project
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#022AFF', color: '#fff' }}>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '16px',
                  width: '40%'
                }}>
                  Task Title
                </th>
                <th style={{ 
                  padding: '16px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '16px',
                  width: '60%'
                }}>
                  Assigned Users
                </th>
              </tr>
            </thead>
            <tbody>
              {taskUserData.map((task, index) => (
                <tr key={task.taskId} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff'
                }}>
                  <td style={{ 
                    padding: '16px', 
                    verticalAlign: 'top',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#022AFF',
                      fontSize: '14px'
                    }}>
                      {task.taskTitle}
                    </div>
                  </td>
                  <td style={{ 
                    padding: '16px',
                    borderBottom: '1px solid #eee'
                  }}>
                    {task.assignedUsers.length === 0 ? (
                      <span style={{ 
                        color: '#999', 
                        fontStyle: 'italic',
                        fontSize: '14px'
                      }}>
                        No users assigned
                      </span>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '8px' 
                      }}>
                        {task.assignedUsers.map((user, userIndex) => (
                          <span key={user.id} style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid #bbdefb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            👤 {user.username}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        marginTop: '16px', 
        fontSize: '14px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Total: {taskUserData.length} completed tasks
      </div>
    </div>
  );
};

export default UserTaskTable;