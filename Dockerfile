FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

COPY . .

RUN chmod +x gradlew && ./gradlew clean build -x test -Dspring.profiles.active=build

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*SNAPSHOT.jar app.jar

ENV TZ=Asia/Seoul

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]