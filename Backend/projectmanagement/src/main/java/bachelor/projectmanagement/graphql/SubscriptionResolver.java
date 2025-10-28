package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.*;
import bachelor.projectmanagement.service.PubSubService; 
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

/**
 * GraphQL Subscription Resolver.
 * Connects the Subscription fields in the GraphQL schema to the Flux streams provided by the PubSubService.
 * This class handles filtering based on subscription arguments (e.g., filtering updates by ID or parent Project ID).
 */
@Controller
public class SubscriptionResolver {

    private final PubSubService pubSubService;

    // Inject the PubSubService to access the event streams
    public SubscriptionResolver(PubSubService pubSubService) {
        this.pubSubService = pubSubService;
    }

    // --- Creation Subscriptions (*Added) ---
    // These generally broadcast all new items without client-side filtering.

    @SubscriptionMapping
    public Flux<Project> projectAdded() {
        return pubSubService.subscribeToProjectChanges();
    }

    @SubscriptionMapping
    public Flux<Epic> epicAdded() {
        return pubSubService.subscribeToEpicChanges();
    }

    @SubscriptionMapping
    public Flux<Feature> featureAdded() {
        return pubSubService.subscribeToFeatureChanges();
    }

    @SubscriptionMapping
    public Flux<Task> taskAdded() {
        return pubSubService.subscribeToTaskChanges();
    }

    // --- Update/Filter Subscriptions (*Updated) ---
    // These are often filtered by ID (for single item updates) or by parent context (like projectId).

    @SubscriptionMapping
    public Flux<User> userUpdated(@Argument String id) {
        Flux<User> updates = pubSubService.subscribeToUserChanges();

        // If an 'id' is provided in the subscription query, filter the stream.
        if (id != null) {
            updates = updates.filter(user -> id.equals(user.getId()));
        }
        return updates;
    }

    @SubscriptionMapping
    public Flux<Project> projectUpdated(@Argument String id) {
        Flux<Project> updates = pubSubService.subscribeToProjectChanges();

        // Filter: only push the update if the project ID matches the argument ID.
        if (id != null) {
            updates = updates.filter(project -> id.equals(project.getId()));
        }
        return updates;
    }

    @SubscriptionMapping
    public Flux<Epic> epicUpdated(@Argument String id, @Argument String projectId) {
        Flux<Epic> updates = pubSubService.subscribeToEpicChanges();

        // Filter by specific Epic ID
        if (id != null) {
            updates = updates.filter(epic -> id.equals(epic.getId()));
        } 
        // OR filter by parent Project ID
        else if (projectId != null) {
            // For now, return all epic updates if projectId is specified
            // You may need to enhance this based on your Project-Epic relationship
            // No additional filtering needed for now
        }
        return updates;
    }

    @SubscriptionMapping
    public Flux<Feature> featureUpdated(@Argument String id, @Argument String projectId) {
        Flux<Feature> updates = pubSubService.subscribeToFeatureChanges();
        
        // Filter by specific Feature ID
        if (id != null) {
            updates = updates.filter(feature -> id.equals(feature.getFeatureId()));
        } 
        // OR filter by parent Project ID
        else if (projectId != null) {
            // Features don't have direct projectId, so return all feature updates
            // You may need to enhance this based on your Epic-Feature relationship
        }
        return updates;
    }

    @SubscriptionMapping
    public Flux<Task> taskUpdated(@Argument String projectId) {
        Flux<Task> updates = pubSubService.subscribeToTaskChanges();
        
        // Filter by parent Project ID for real-time collaboration
        if (projectId != null) {
            updates = updates.filter(task -> projectId.equals(task.getProjectId()));
        }
        return updates;
    }

    @SubscriptionMapping
    public Flux<TaskAssignmentUpdate> taskAssignmentUpdated(@Argument String projectId) {
        return pubSubService.subscribeToTaskAssignmentChanges()
                .filter(update -> projectId == null || projectId.equals(update.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<TaskStatusUpdate> taskStatusChanged(@Argument String projectId) {
        return pubSubService.subscribeToTaskStatusChanges()
                .filter(update -> projectId == null || projectId.equals(update.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<TaskDeletedEvent> taskDeleted(@Argument String projectId) {
        return pubSubService.subscribeToTaskDeletedEvents()
                .filter(event -> projectId == null || projectId.equals(event.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<FeatureDeletedEvent> featureDeleted(@Argument String projectId) {
        return pubSubService.subscribeToFeatureDeletedEvents()
                .filter(event -> projectId == null || projectId.equals(event.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<EpicDeletedEvent> epicDeleted(@Argument String projectId) {
        return pubSubService.subscribeToEpicDeletedEvents()
                .filter(event -> projectId == null || projectId.equals(event.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<StructureUpdate> projectStructureUpdated(@Argument String projectId) {
        return pubSubService.subscribeToStructureUpdates()
                .filter(update -> projectId == null || projectId.equals(update.getProjectId()));
    }

    @SubscriptionMapping
    public Flux<UserActivity> userActivityUpdated(@Argument String projectId) {
        return pubSubService.subscribeToUserActivityUpdates()
                .filter(activity -> projectId == null || projectId.equals(activity.getProjectId()));
    }
}
