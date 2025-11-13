package bachelor.projectmanagement.graphql;

import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import bachelor.projectmanagement.model.Feature;
import bachelor.projectmanagement.model.Task;
import bachelor.projectmanagement.model.Project;
import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class FieldResolver {

    private final UserRepository userRepository;

    public FieldResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @SchemaMapping
    public String id(Feature feature) {
        return feature.getFeatureId();
    }

    @SchemaMapping
    public String id(Task task) {
        return task.getTaskId();
    }

    @SchemaMapping
    public String status(Task task) {
        return task.getStatus() != null ? task.getStatus().name() : "TODO";
    }

    @SchemaMapping
    public List<User> owners(Project project) {
        return project.getOwners();
    }

    @SchemaMapping
    public User owner(Project project) {
        // Return the first owner for backward compatibility
        return project.getOwner();
    }

    @SchemaMapping
    public List<User> users(Task task) {
        // Convert user IDs to User objects
        return task.getUsers().stream()
            .map(userId -> userRepository.findById(userId).orElse(null))
            .filter(user -> user != null)
            .collect(Collectors.toList());
    }
}