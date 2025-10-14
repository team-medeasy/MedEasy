# ======== 1단계: Build Stage ========
FROM gradle:8.5-jdk21 AS builder

WORKDIR /app

COPY . .

# gradlew 실행 권한 부여 (중요)
RUN chmod +x gradlew

# JAVA_HOME은 올바르지만 PATH가 무시될 수 있으므로 직접 export
RUN export JAVA_HOME=/opt/java/openjdk && \
    export PATH=$JAVA_HOME/bin:$PATH && \
    echo "JAVA_HOME=$JAVA_HOME" && \
    java --version && \
    ./gradlew --no-daemon clean build -x test

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
