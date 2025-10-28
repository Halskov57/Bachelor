package bachelor.projectmanagement.model;

public class StructureUpdate {
    private String type;
    private String action;
    private String projectId;
    private StructureUpdateData data;
    private User updatedBy;

    public StructureUpdate() {}

    public StructureUpdate(String type, String action, String projectId, StructureUpdateData data, User updatedBy) {
        this.type = type;
        this.action = action;
        this.projectId = projectId;
        this.data = data;
        this.updatedBy = updatedBy;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public StructureUpdateData getData() { return data; }
    public void setData(StructureUpdateData data) { this.data = data; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }

    public static class StructureUpdateData {
        private String id;
        private String title;
        private String type;
        private String parentId;

        public StructureUpdateData() {}

        public StructureUpdateData(String id, String title, String type, String parentId) {
            this.id = id;
            this.title = title;
            this.type = type;
            this.parentId = parentId;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getParentId() { return parentId; }
        public void setParentId(String parentId) { this.parentId = parentId; }
    }
}