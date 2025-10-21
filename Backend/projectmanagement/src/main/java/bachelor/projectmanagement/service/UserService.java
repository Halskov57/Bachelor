package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.model.UserRole;
import bachelor.projectmanagement.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User(username, hashedPassword);
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    public User createAdminUser(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User(username, hashedPassword);
        user.setRole(UserRole.ADMIN);
        return userRepository.save(user);
    }

    public boolean verifyPassword(String username, String rawPassword) {
        return userRepository.findByUsername(username)
                .map(user -> passwordEncoder.matches(rawPassword, user.getHashedPassword()))
                .orElse(false);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User updatePassword(User user, String newPassword) {
        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setHashedPassword(hashedPassword);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createSuperAdminUser(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User(username, hashedPassword);
        user.setRole(UserRole.SUPERADMIN);
        return userRepository.save(user);
    }

    public User updateUserRole(String username, String newRole) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!UserRole.USER.equals(newRole) && !UserRole.ADMIN.equals(newRole) && !UserRole.SUPERADMIN.equals(newRole)) {
            throw new RuntimeException("Invalid role: " + newRole);
        }
        
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public boolean isSuperAdmin(String username) {
        return userRepository.findByUsername(username)
                .map(user -> UserRole.SUPERADMIN.equals(user.getRole()))
                .orElse(false);
    }

    public boolean isAdmin(String username) {
        return userRepository.findByUsername(username)
                .map(user -> UserRole.ADMIN.equals(user.getRole()) || UserRole.SUPERADMIN.equals(user.getRole()))
                .orElse(false);
    }

    public List<User> getAllNonSuperAdminUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !UserRole.SUPERADMIN.equals(user.getRole()))
                .toList();
    }
}
