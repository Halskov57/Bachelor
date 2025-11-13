package bachelor.projectmanagement.model;
import org.springframework.data.annotation.Id;

import java.util.ArrayList;
import java.util.List;

public class Feature {

    @Id
    private String featureId;
    private String title;
    private String description;
    private FeatureStatus status;

    private List<Task> tasks = new ArrayList<>();

    public Feature() {
        this.tasks = new ArrayList<>();
    }

    public Feature(String title, String description) {
        this.title = title;
        this.description = description;
        this.status = FeatureStatus.TODO;
        this.tasks = new ArrayList<>();
    }

    // Getters and setters
    public String getFeatureId() { return featureId; }
    public void setFeatureId(String featureId) { this.featureId = featureId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public FeatureStatus getStatus() { return status; }
    public void setStatus(FeatureStatus status) { this.status = status; }

    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks != null ? tasks : new ArrayList<>(); }
}
