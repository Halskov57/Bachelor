package bachelor.projectmanagement.model;

public class EpicDeletedEvent {
    private String id;
    private String title;
    private String projectId;
    private User deletedBy;

    public EpicDeletedEvent() {}

    public EpicDeletedEvent(String id, String title, String projectId, User deletedBy) {
        this.id = id;
        this.title = title;
        this.projectId = projectId;
        this.deletedBy = deletedBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public User getDeletedBy() { return deletedBy; }
    public void setDeletedBy(User deletedBy) { this.deletedBy = deletedBy; }
}