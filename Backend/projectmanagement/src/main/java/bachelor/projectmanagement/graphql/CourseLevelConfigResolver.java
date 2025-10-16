package bachelor.projectmanagement.graphql;

import bachelor.projectmanagement.model.CourseLevelConfig;
import bachelor.projectmanagement.service.CourseLevelConfigService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class CourseLevelConfigResolver {

    private final CourseLevelConfigService configService;

    public CourseLevelConfigResolver(CourseLevelConfigService configService) {
        this.configService = configService;
    }

    // Query resolvers
    @QueryMapping
    public CourseLevelConfig courseLevelConfig(@Argument int courseLevel) {
        return configService.getConfigOrDefault(courseLevel);
    }

    @QueryMapping
    public List<CourseLevelConfig> allCourseLevelConfigs() {
        return configService.getAllConfigs();
    }

    // Mutation resolvers
    @MutationMapping
    public CourseLevelConfig updateCourseLevelConfig(@Argument int courseLevel, @Argument boolean taskUserAssignment) {
        return configService.updateTaskUserAssignment(courseLevel, taskUserAssignment);
    }

    // Field resolvers for CourseLevelConfig
    @SchemaMapping
    public List<FeatureConfig> features(CourseLevelConfig config) {
        List<FeatureConfig> featureConfigs = new ArrayList<>();
        Map<String, Boolean> features = config.getFeatures();
        
        if (features != null) {
            for (Map.Entry<String, Boolean> entry : features.entrySet()) {
                featureConfigs.add(new FeatureConfig(entry.getKey(), entry.getValue()));
            }
        }
        
        return featureConfigs;
    }

    // Helper class for GraphQL FeatureConfig type
    public static class FeatureConfig {
        private String key;
        private Boolean enabled;

        public FeatureConfig(String key, Boolean enabled) {
            this.key = key;
            this.enabled = enabled;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public Boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(Boolean enabled) {
            this.enabled = enabled;
        }
    }
}