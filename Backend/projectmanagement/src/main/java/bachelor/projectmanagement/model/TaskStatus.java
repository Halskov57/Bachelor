package bachelor.projectmanagement.model;

/**
 * Enum representing the possible statuses for a Task.
 */
public enum TaskStatus {
    TODO("To Do"),           // Add this line
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    BLOCKED("Blocked"),
    CANCELLED("Cancelled");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}