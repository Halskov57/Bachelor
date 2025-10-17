package bachelor.projectmanagement.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Added import for HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                
                // 1. CRITICAL FIX: Allow OPTIONS pre-flight requests globally
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                
                // Public endpoints (no authentication required)
                .requestMatchers("/users/create", "/users/verify").permitAll()
                .requestMatchers("/hello/**").permitAll()
                
                // 2. TEMPORARY FIX: Permit all authenticated endpoints to check if any of them are the issue
                // Remove these temporary lines once the 403 is gone.
                // .requestMatchers("/graphql").authenticated()
                // .requestMatchers("/users/**").authenticated()
                // .requestMatchers("/projects/**").authenticated()
                // .anyRequest().authenticated()
                .anyRequest().permitAll() // TEMPORARILY OPEN ALL PATHS
                
                // The rest of the authorization block remains the same, but the final .anyRequest().authenticated() 
                // is replaced by the temporary .permitAll() to rule out authorization logic.
                // Admin-only endpoints
                // .requestMatchers("/users/all").hasRole("ADMIN") 
                // This line will be removed if you use .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Uses the corrected specific origin
        configuration.setAllowedOrigins(Arrays.asList("https://frontend-production-ded6.up.railway.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}