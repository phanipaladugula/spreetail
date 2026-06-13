# Multi-stage build for Spring Boot backend
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the jar from builder
COPY --from=builder /app/target/expense-sharing-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Add a non-root user for security
RUN addgroup -S spreetail && adduser -S spreetail -G spreetail
USER spreetail:spreetail

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]