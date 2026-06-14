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

# FIX: Using wildcard target/*.jar so it never fails on naming conventions
COPY --from=builder /app/target/*.jar app.jar

# Add a non-root user for security
RUN addgroup -S spreetail && adduser -S spreetail -G spreetail
USER spreetail:spreetail

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]