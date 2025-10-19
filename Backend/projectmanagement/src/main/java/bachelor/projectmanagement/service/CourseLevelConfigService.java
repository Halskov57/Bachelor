package bachelor.projectmanagement.service;

import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.repository.CourseLevelConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CourseLevelConfigService {

    @Autowired
    private CourseLevelConfigRepository configRepository;

    /**
     * Get configuration for a specific course level
     */
    public Optional<CourseLevelConfig> getConfig(int courseLevel) {
        return configRepository.findByCourseLevel(courseLevel);
    }

    /**
     * Get configuration for a specific course level, creating default if not exists
     */
    public CourseLevelConfig getConfigOrDefault(int courseLevel) {
        try {
            System.out.println("DEBUG: Looking for config with course level " + courseLevel);
            Optional<CourseLevelConfig> existing = configRepository.findByCourseLevel(courseLevel);
            if (existing.isPresent()) {
                System.out.println("DEBUG: Found existing config: " + existing.get());
                return existing.get();
            }
            
            System.out.println("DEBUG: No existing config found, creating default");
            // Create and save default config if it doesn't exist
            CourseLevelConfig defaultConfig = createDefaultConfig(courseLevel);
            System.out.println("DEBUG: Created default config: " + defaultConfig);
            
            CourseLevelConfig saved = configRepository.save(defaultConfig);
            System.out.println("DEBUG: Saved default config: " + saved);
            return saved;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get or create config for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Create or update configuration for a course level
     */
    public CourseLevelConfig saveConfig(CourseLevelConfig config) {
        return configRepository.save(config);
    }

    /**
     * Update a specific feature for a course level
     */
    public CourseLevelConfig updateFeature(int courseLevel, String featureKey, boolean enabled) {
        try {
            System.out.println("DEBUG: Getting config for course level " + courseLevel);
            CourseLevelConfig config = getConfigOrDefault(courseLevel);
            System.out.println("DEBUG: Got config: " + config);
            
            System.out.println("DEBUG: Setting feature " + featureKey + " to " + enabled);
            config.setFeature(featureKey, enabled);
            
            System.out.println("DEBUG: Saving config to database");
            CourseLevelConfig saved = configRepository.save(config);
            System.out.println("DEBUG: Successfully saved config: " + saved);
            
            return saved;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update feature " + featureKey + " for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Update task user assignment feature for a course level
     */
    public CourseLevelConfig updateTaskUserAssignment(int courseLevel, boolean enabled) {
        try {
            System.out.println("DEBUG: Updating task user assignment for course level " + courseLevel + " to " + enabled);
            CourseLevelConfig result = updateFeature(courseLevel, CourseLevelConfig.TASK_USER_ASSIGNMENT, enabled);
            System.out.println("DEBUG: Successfully updated configuration: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update task user assignment for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Check if task user assignment is enabled for a course level
     */
    public boolean isTaskUserAssignmentEnabled(int courseLevel) {
        return getConfigOrDefault(courseLevel).isTaskUserAssignmentEnabled();
    }

    /**
     * Get all configurations
     */
    public List<CourseLevelConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    /**
     * Delete configuration for a course level
     */
    public void deleteConfig(int courseLevel) {
        configRepository.findByCourseLevel(courseLevel)
                .ifPresent(config -> configRepository.delete(config));
    }

    /**
     * Create default configuration for a course level
     */
    private CourseLevelConfig createDefaultConfig(int courseLevel) {
        try {
            System.out.println("DEBUG: Creating default config for course level " + courseLevel);
            
            Map<String, Boolean> defaultFeatures = new HashMap<>();
            // By default, all features are enabled
            defaultFeatures.put(CourseLevelConfig.TASK_USER_ASSIGNMENT, true);
            
            CourseLevelConfig config = new CourseLevelConfig();
            config.setCourseLevel(courseLevel);
            config.setFeatures(defaultFeatures);
            
            // Ensure timestamps are set
            if (config.getCreatedAt() == null) {
                config.setCreatedAt(java.time.Instant.now());
            }
            if (config.getUpdatedAt() == null) {
                config.setUpdatedAt(java.time.Instant.now());
            }
            
            System.out.println("DEBUG: Created default config: " + config);
            return config;
        } catch (Exception e) {
            System.err.println("ERROR: Failed to create default config for course level " + courseLevel);
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}