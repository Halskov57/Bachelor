package bachelor.projectmanagement.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import bachelor.projectmanagement.model.*;

@Service
public class PubSubService {

    // --- Sinks: The Publishers ---
    // A Sinks.Many (multicast) is used to allow multiple subscribers to receive events.
    private final Sinks.Many<User> userSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Project> projectSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Epic> epicSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Feature> featureSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Task> taskSink = Sinks.many().multicast().onBackpressureBuffer();
    
    // Real-time collaboration sinks
    private final Sinks.Many<TaskAssignmentUpdate> taskAssignmentSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<TaskStatusUpdate> taskStatusSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<TaskDeletedEvent> taskDeletedSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<FeatureDeletedEvent> featureDeletedSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<EpicDeletedEvent> epicDeletedSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<StructureUpdate> structureUpdateSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<UserActivity> userActivitySink = Sinks.many().multicast().onBackpressureBuffer();

    // ------------------------------------------------
    // 1. Publisher Methods (Called from Mutation Resolvers)
    // ------------------------------------------------

    /**
     * Publishes a User object, triggered by creation or update mutations (e.g., updateUserUsername, updateUserRole).
     * @param user The User object that was created or updated.
     */
    public void publishUserChange(User user) {
        userSink.tryEmitNext(user);
    }

    /**
     * Publishes a Project object, triggered by creation or update mutations.
     * @param project The Project object that was created or updated.
     */
    public void publishProjectChange(Project project) {
        projectSink.tryEmitNext(project);
    }

    /**
     * Publishes an Epic object, triggered by creation or update mutations.
     * @param epic The Epic object that was created or updated.
     */
    public void publishEpicChange(Epic epic) {
        epicSink.tryEmitNext(epic);
    }

    /**
     * Publishes a Feature object, triggered by creation or update mutations.
     * @param feature The Feature object that was created or updated.
     */
    public void publishFeatureChange(Feature feature) {
        featureSink.tryEmitNext(feature);
    }

    /**
     * Publishes a Task object, triggered by creation or update mutations.
     * @param task The Task object that was created or updated.
     */
    public void publishTaskChange(Task task) {
        taskSink.tryEmitNext(task);
    }

    /**
     * Publishes a task assignment update event.
     * @param update The TaskAssignmentUpdate event.
     */
    public void publishTaskAssignmentUpdate(TaskAssignmentUpdate update) {
        taskAssignmentSink.tryEmitNext(update);
    }

    /**
     * Publishes a task status change event.
     * @param update The TaskStatusUpdate event.
     */
    public void publishTaskStatusUpdate(TaskStatusUpdate update) {
        taskStatusSink.tryEmitNext(update);
    }

    /**
     * Publishes a task deletion event.
     * @param event The TaskDeletedEvent.
     */
    public void publishTaskDeletedEvent(TaskDeletedEvent event) {
        taskDeletedSink.tryEmitNext(event);
    }

    /**
     * Publishes a feature deletion event.
     * @param event The FeatureDeletedEvent.
     */
    public void publishFeatureDeletedEvent(FeatureDeletedEvent event) {
        featureDeletedSink.tryEmitNext(event);
    }

    /**
     * Publishes an epic deletion event.
     * @param event The EpicDeletedEvent.
     */
    public void publishEpicDeletedEvent(EpicDeletedEvent event) {
        epicDeletedSink.tryEmitNext(event);
    }

    /**
     * Publishes a structure update event (creation/deletion of epics, features, tasks).
     * @param update The StructureUpdate event.
     */
    public void publishStructureUpdate(StructureUpdate update) {
        structureUpdateSink.tryEmitNext(update);
    }

    /**
     * Publishes a user activity event.
     * @param activity The UserActivity event.
     */
    public void publishUserActivity(UserActivity activity) {
        userActivitySink.tryEmitNext(activity);
    }


    // ------------------------------------------------
    // 2. Subscriber Methods (Called from Subscription Resolvers)
    // ------------------------------------------------

    /**
     * Returns a Flux stream for all User changes (used by userUpdated subscription).
     */
    public Flux<User> subscribeToUserChanges() {
        return userSink.asFlux();
    }

    /**
     * Returns a Flux stream for all Project changes (used by projectAdded and projectUpdated subscriptions).
     */
    public Flux<Project> subscribeToProjectChanges() {
        return projectSink.asFlux();
    }

    /**
     * Returns a Flux stream for all Epic changes (used by epicAdded and epicUpdated subscriptions).
     */
    public Flux<Epic> subscribeToEpicChanges() {
        return epicSink.asFlux();
    }

    /**
     * Returns a Flux stream for all Feature changes (used by featureAdded and featureUpdated subscriptions).
     */
    public Flux<Feature> subscribeToFeatureChanges() {
        return featureSink.asFlux();
    }

    /**
     * Returns a Flux stream for all Task changes (used by taskAdded and taskUpdated subscriptions).
     */
    public Flux<Task> subscribeToTaskChanges() {
        return taskSink.asFlux();
    }

    /**
     * Returns a Flux stream for task assignment updates.
     */
    public Flux<TaskAssignmentUpdate> subscribeToTaskAssignmentChanges() {
        return taskAssignmentSink.asFlux();
    }

    /**
     * Returns a Flux stream for task status changes.
     */
    public Flux<TaskStatusUpdate> subscribeToTaskStatusChanges() {
        return taskStatusSink.asFlux();
    }

    /**
     * Returns a Flux stream for task deletion events.
     */
    public Flux<TaskDeletedEvent> subscribeToTaskDeletedEvents() {
        return taskDeletedSink.asFlux();
    }

    /**
     * Returns a Flux stream for feature deletion events.
     */
    public Flux<FeatureDeletedEvent> subscribeToFeatureDeletedEvents() {
        return featureDeletedSink.asFlux();
    }

    /**
     * Returns a Flux stream for epic deletion events.
     */
    public Flux<EpicDeletedEvent> subscribeToEpicDeletedEvents() {
        return epicDeletedSink.asFlux();
    }

    /**
     * Returns a Flux stream for structure updates.
     */
    public Flux<StructureUpdate> subscribeToStructureUpdates() {
        return structureUpdateSink.asFlux();
    }

    /**
     * Returns a Flux stream for user activity updates.
     */
    public Flux<UserActivity> subscribeToUserActivityUpdates() {
        return userActivitySink.asFlux();
    }
}