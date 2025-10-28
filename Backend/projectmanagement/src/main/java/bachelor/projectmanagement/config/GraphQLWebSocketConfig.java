package bachelor.projectmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

/**
 * GraphQL WebSocket Configuration.
 * Minimal configuration to ensure WebSocket support is enabled.
 * Spring Boot GraphQL will handle the protocol automatically.
 */
@Configuration
@EnableWebSocket
public class GraphQLWebSocketConfig {
    
    // Spring Boot 3.x GraphQL starter handles WebSocket configuration automatically
    // This class just ensures @EnableWebSocket is present for WebSocket support
}