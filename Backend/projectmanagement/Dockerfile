# Stage 1: Build the app
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080

# TEMPORARY DIAGNOSTIC ENTRYPOINT:
# This will print the value of the environment variable (or an empty line if unset)
# before running the application.
ENTRYPOINT ["/bin/bash", "-c", "echo '--- DEBUG MONGO URI START ---' && echo SPRING_DATA_MONGODB_URI: $SPRING_DATA_MONGODB_URI && echo '--- DEBUG MONGO URI END ---' && java -jar app.jar"]