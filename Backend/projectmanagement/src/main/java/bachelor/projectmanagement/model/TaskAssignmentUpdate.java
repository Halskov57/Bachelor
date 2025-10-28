package bachelor.projectmanagement.model;

import java.util.List;

public class TaskAssignmentUpdate {
    private String taskId;
    private String projectId;
    private List<User> assignedUsers;
    private User updatedBy;

    public TaskAssignmentUpdate() {}

    public TaskAssignmentUpdate(String taskId, String projectId, List<User> assignedUsers, User updatedBy) {
        this.taskId = taskId;
        this.projectId = projectId;
        this.assignedUsers = assignedUsers;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public List<User> getAssignedUsers() { return assignedUsers; }
    public void setAssignedUsers(List<User> assignedUsers) { this.assignedUsers = assignedUsers; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
}