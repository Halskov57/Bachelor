package bachelor.projectmanagement.exception;

/**
 * Custom exception for user not found errors
 */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
