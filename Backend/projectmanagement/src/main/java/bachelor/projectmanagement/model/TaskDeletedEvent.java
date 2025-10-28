package bachelor.projectmanagement.model;

public class TaskDeletedEvent {
    private String id;
    private String title;
    private String featureId;
    private String epicId;
    private String projectId;
    private User deletedBy;

    public TaskDeletedEvent() {}

    public TaskDeletedEvent(String id, String title, String featureId, String epicId, String projectId, User deletedBy) {
        this.id = id;
        this.title = title;
        this.featureId = featureId;
        this.epicId = epicId;
        this.projectId = projectId;
        this.deletedBy = deletedBy;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFeatureId() { return featureId; }
    public void setFeatureId(String featureId) { this.featureId = featureId; }

    public String getEpicId() { return epicId; }
    public void setEpicId(String epicId) { this.epicId = epicId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public User getDeletedBy() { return deletedBy; }
    public void setDeletedBy(User deletedBy) { this.deletedBy = deletedBy; }
}