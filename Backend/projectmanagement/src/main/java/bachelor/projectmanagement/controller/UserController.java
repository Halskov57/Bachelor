package bachelor.projectmanagement.controller;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = userService.createUser(username, password);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        boolean valid = userService.verifyPassword(username, password);
        return ResponseEntity.ok(valid);
    }
}
