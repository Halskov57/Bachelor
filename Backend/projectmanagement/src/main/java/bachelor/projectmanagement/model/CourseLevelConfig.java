package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "course_configs")
public class CourseLevelConfig {
    
    @Id
    private String id;
    private int courseLevel;
    private String courseName;
    
    // Flexible configuration using a Map - ready for future features
    private Map<String, Object> features = new HashMap<>();
    
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public CourseLevelConfig() {}

    public CourseLevelConfig(int courseLevel, String courseName) {
        this.courseLevel = courseLevel;
        this.courseName = courseName;
        initializeDefaultFeatures();
    }

    private void initializeDefaultFeatures() {
        // Only initialize the task user assignment feature for now
        features.put("taskUserAssignmentEnabled", courseLevel >= 7);
    }

    // Generic feature access methods (ready for future features)
    public boolean isFeatureEnabled(String featureName) {
        return (Boolean) features.getOrDefault(featureName, false);
    }

    public void setFeatureEnabled(String featureName, boolean enabled) {
        features.put(featureName, enabled);
        this.updatedAt = Instant.now();
    }

    // Convenience method for task user assignment (current feature)
    public boolean isTaskUserAssignmentEnabled() {
        return isFeatureEnabled("taskUserAssignmentEnabled");
    }

    public void setTaskUserAssignmentEnabled(boolean enabled) {
        setFeatureEnabled("taskUserAssignmentEnabled", enabled);
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getCourseLevel() { return courseLevel; }
    public void setCourseLevel(int courseLevel) { this.courseLevel = courseLevel; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Map<String, Boolean> getFeatures() { return features; }
    public void setFeatures(Map<String, Boolean> features) { this.features = features; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}