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
    private int depth;
    private int courseLevel;
    private Instant createdOn = Instant.now();

    @DBRef
    private User owner;

    @DBRef
    private List<Epic> epics = new ArrayList<>();

    public Project() {}

    public Project(String title, String description, int depth, int courseLevel, User owner) {
        this.title = title;
        this.description = description;
        this.depth = depth;
        this.courseLevel = courseLevel;
        this.owner = owner;
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

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public int getCourseLevel() { return courseLevel; }
    public void setCourseLevel(int courseLevel) { this.courseLevel = courseLevel; }

    public Instant getCreatedOn() { return createdOn; }
    public void setCreatedOn(Instant createdOn) { this.createdOn = createdOn; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public List<Epic> getEpics() { return epics; }
    public void setEpics(List<Epic> epics) { this.epics = epics != null ? epics : new ArrayList<>(); }
}
