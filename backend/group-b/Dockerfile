# ============================================
# Stage 1 — Build with Maven
# ============================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy source (pom + src)
COPY pom.xml .
COPY src ./src

# Build the JAR (skip tests for faster builds)
RUN mvn clean package -DskipTests

# ============================================
# Stage 2 — Runtime (small JRE image)
# ============================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8084

# Run
ENTRYPOINT ["java", "-Xmx384m", "-Xms128m", "-jar", "app.jar"]