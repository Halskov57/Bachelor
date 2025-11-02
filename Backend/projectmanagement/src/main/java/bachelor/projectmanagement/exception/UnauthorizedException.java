package bachelor.projectmanagement.exception;

/**
 * Custom exception for authorization errors
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
