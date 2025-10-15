FROM openjdk:21

WORKDIR /app

# 한국 시간대 설정
ENV TZ=Asia/Seoul

COPY . .

RUN yum install -y findutils

RUN chmod +x gradlew && ./gradlew clean build -x test -Dspring.profiles.active=build

RUN cp /app/build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]