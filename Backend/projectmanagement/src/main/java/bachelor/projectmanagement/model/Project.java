package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
public class Project {

    @Id
    private String projectId;
    private String title;
    private String description;
    private int courseLevel;
    private ProjectStatus status;
    private Instant createdOn = Instant.now();

    @DBRef
    private List<User> owners = new ArrayList<>();

    private List<Epic> epics = new ArrayList<>();

    public Project() {}

    public Project(String title, String description, int courseLevel, User owner) {
        this.title = title;
        this.description = description;
        this.courseLevel = courseLevel;
        this.status = ProjectStatus.TODO;
        this.owners = new ArrayList<>();
        this.owners.add(owner);  // Add the initial owner to the list
        this.epics = new ArrayList<>();
        this.createdOn = Instant.now();
    }

    // Getters and setters
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCourseLevel() { return courseLevel; }
    public void setCourseLevel(int courseLevel) { this.courseLevel = courseLevel; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    public List<User> getOwners() { return owners; }
    public void setOwners(List<User> owners) { this.owners = owners != null ? owners : new ArrayList<>(); }
    
    // Convenience method to get the first owner (for backward compatibility)
    public User getOwner() { return owners != null && !owners.isEmpty() ? owners.get(0) : null; }
    
    // Convenience method to set a single owner (for backward compatibility)
    public void setOwner(User owner) { 
        if (owner != null) {
            this.owners = new ArrayList<>();
            this.owners.add(owner);
        }
    }
    
    // Method to add an owner
    public void addOwner(User owner) {
        if (owner != null && !owners.contains(owner)) {
            owners.add(owner);
        }
    }
    
    public void removeOwner(User owner) {
        if (owner != null) {
            owners.remove(owner);
        }
    }

    public List<Epic> getEpics() { return epics; }
    public void setEpics(List<Epic> epics) { this.epics = epics != null ? epics : new ArrayList<>(); }
    
    // Convenience method to get the project ID
    public String getId() {
        return getProjectId();
    }
}
