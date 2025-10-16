# Use an official OpenJDK runtime as a parent image
FROM openjdk:21-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built jar file (adjust the jar name as needed)
COPY target/projectmanagement-0.0.1-SNAPSHOT.jar app.jar

# Set the Spring profile to 'docker'
ENV SPRING_PROFILES_ACTIVE=docker

# Expose the port your app runs on
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]