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
# FIX: Inject both the MONGO_URL and the required database name (projectmanagement)
ENTRYPOINT ["java", "-Dspring.data.mongodb.uri=${MONGO_URL}", "-Dspring.data.mongodb.database=projectmanagement", "-jar", "app.jar"]