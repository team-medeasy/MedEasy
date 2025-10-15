FROM openjdk:21 as runtime

WORKDIR /app

# 한국 시간대 설정
ENV TZ=Asia/Seoul

RUN ls -al
RUN pwd

RUN ls -al /app/
RUN ls -al /build/

# 빌드 결과 JAR 복사
COPY build/libs/*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]