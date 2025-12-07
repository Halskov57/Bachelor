package bachelor.projectmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.io.IOException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtUtil);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_ShouldSkipAuthenticationForPublicEndpoints() throws ServletException, IOException {
        // Given
        request.setRequestURI("/users/create");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_ShouldSkipAuthenticationForVerifyEndpoint() throws ServletException, IOException {
        // Given
        request.setRequestURI("/users/verify");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void doFilterInternal_ShouldSkipAuthenticationForHelloEndpoint() throws ServletException, IOException {
        // Given
        request.setRequestURI("/hello");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void doFilterInternal_ShouldAuthenticateWithValidToken() throws ServletException, IOException {
        // Given
        String token = "valid.jwt.token";
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Bearer " + token);

        Claims claims = Jwts.claims().setSubject("testuser");
        claims.put("role", "USER");
        
        when(jwtUtil.validateToken(token)).thenReturn(claims);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtil).validateToken(token);
        verify(filterChain).doFilter(request, response);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("testuser", auth.getName());
        assertTrue(auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void doFilterInternal_ShouldHandleAdminRole() throws ServletException, IOException {
        // Given
        String token = "admin.jwt.token";
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Bearer " + token);

        Claims claims = Jwts.claims().setSubject("adminuser");
        claims.put("role", "SUPER_ADMIN");
        
        when(jwtUtil.validateToken(token)).thenReturn(claims);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("adminuser", auth.getName());
        assertTrue(auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN")));
    }

    @Test
    void doFilterInternal_ShouldContinueWithoutAuthenticationWhenNoToken() throws ServletException, IOException {
        // Given
        request.setRequestURI("/graphql");
        // No Authorization header

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_ShouldContinueWithoutAuthenticationWhenInvalidToken() throws ServletException, IOException {
        // Given
        String invalidToken = "invalid.token";
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Bearer " + invalidToken);

        when(jwtUtil.validateToken(invalidToken)).thenThrow(new RuntimeException("Invalid token"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtil).validateToken(invalidToken);
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_ShouldIgnoreNonBearerAuthHeader() throws ServletException, IOException {
        // Given
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Basic sometoken");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_ShouldExtractTokenCorrectly() throws ServletException, IOException {
        // Given
        String token = "my.jwt.token";
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Bearer " + token);

        Claims claims = Jwts.claims().setSubject("user");
        claims.put("role", "USER");
        when(jwtUtil.validateToken(token)).thenReturn(claims);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(jwtUtil).validateToken(token); // Should extract without "Bearer " prefix
    }

    @Test
    void doFilterInternal_ShouldHandleExpiredToken() throws ServletException, IOException {
        // Given
        String expiredToken = "expired.token";
        request.setRequestURI("/graphql");
        request.addHeader("Authorization", "Bearer " + expiredToken);

        when(jwtUtil.validateToken(expiredToken))
                .thenThrow(new io.jsonwebtoken.ExpiredJwtException(null, null, "Token expired"));

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
