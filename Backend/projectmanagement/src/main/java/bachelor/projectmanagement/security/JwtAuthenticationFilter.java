package bachelor.projectmanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip JWT processing for public endpoints and SSE endpoints
        String path = request.getRequestURI();
        if (path.equals("/users/create") || path.equals("/users/verify") || path.startsWith("/hello") || path.startsWith("/sse/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                Claims claims = jwtUtil.validateToken(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, 
                    null, 
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
            } catch (Exception e) {
                logger.warn("Invalid JWT token: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}