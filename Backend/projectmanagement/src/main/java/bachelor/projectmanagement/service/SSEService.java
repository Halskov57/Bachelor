package bachelor.projectmanagement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SSEService {

    private static final Logger logger = LoggerFactory.getLogger(SSEService.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    // Map of project ID to list of emitters
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> projectEmitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create an SSE emitter for a project
     */
    public SseEmitter createEmitter(String projectId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        // Add to project emitters list
        projectEmitters.computeIfAbsent(projectId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // Handle completion and timeout
        emitter.onCompletion(() -> removeEmitter(projectId, emitter));
        emitter.onTimeout(() -> {
            logger.info("SSE connection timed out for project: {}", projectId);
            removeEmitter(projectId, emitter);
        });
        emitter.onError((ex) -> {
            logger.error("SSE error for project {}: {}", projectId, ex.getMessage());
            removeEmitter(projectId, emitter);
        });

        // Send initial connection event
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"message\":\"Connected to project " + projectId + " updates\"}"));
        } catch (IOException e) {
            logger.error("Failed to send initial SSE event for project {}: {}", projectId, e.getMessage());
            removeEmitter(projectId, emitter);
        }

        logger.info("Created SSE emitter for project: {}", projectId);
        return emitter;
    }

    /**
     * Send task update event to all clients subscribed to the project
     */
    public void sendTaskUpdate(String projectId, Object taskUpdate) {
        sendEventToProject(projectId, "taskUpdate", taskUpdate);
    }

    /**
     * Send epic update event to all clients subscribed to the project
     */
    public void sendEpicUpdate(String projectId, Object epicUpdate) {
        sendEventToProject(projectId, "epicUpdate", epicUpdate);
    }

    /**
     * Send feature update event to all clients subscribed to the project
     */
    public void sendFeatureUpdate(String projectId, Object featureUpdate) {
        sendEventToProject(projectId, "featureUpdate", featureUpdate);
    }

    /**
     * Send project update event to all clients subscribed to the project
     */
    public void sendProjectUpdate(String projectId, Object projectUpdate) {
        sendEventToProject(projectId, "projectUpdate", projectUpdate);
    }

    /**
     * Send task created event to all clients subscribed to the project
     */
    public void sendTaskCreated(String projectId, Object taskData) {
        sendEventToProject(projectId, "taskCreated", taskData);
    }

    /**
     * Send epic created event to all clients subscribed to the project
     */
    public void sendEpicCreated(String projectId, Object epicData) {
        sendEventToProject(projectId, "epicCreated", epicData);
    }

    /**
     * Send feature created event to all clients subscribed to the project
     */
    public void sendFeatureCreated(String projectId, Object featureData) {
        sendEventToProject(projectId, "featureCreated", featureData);
    }

    /**
     * Send task user assignment event to all clients subscribed to the project
     */
    public void sendTaskUserAssigned(String projectId, Object taskData) {
        sendEventToProject(projectId, "taskUserAssigned", taskData);
    }

    /**
     * Send event to all emitters for a specific project
     */
    private void sendEventToProject(String projectId, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = projectEmitters.get(projectId);
        if (emitters == null || emitters.isEmpty()) {
            logger.debug("No SSE clients connected for project: {}", projectId);
            return;
        }

        String jsonData;
        try {
            jsonData = objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            logger.error("Failed to serialize SSE event data: {}", e.getMessage());
            return;
        }

        // Send to all connected clients for this project
        emitters.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(jsonData));
                return false; // Keep emitter
            } catch (IOException e) {
                logger.warn("Failed to send SSE event to client, removing emitter: {}", e.getMessage());
                return true; // Remove emitter
            }
        });

        logger.info("Sent {} event to {} clients for project: {}", eventName, emitters.size(), projectId);
    }

    /**
     * Remove an emitter from the project's emitter list
     */
    private void removeEmitter(String projectId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = projectEmitters.get(projectId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                projectEmitters.remove(projectId);
                logger.info("Removed last SSE emitter for project: {}", projectId);
            }
        }
    }

    /**
     * Get the number of connected clients for a project
     */
    public int getConnectedClientsCount(String projectId) {
        CopyOnWriteArrayList<SseEmitter> emitters = projectEmitters.get(projectId);
        return emitters != null ? emitters.size() : 0;
    }
}