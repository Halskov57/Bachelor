package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.service.PubSubService;
import bachelor.projectmanagement.service.UserService;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;


@Controller
public class UserResolver {

    private final UserService userService;
    private final PubSubService pubSubService; // Declare PubSubService

    public UserResolver(UserService userService, PubSubService pubSubService) { // Inject PubSubService
        this.userService = userService;
        this.pubSubService = pubSubService;
    }

    @QueryMapping
    public User userByUsername(String username) {
        return userService.findByUsername(username);
    }

    @MutationMapping
    public User updateUsername(@Argument String oldUsername, @Argument String newUsername) {
        User user = userService.findByUsername(oldUsername);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setUsername(newUsername);
        User updatedUser = userService.save(user); 
        
        pubSubService.publishUserChange(updatedUser); // PUBLISH
        return updatedUser;
    }

    @MutationMapping
    public User updatePassword(@Argument String username, @Argument String newPassword) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        // Assuming updatePassword handles saving the user object
        userService.updatePassword(user, newPassword); 
        
        pubSubService.publishUserChange(user); // PUBLISH
        return user;
    }
    
    @QueryMapping
    public List<User> nonSuperAdminUsers() {
        return userService.getAllNonSuperAdminUsers();
    }

    @MutationMapping
    public User updateUserRole(@Argument String username, @Argument String newRole) {
        User updatedUser = userService.updateUserRole(username, newRole);
        
        pubSubService.publishUserChange(updatedUser); // PUBLISH
        return updatedUser;
    }

}
