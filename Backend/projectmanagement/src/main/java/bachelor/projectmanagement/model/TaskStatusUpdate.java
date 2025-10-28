package bachelor.projectmanagement.model;

public class TaskStatusUpdate {
    private String id;
    private String projectId;
    private String status;
    private String title;
    private User updatedBy;

    public TaskStatusUpdate() {}

    public TaskStatusUpdate(String id, String projectId, String status, String title, User updatedBy) {
        this.id = id;
        this.projectId = projectId;
        this.status = status;
        this.title = title;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
}