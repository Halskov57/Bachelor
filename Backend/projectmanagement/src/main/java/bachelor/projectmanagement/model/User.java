package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id; // You can still use username as ID if desired
    private String username;

    @JsonIgnore
    private String hashedPassword;

    @DBRef
    @JsonIgnore
    private List<Project> projects = new ArrayList<>(); // Initialized
    private String role; // "USER", "ADMIN", or "SUPERADMIN"

    public User() {}

    public User(String username, String hashedPassword) {
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.projects = new ArrayList<>();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getHashedPassword() { return hashedPassword; }
    public void setHashedPassword(String hashedPassword) { this.hashedPassword = hashedPassword; }

    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { 
        this.projects = projects != null ? projects : new ArrayList<>();
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
