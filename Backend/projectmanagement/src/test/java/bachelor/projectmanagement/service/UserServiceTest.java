package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.User;
import bachelor.projectmanagement.repository.UserRepository;
import bachelor.projectmanagement.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private final String TEST_PASSWORD = "testPassword123";
    private final String TEST_USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        testUser = TestDataBuilder.createTestUser(TEST_USERNAME);
        // Set a properly hashed password for testing
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        testUser.setHashedPassword(encoder.encode(TEST_PASSWORD));
    }

    @Test
    void createUser_ShouldCreateUserSuccessfully() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("generated-id");
            return user;
        });

        // When
        User result = userService.createUser(TEST_USERNAME, TEST_PASSWORD);

        // Then
        assertNotNull(result);
        assertEquals(TEST_USERNAME, result.getUsername());
        assertEquals("USER", result.getRole());
        assertNotNull(result.getHashedPassword());
        assertNotEquals(TEST_PASSWORD, result.getHashedPassword()); // Password should be hashed
        verify(userRepository).findByUsername(TEST_USERNAME);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_ShouldThrowExceptionWhenUsernameExists() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testUser));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            userService.createUser(TEST_USERNAME, TEST_PASSWORD));
        
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository).findByUsername(TEST_USERNAME);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyPassword_ShouldReturnTrueForCorrectPassword() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testUser));

        // When
        boolean result = userService.verifyPassword(TEST_USERNAME, TEST_PASSWORD);

        // Then
        assertTrue(result);
        verify(userRepository).findByUsername(TEST_USERNAME);
    }

    @Test
    void verifyPassword_ShouldReturnFalseForIncorrectPassword() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testUser));

        // When
        boolean result = userService.verifyPassword(TEST_USERNAME, "wrongPassword");

        // Then
        assertFalse(result);
        verify(userRepository).findByUsername(TEST_USERNAME);
    }

    @Test
    void verifyPassword_ShouldReturnFalseForNonexistentUser() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When
        boolean result = userService.verifyPassword("nonexistent", TEST_PASSWORD);

        // Then
        assertFalse(result);
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    void findByUsername_ShouldReturnUserWhenExists() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testUser));

        // When
        User result = userService.findByUsername(TEST_USERNAME);

        // Then
        assertNotNull(result);
        assertEquals(testUser, result);
        assertEquals(TEST_USERNAME, result.getUsername());
        verify(userRepository).findByUsername(TEST_USERNAME);
    }

    @Test
    void findByUsername_ShouldReturnNullWhenUserDoesNotExist() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When
        User result = userService.findByUsername("nonexistent");

        // Then
        assertNull(result);
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    void save_ShouldSaveUserSuccessfully() {
        // Given
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = userService.save(testUser);

        // Then
        assertNotNull(result);
        assertEquals(testUser, result);
        verify(userRepository).save(testUser);
    }

    @Test
    void updatePassword_ShouldUpdatePasswordSuccessfully() {
        // Given
        String newPassword = "newPassword456";
        String originalPassword = testUser.getHashedPassword();
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updatePassword(testUser, newPassword);

        // Then
        assertNotNull(result);
        assertNotEquals(originalPassword, result.getHashedPassword());
        assertNotEquals(newPassword, result.getHashedPassword()); // Should be hashed
        
        // Verify the new password works
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches(newPassword, result.getHashedPassword()));
        
        verify(userRepository).save(testUser);
    }

    @Test
    void passwordHashing_ShouldProduceDifferentHashesForSamePassword() {
        // Given
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User user1 = userService.createUser("user1", TEST_PASSWORD);
        User user2 = userService.createUser("user2", TEST_PASSWORD);

        // Then
        assertNotEquals(user1.getHashedPassword(), user2.getHashedPassword());
        
        // But both should verify correctly
        when(userRepository.findByUsername("user1")).thenReturn(Optional.of(user1));
        when(userRepository.findByUsername("user2")).thenReturn(Optional.of(user2));
        
        assertTrue(userService.verifyPassword("user1", TEST_PASSWORD));
        assertTrue(userService.verifyPassword("user2", TEST_PASSWORD));
    }

    @Test
    void createUser_ShouldAssignUserRoleByDefault() {
        // Given
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = userService.createUser(TEST_USERNAME, TEST_PASSWORD);

        // Then
        assertEquals("USER", result.getRole());
    }
}