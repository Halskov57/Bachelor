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
        return configRepository.findByCourseLevel(courseLevel)
                .orElse(createDefaultConfig(courseLevel));
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
        CourseLevelConfig config = getConfigOrDefault(courseLevel);
        config.setFeature(featureKey, enabled);
        return configRepository.save(config);
    }

    /**
     * Update task user assignment feature for a course level
     */
    public CourseLevelConfig updateTaskUserAssignment(int courseLevel, boolean enabled) {
        return updateFeature(courseLevel, CourseLevelConfig.TASK_USER_ASSIGNMENT, enabled);
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
        Map<String, Boolean> defaultFeatures = new HashMap<>();
        // By default, all features are enabled
        defaultFeatures.put(CourseLevelConfig.TASK_USER_ASSIGNMENT, true);
        
        CourseLevelConfig config = new CourseLevelConfig();
        config.setCourseLevel(courseLevel);
        config.setFeatures(defaultFeatures);
        return config;
    }
}