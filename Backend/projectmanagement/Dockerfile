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
# RECOMMENDED FIX: Use the MONGO_URL variable directly as a system property.
# This relies on the MONGO_URL variable being injected by Railway.
ENTRYPOINT ["java", "-Dspring.data.mongodb.uri=${MONGO_URL}", "-jar", "app.jar"]