FROM openjdk:21

WORKDIR /app

COPY . .

COPY build/libs/medeasy-*SNAPSHOT.jar app.jar

ENV TZ=Asia/Seoul

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
