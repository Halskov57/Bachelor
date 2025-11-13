package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "course_configs")
public class CourseLevelConfig {
    
    // Feature constants for type safety and extensibility
    public static final String TASK_USER_ASSIGNMENT = "TASK_USER_ASSIGNMENT";
    public static final String EPIC_CREATE_DELETE = "EPIC_CREATE_DELETE";
    public static final String FEATURE_CREATE_DELETE = "FEATURE_CREATE_DELETE";
    public static final String TASK_CREATE_DELETE = "TASK_CREATE_DELETE";
    public static final String TASK_DUE_DATE = "TASK_DUE_DATE";
    
    @Id
    private String id;

    // Ensure we create a unique index on courseLevel to avoid duplicates in future
    @Indexed(unique = true)
    private int courseLevel;
    
    // Extensible feature configuration
    private Map<String, Boolean> features = new HashMap<>();
    
    // Template project for this course level
    @DBRef
    private Project templateProject;
    
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
        features.put(EPIC_CREATE_DELETE, true);
        features.put(FEATURE_CREATE_DELETE, true);
        features.put(TASK_CREATE_DELETE, true);
        features.put(TASK_DUE_DATE, true);
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

    // Convenience methods for create/delete permissions
    public boolean isEpicCreateDeleteEnabled() {
        return isFeatureEnabled(EPIC_CREATE_DELETE);
    }

    public void setEpicCreateDeleteEnabled(boolean enabled) {
        setFeature(EPIC_CREATE_DELETE, enabled);
    }

    public boolean isFeatureCreateDeleteEnabled() {
        return isFeatureEnabled(FEATURE_CREATE_DELETE);
    }

    public void setFeatureCreateDeleteEnabled(boolean enabled) {
        setFeature(FEATURE_CREATE_DELETE, enabled);
    }

    public boolean isTaskCreateDeleteEnabled() {
        return isFeatureEnabled(TASK_CREATE_DELETE);
    }

    public void setTaskCreateDeleteEnabled(boolean enabled) {
        setFeature(TASK_CREATE_DELETE, enabled);
    }

    public boolean isTaskDueDateEnabled() {
        return isFeatureEnabled(TASK_DUE_DATE);
    }

    public void setTaskDueDateEnabled(boolean enabled) {
        setFeature(TASK_DUE_DATE, enabled);
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

    public Project getTemplateProject() {
        return templateProject;
    }

    public void setTemplateProject(Project templateProject) {
        this.templateProject = templateProject;
        this.updatedAt = Instant.now();
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