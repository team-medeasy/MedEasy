#!/bin/sh

# Xcode Cloud가 저장소를 클론한 후 실행되는 스크립트
# Node.js, CocoaPods 의존성 설치 및 .env.dev / GoogleService-Info.plist 복원 로직 포함

set -e

echo "🔧 Starting ci_post_clone.sh"
echo "📍 Current directory: $(pwd)"

# 프로젝트 루트로 이동 (스크립트가 ios/ci_scripts에서 실행되므로 두 단계 위로)
cd ../..
echo "📍 Moved to project root: $(pwd)"

# ======================================================
# 1️⃣ .env.dev 복원 (Base64 방식)
# ======================================================
if [ -n "$ENV_DEV_FILE" ]; then
    echo "🧩 Decoding .env.dev from Base64..."
    echo "$ENV_DEV_FILE" | base64 --decode > .env.dev
    # 혹시 줄바꿈 깨졌을 때를 대비
    if command -v dos2unix &> /dev/null; then
        dos2unix .env.dev || true
    fi
    export $(grep -v '^#' .env.dev | xargs)
    echo "✅ .env.dev restored successfully!"
else
    echo "⚠️ ENV_DEV_FILE not found. Skipping environment variable setup."
fi

# ======================================================
# 2️⃣ GoogleService-Info.plist 복원 (Firebase 설정)
# ======================================================
if [ -n "$GOOGLE_SERVICE_INFO_PLIST" ]; then
    echo "🔥 Restoring GoogleService-Info.plist..."
    mkdir -p ios/MedEasy
    echo "$GOOGLE_SERVICE_INFO_PLIST" | base64 --decode > ios/MedEasy/GoogleService-Info.plist
    plutil -lint ios/MedEasy/GoogleService-Info.plist || true
    echo "✅ GoogleService-Info.plist restored successfully!"
else
    echo "⚠️ GOOGLE_SERVICE_INFO_PLIST not found. Firebase may fail to initialize!"
fi

# ======================================================
# 3️⃣ Homebrew 설정 (Apple Silicon & Intel 공통)
# ======================================================
if [ -f "/opt/homebrew/bin/brew" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo "✅ Homebrew configured (Apple Silicon)"
elif [ -f "/usr/local/bin/brew" ]; then
    eval "$(/usr/local/bin/brew shellenv)"
    echo "✅ Homebrew configured (Intel)"
else
    echo "⚠️ Homebrew not found — installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# ======================================================
# 4️⃣ Node.js 설치 확인 및 버전 출력
# ======================================================
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing via Homebrew..."
    brew install node@18
    export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
    export PATH="/usr/local/opt/node@18/bin:$PATH"
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# npm 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found even after Node.js installation"
    echo "📍 PATH: $PATH"
    exit 1
fi
echo "✅ npm version: $(npm --version)"

# ======================================================
# 5️⃣ npm 패키지 설치
# ======================================================
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies..."
    npm install --legacy-peer-deps
else
    echo "⚠️ package.json not found — skipping npm install"
fi

# ======================================================
# 6️⃣ CocoaPods 설치
# ======================================================
echo "📦 Installing CocoaPods dependencies..."
cd ios

echo "🧹 Cleaning up old CocoaPods cache..."
rm -rf Pods Podfile.lock

echo "🔧 Running pod install..."
pod install --repo-update

echo "✅ Dependencies installed successfully!"
