package bachelor.projectmanagement.graphql;

import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import bachelor.projectmanagement.model.Feature;
import bachelor.projectmanagement.model.Task;

@Controller
public class FieldResolver {

    @SchemaMapping
    public String id(Feature feature) {
        return feature.getFeatureId();
    }

    @SchemaMapping
    public String id(Task task) {
        return task.getTaskId();
    }

    @SchemaMapping
    public String status(Task task) {
        return task.getStatus() != null ? task.getStatus().toString() : "TODO";
    }
}