package bachelor.projectmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "mysecretkeymysecretkeymysecretkeymysecretkey"; // Must be long enough

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        // Given
        String username = "testuser";
        String role = "USER";

        // When
        String token = jwtUtil.generateToken(username, role);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts separated by dots
    }

    @Test
    void validateToken_ShouldReturnClaimsForValidToken() {
        // Given
        String username = "testuser";
        String role = "ADMIN";
        String token = jwtUtil.generateToken(username, role);

        // When
        Claims claims = jwtUtil.validateToken(token);

        // Then
        assertNotNull(claims);
        assertEquals(username, claims.getSubject());
        assertEquals(role, claims.get("role", String.class));
        assertNotNull(claims.getIssuedAt());
        assertNotNull(claims.getExpiration());
    }

    @Test
    void validateToken_ShouldThrowExceptionForInvalidToken() {
        // Given
        String invalidToken = "invalid.jwt.token";

        // When & Then
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(invalidToken);
        });
    }

    @Test
    void validateToken_ShouldThrowExceptionForTokenWithWrongSignature() {
        // Given
        JwtUtil differentSecretUtil = new JwtUtil("differentsecretkeydifferentsecretkeydifferent");
        String token = differentSecretUtil.generateToken("testuser", "USER");

        // When & Then
        assertThrows(SignatureException.class, () -> {
            jwtUtil.validateToken(token);
        });
    }

    @Test
    void generateToken_ShouldCreateTokenWithExpirationTime() {
        // Given
        String username = "testuser";
        String role = "USER";

        // When
        String token = jwtUtil.generateToken(username, role);
        Claims claims = jwtUtil.validateToken(token);

        // Then
        assertNotNull(claims.getExpiration());
        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
        
        // Should expire approximately 1 day (86400000 ms) after issued
        long expirationDiff = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();
        assertTrue(expirationDiff >= 86400000 - 1000 && expirationDiff <= 86400000 + 1000);
    }

    @Test
    void generateToken_ShouldCreateDifferentTokensForDifferentUsers() {
        // Given
        String user1 = "user1";
        String user2 = "user2";
        String role = "USER";

        // When
        String token1 = jwtUtil.generateToken(user1, role);
        String token2 = jwtUtil.generateToken(user2, role);

        // Then
        assertNotEquals(token1, token2);
    }

    @Test
    void generateToken_ShouldIncludeRoleInClaims() {
        // Given
        String username = "testuser";
        String superAdminRole = "SUPER_ADMIN";
        String userRole = "USER";

        // When
        String adminToken = jwtUtil.generateToken(username, superAdminRole);
        String userToken = jwtUtil.generateToken(username, userRole);
        
        Claims adminClaims = jwtUtil.validateToken(adminToken);
        Claims userClaims = jwtUtil.validateToken(userToken);

        // Then
        assertEquals(superAdminRole, adminClaims.get("role", String.class));
        assertEquals(userRole, userClaims.get("role", String.class));
    }

    @Test
    void validateToken_ShouldHandleNullToken() {
        // When & Then
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(null);
        });
    }

    @Test
    void validateToken_ShouldHandleEmptyToken() {
        // When & Then
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken("");
        });
    }

    @Test
    void validateToken_ShouldHandleMalformedToken() {
        // Given
        String malformedToken = "not.a.valid.jwt.token.structure";

        // When & Then
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(malformedToken);
        });
    }
}
