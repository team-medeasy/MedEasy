# ======== 1단계: Build Stage ========
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

COPY . .

# 디버그용: 자바 경로 확인
RUN java --version || echo "java not found"
RUN which java || echo "which java failed"
RUN ls -R /usr/lib/jvm || echo "no jvm dir"
RUN ls -R /opt/java || echo "no /opt/java dir"

# 메모리 제한 방지를 위해 Gradle 데몬 비활성화
RUN ./gradlew --no-daemon clean build -x test

# ======== 2단계: Run Stage ========
FROM eclipse-temurin:21-jre as runtime

WORKDIR /app

# 한국 시간대 설정
ENV TZ=Asia/Seoul
RUN apt-get update && apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 빌드 결과 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
