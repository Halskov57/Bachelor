package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;


import java.util.ArrayList;
import java.util.List;

public class Epic {

    @Id
    private String epicId;
    private String title;
    private String description;
    private int depth;

    @DBRef
    private User owner;

    private List<Feature> features = new ArrayList<>();

    public Epic() {}

    public Epic(String title, String description, int depth, User owner) {
        this.title = title;
        this.description = description;
        this.depth = depth;
        this.owner = owner;
        this.features = new ArrayList<>();
    }

    // Getters and setters
    public String getEpicId() { return epicId; }
    public void setEpicId(String epicId) { this.epicId = epicId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public List<Feature> getFeatures() { return features; }
    public void setFeatures(List<Feature> features) { this.features = features != null ? features : new ArrayList<>(); }
}
