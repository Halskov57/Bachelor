package bachelor.projectmanagement.graphql.input;

public class CreateEpicInput {
    private String title;
    private String description;

    public CreateEpicInput() {}

    // Getters and setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
