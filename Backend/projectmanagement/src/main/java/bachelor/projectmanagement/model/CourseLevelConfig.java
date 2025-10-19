package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "course_configs")
public class CourseLevelConfig {
    
    // Feature constants for type safety and extensibility
    public static final String TASK_USER_ASSIGNMENT = "TASK_USER_ASSIGNMENT";
    
    @Id
    private String id;
    private int courseLevel;
    
    // Extensible feature configuration
    private Map<String, Boolean> features = new HashMap<>();
    
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public CourseLevelConfig() {}

    public CourseLevelConfig(int courseLevel) {
        this.courseLevel = courseLevel;
        initializeDefaultFeatures();
    }

    private void initializeDefaultFeatures() {
        // By default, all features are enabled
        features.put(TASK_USER_ASSIGNMENT, true);
    }

    // Generic feature access methods (ready for future features)
    public boolean isFeatureEnabled(String featureName) {
        return features.getOrDefault(featureName, false);
    }

    public void setFeature(String featureName, boolean enabled) {
        features.put(featureName, enabled);
        this.updatedAt = Instant.now();
    }

    // Convenience method for task user assignment (current feature)
    public boolean isTaskUserAssignmentEnabled() {
        return isFeatureEnabled(TASK_USER_ASSIGNMENT);
    }

    public void setTaskUserAssignmentEnabled(boolean enabled) {
        setFeature(TASK_USER_ASSIGNMENT, enabled);
    }

    // Getters and setters
    public String getId() { 
        return id; 
    }
    
    public void setId(String id) { 
        this.id = id; 
    }

    public int getCourseLevel() { 
        return courseLevel; 
    }
    
    public void setCourseLevel(int courseLevel) { 
        this.courseLevel = courseLevel; 
    }

    public Map<String, Boolean> getFeatures() { 
        return features; 
    }
    
    public void setFeatures(Map<String, Boolean> features) { 
        this.features = features; 
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(Instant createdAt) { 
        this.createdAt = createdAt; 
    }

    public Instant getUpdatedAt() { 
        return updatedAt; 
    }
    
    public void setUpdatedAt(Instant updatedAt) { 
        this.updatedAt = updatedAt; 
    }

    @Override
    public String toString() {
        return "CourseLevelConfig{" +
                "id='" + id + '\'' +
                ", courseLevel=" + courseLevel +
                ", features=" + features +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}