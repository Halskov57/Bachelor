package bachelor.projectmanagement.model;

import org.springframework.data.annotation.Id;
import java.util.ArrayList;
import java.util.List;

public class Task {

    @Id
    private String taskId;
    private String title;
    private String description;
    private int depth;
    private TaskStatus status;
    private List<String> users = new ArrayList<>(); // usernames assigned

    public Task() {
        this.status = TaskStatus.TODO;
        this.users = new ArrayList<>();
    }

    public Task(String title, String description, int depth, List<String> users, TaskStatus status) {
        this.title = title;
        this.description = description;
        this.depth = depth;
        this.users = users != null ? users : new ArrayList<>();
        this.status = status;
    }

    // Getters and setters
    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public List<String> getUsers() { return users; }
    public void setUsers(List<String> users) { this.users = users != null ? users : new ArrayList<>(); }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public String getId() {
        return taskId;
    }
}

