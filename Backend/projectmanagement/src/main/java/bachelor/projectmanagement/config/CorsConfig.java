package bachelor.projectmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc // This is often not strictly necessary if you extend WebMvcConfigurer, but good to include
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // This line registers a CORS policy that applies to all API paths (/**)
        registry.addMapping("/**")
            .allowedOrigins("https://frontend-production-ded6.up.railway.app/") // <-- CRITICAL: REPLACE THIS!
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow common HTTP methods
            .allowedHeaders("*") // Allow all headers
            .allowCredentials(true) // Allow cookies and authentication headers
            .maxAge(3600); // Cache preflight response for 1 hour
    }
}