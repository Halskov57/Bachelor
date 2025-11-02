package bachelor.projectmanagement.model;

/**
 * Enum representing the possible statuses for a Task.
 */
public enum TaskStatus {
    TODO("Todo"),
    IN_PROGRESS("In progress"),
    DONE("Done"),
    BLOCKED("Blocked"),
    NEED_HELP("Need help");

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