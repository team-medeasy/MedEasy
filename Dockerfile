# ====== 1단계: 빌드 환경 ======
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .

# progress bar 비활성화 및 병렬 처리 제한
RUN pip install --prefix=/install \
    --no-cache-dir \
    --progress-bar off \
    --no-compile \
    -r requirements.txt

# ====== 2단계: 런타임 환경 ======
FROM medeasy-registry.kr.ncr.ntruss.com/common/python-node-base:3.11

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]