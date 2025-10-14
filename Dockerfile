# Runtime만 담당
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 타임존 설정 (Alpine 방식)
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    apk del tzdata

# NCP Source Build에서 빌드된 JAR 파일 복사
COPY build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]