package bachelor.projectmanagement.controller;
import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.service.UserService;
import bachelor.projectmanagement.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = userService.createUser(username, password);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        boolean validUser = userService.verifyPassword(username, password);
        if (validUser) {
            User user = userService.findByUsername(username); // <-- get the user object
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(Map.of("token", token));
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }
}
