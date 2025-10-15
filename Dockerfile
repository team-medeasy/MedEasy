FROM openjdk:21 as runtime

WORKDIR /app

# 한국 시간대 설정
ENV TZ=Asia/Seoul

# 빌드 결과 JAR 복사
COPY build/libs/medeasy-*SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

