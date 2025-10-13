# ======== 1단계: Build Stage ========
FROM gradle:8.5-jdk21 AS builder

RUN echo "🔍 Before Checking JAVA_HOME: $JAVA_HOME" && ls -al $JAVA_HOME || echo "not found" && which java || echo "java missing"

RUN unset JAVA_HOME && \
    export JAVA_HOME=/opt/java/openjdk && \
    export PATH=$JAVA_HOME/bin:$PATH && \
    export LD_LIBRARY_PATH=$JAVA_HOME/lib:$JAVA_HOME/lib/server:$LD_LIBRARY_PATH && \
    echo "JAVA_HOME=$JAVA_HOME" && \
    java -version && javac -version && \
    gradle clean build -x test --no-daemon

RUN echo "🔍 After Checking JAVA_HOME: $JAVA_HOME" && ls -al $JAVA_HOME || echo "not found" && which java || echo "java missing"

WORKDIR /app

COPY . .

# 캐시를 활용한 build 속도 최적화
RUN gradle clean build -x test

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
