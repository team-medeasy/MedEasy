FROM openjdk:21

WORKDIR /app

COPY . .

RUN ls -al

RUN ls -al /build/libs

COPY build/libs/medeasy-*SNAPSHOT.jar app.jar

ENV TZ=Asia/Seoul

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]