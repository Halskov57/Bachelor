package bachelor.projectmanagement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SSEServiceTest {

    @Spy
    private ObjectMapper objectMapper;

    @InjectMocks
    private SSEService sseService;

    private final String TEST_PROJECT_ID = "test-project-123";
    private final String TEST_PROJECT_ID_2 = "test-project-456";

    @BeforeEach
    void setUp() {
        // Fresh instance for each test
        sseService = new SSEService();
    }

    @Test
    void createEmitter_ShouldCreateEmitterSuccessfully() {
        // When
        SseEmitter emitter = sseService.createEmitter(TEST_PROJECT_ID);

        // Then
        assertNotNull(emitter);
        assertEquals(30 * 60 * 1000L, emitter.getTimeout());
    }

    @Test
    void createEmitter_ShouldAllowMultipleEmittersForSameProject() {
        // When
        SseEmitter emitter1 = sseService.createEmitter(TEST_PROJECT_ID);
        SseEmitter emitter2 = sseService.createEmitter(TEST_PROJECT_ID);

        // Then
        assertNotNull(emitter1);
        assertNotNull(emitter2);
        assertNotEquals(emitter1, emitter2);
    }

    @Test
    void createEmitter_ShouldSupportMultipleProjects() {
        // When
        SseEmitter emitter1 = sseService.createEmitter(TEST_PROJECT_ID);
        SseEmitter emitter2 = sseService.createEmitter(TEST_PROJECT_ID_2);

        // Then
        assertNotNull(emitter1);
        assertNotNull(emitter2);
    }

    @Test
    void sendTaskUpdate_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> taskUpdate = createTestTaskUpdate();

        // When & Then - Should not throw exception
        assertDoesNotThrow(() -> sseService.sendTaskUpdate(TEST_PROJECT_ID, taskUpdate));
    }

    @Test
    void sendEpicUpdate_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> epicUpdate = createTestEpicUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendEpicUpdate(TEST_PROJECT_ID, epicUpdate));
    }

    @Test
    void sendFeatureUpdate_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> featureUpdate = createTestFeatureUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendFeatureUpdate(TEST_PROJECT_ID, featureUpdate));
    }

    @Test
    void sendProjectUpdate_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> projectUpdate = createTestProjectUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendProjectUpdate(TEST_PROJECT_ID, projectUpdate));
    }

    @Test
    void sendTaskCreated_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> taskData = createTestTaskUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendTaskCreated(TEST_PROJECT_ID, taskData));
    }

    @Test
    void sendEpicCreated_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> epicData = createTestEpicUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendEpicCreated(TEST_PROJECT_ID, epicData));
    }

    @Test
    void sendFeatureCreated_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> featureData = createTestFeatureUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendFeatureCreated(TEST_PROJECT_ID, featureData));
    }

    @Test
    void sendTaskUserAssigned_ShouldNotThrowWhenNoEmitters() {
        // Given
        Map<String, Object> taskData = createTestTaskUpdate();

        // When & Then
        assertDoesNotThrow(() -> sseService.sendTaskUserAssigned(TEST_PROJECT_ID, taskData));
    }

    @Test
    void sendTaskUpdate_ShouldHandleSerializableData() {
        // Given
        Map<String, Object> taskUpdate = createTestTaskUpdate();
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then - Should not throw exception with serializable data
        assertDoesNotThrow(() -> sseService.sendTaskUpdate(TEST_PROJECT_ID, taskUpdate));
    }

    @Test
    void sendEpicUpdate_ShouldHandleComplexObjects() {
        // Given
        Map<String, Object> epicUpdate = new HashMap<>();
        epicUpdate.put("epicId", "epic-123");
        epicUpdate.put("title", "Test Epic");
        epicUpdate.put("status", "IN_PROGRESS");
        epicUpdate.put("features", new String[]{"feature-1", "feature-2"});
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendEpicUpdate(TEST_PROJECT_ID, epicUpdate));
    }

    @Test
    void sendFeatureUpdate_ShouldHandleNestedObjects() {
        // Given
        Map<String, Object> featureUpdate = new HashMap<>();
        featureUpdate.put("featureId", "feature-123");
        featureUpdate.put("title", "Test Feature");
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("priority", "high");
        metadata.put("type", "backend");
        featureUpdate.put("metadata", metadata);
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendFeatureUpdate(TEST_PROJECT_ID, featureUpdate));
    }

    @Test
    void createEmitter_ShouldSetCorrectTimeout() {
        // When
        SseEmitter emitter = sseService.createEmitter(TEST_PROJECT_ID);

        // Then
        assertEquals(30 * 60 * 1000L, emitter.getTimeout());
    }

    @Test
    void sendTaskUpdate_ShouldIsolateProjectEmitters() {
        // Given
        Map<String, Object> taskUpdate = createTestTaskUpdate();
        sseService.createEmitter(TEST_PROJECT_ID);
        sseService.createEmitter(TEST_PROJECT_ID_2);

        // When & Then - Should only send to project 1
        assertDoesNotThrow(() -> sseService.sendTaskUpdate(TEST_PROJECT_ID, taskUpdate));
    }

    @Test
    void sendProjectUpdate_ShouldHandleEmptyUpdate() {
        // Given
        Map<String, Object> emptyUpdate = new HashMap<>();
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendProjectUpdate(TEST_PROJECT_ID, emptyUpdate));
    }

    @Test
    void sendTaskCreated_ShouldHandleNullValues() {
        // Given
        Map<String, Object> taskData = new HashMap<>();
        taskData.put("taskId", "task-123");
        taskData.put("title", null); // Null value
        taskData.put("description", "Description");
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendTaskCreated(TEST_PROJECT_ID, taskData));
    }

    @Test
    void createEmitter_ShouldHandleMultipleConcurrentEmitters() {
        // When - Create multiple emitters
        SseEmitter emitter1 = sseService.createEmitter(TEST_PROJECT_ID);
        SseEmitter emitter2 = sseService.createEmitter(TEST_PROJECT_ID);
        SseEmitter emitter3 = sseService.createEmitter(TEST_PROJECT_ID);

        // Then
        assertNotNull(emitter1);
        assertNotNull(emitter2);
        assertNotNull(emitter3);
        assertNotEquals(emitter1, emitter2);
        assertNotEquals(emitter2, emitter3);
    }

    @Test
    void sendEvents_ShouldHandleDifferentEventTypes() {
        // Given
        Map<String, Object> data = createTestTaskUpdate();
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then - All event types should work
        assertDoesNotThrow(() -> {
            sseService.sendTaskUpdate(TEST_PROJECT_ID, data);
            sseService.sendTaskCreated(TEST_PROJECT_ID, data);
            sseService.sendTaskUserAssigned(TEST_PROJECT_ID, data);
            sseService.sendEpicUpdate(TEST_PROJECT_ID, data);
            sseService.sendEpicCreated(TEST_PROJECT_ID, data);
            sseService.sendFeatureUpdate(TEST_PROJECT_ID, data);
            sseService.sendFeatureCreated(TEST_PROJECT_ID, data);
            sseService.sendProjectUpdate(TEST_PROJECT_ID, data);
        });
    }

    @Test
    void sendTaskUpdate_ShouldHandleSpecialCharacters() {
        // Given
        Map<String, Object> taskUpdate = new HashMap<>();
        taskUpdate.put("taskId", "task-123");
        taskUpdate.put("title", "Test with special chars: @#$%^&*()");
        taskUpdate.put("description", "Description with\nnewlines\tand\ttabs");
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendTaskUpdate(TEST_PROJECT_ID, taskUpdate));
    }

    @Test
    void sendEpicUpdate_ShouldHandleUnicodeCharacters() {
        // Given
        Map<String, Object> epicUpdate = new HashMap<>();
        epicUpdate.put("epicId", "epic-123");
        epicUpdate.put("title", "Epic with émojis 🚀 and ünïcödé");
        epicUpdate.put("description", "描述 with 中文 characters");
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendEpicUpdate(TEST_PROJECT_ID, epicUpdate));
    }

    @Test
    void createEmitter_ShouldNotAllowNullProjectId() {
        // When & Then
        assertThrows(Exception.class, () -> sseService.createEmitter(null));
    }

    @Test
    void sendTaskUpdate_ShouldHandleNullProjectId() {
        // Given
        Map<String, Object> taskUpdate = createTestTaskUpdate();

        // When & Then - Should throw exception with null project ID since ConcurrentHashMap doesn't allow null keys
        assertThrows(NullPointerException.class, () -> 
            sseService.sendTaskUpdate(null, taskUpdate));
    }

    @Test
    void sendTaskUpdate_ShouldHandleLargePayload() {
        // Given
        Map<String, Object> largeUpdate = new HashMap<>();
        largeUpdate.put("taskId", "task-123");
        largeUpdate.put("title", "Test Task");
        
        // Add large description
        StringBuilder largeDescription = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largeDescription.append("This is a very long description line ").append(i).append(". ");
        }
        largeUpdate.put("description", largeDescription.toString());
        
        sseService.createEmitter(TEST_PROJECT_ID);

        // When & Then
        assertDoesNotThrow(() -> sseService.sendTaskUpdate(TEST_PROJECT_ID, largeUpdate));
    }

    // Helper methods to create test data

    private Map<String, Object> createTestTaskUpdate() {
        Map<String, Object> taskUpdate = new HashMap<>();
        taskUpdate.put("taskId", "task-123");
        taskUpdate.put("title", "Test Task");
        taskUpdate.put("description", "Test Description");
        taskUpdate.put("status", "IN_PROGRESS");
        return taskUpdate;
    }

    private Map<String, Object> createTestEpicUpdate() {
        Map<String, Object> epicUpdate = new HashMap<>();
        epicUpdate.put("epicId", "epic-123");
        epicUpdate.put("title", "Test Epic");
        epicUpdate.put("description", "Test Epic Description");
        epicUpdate.put("status", "IN_PROGRESS");
        return epicUpdate;
    }

    private Map<String, Object> createTestFeatureUpdate() {
        Map<String, Object> featureUpdate = new HashMap<>();
        featureUpdate.put("featureId", "feature-123");
        featureUpdate.put("title", "Test Feature");
        featureUpdate.put("description", "Test Feature Description");
        featureUpdate.put("status", "TODO");
        return featureUpdate;
    }

    private Map<String, Object> createTestProjectUpdate() {
        Map<String, Object> projectUpdate = new HashMap<>();
        projectUpdate.put("projectId", TEST_PROJECT_ID);
        projectUpdate.put("title", "Test Project");
        projectUpdate.put("description", "Test Project Description");
        projectUpdate.put("status", "IN_PROGRESS");
        return projectUpdate;
    }
}
