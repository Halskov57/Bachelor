package bachelor.projectmanagement.model;

/**
 * Enum representing the possible statuses for a Feature.
 */
public enum FeatureStatus {
    NOT_STARTED("Not Started"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    BLOCKED("Blocked"),
    CANCELLED("Cancelled");

    private final String displayName;

    FeatureStatus(String displayName) {
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