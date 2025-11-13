package bachelor.projectmanagement.config;

import bachelor.projectmanagement.security.RateLimitInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for rate limiting.
 * Registers the RateLimitInterceptor to apply rate limits to all requests.
 */
@Configuration
public class RateLimitConfig implements WebMvcConfigurer {

    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/**") // Apply to all paths
                .excludePathPatterns("/actuator/**"); // Exclude health check endpoints if you have them
    }
}
