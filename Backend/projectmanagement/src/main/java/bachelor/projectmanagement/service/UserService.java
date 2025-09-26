package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User createUser(String username, String rawPassword) {
    if (userRepository.findByUsername(username).isPresent()) {
        throw new RuntimeException("Username already exists");
        }

        // Hash password using BCrypt
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User(username, hashedPassword);
        return userRepository.save(user);
    }

    public boolean verifyPassword(String username, String rawPassword) {
    return userRepository.findByUsername(username)
            .map(user -> passwordEncoder.matches(rawPassword, user.getHashedPassword()))
            .orElse(false);
}
}
