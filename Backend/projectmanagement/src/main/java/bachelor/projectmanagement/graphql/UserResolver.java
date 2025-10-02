package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.service.UserService;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;


@Controller
public class UserResolver {

    private final UserService userService;

    public UserResolver(UserService userService) {
        this.userService = userService;
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
        return userService.save(user); 
    }

    @MutationMapping
    public User updatePassword(@Argument String username, @Argument String newPassword) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        userService.updatePassword(user, newPassword); 
        return user;
    }
}
