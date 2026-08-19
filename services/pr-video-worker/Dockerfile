FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    espeak-ng \
    fonts-wqy-microhei \
    fonts-dejavu-core \
    ca-certificates \
    git \
    python3 \
    python3-venv \
    python3-pip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/pr-video-worker/package.json /app/package.json
COPY services/pr-video-worker/package-lock.json /app/package-lock.json
RUN npm ci --omit=dev

COPY tsconfig.json /app/tsconfig.json
COPY lib /app/lib
COPY public/audio/brandbridge-bgm.wav /app/public/audio/brandbridge-bgm.wav
RUN mkdir -p /app/public/images/blog/japan
COPY public/images/blog/japan/dungthuyvunguyen-matcha-2356774.jpg \
     public/images/blog/japan/mirkostoedter-tea-6568547.jpg \
     public/images/blog/japan/shio_design_jp-food-9384171.jpg \
     public/images/blog/japan/jggrz-nature-4955817.jpg \
     /app/public/images/blog/japan/
COPY services/pr-video-worker/tsconfig.json /app/services/pr-video-worker/tsconfig.json
COPY services/pr-video-worker/server.ts /app/services/pr-video-worker/server.ts
COPY services/moneyprinterturbo /app/services/moneyprinterturbo

RUN git clone --depth 1 https://github.com/harry0703/MoneyPrinterTurbo.git /app/vendor/MoneyPrinterTurbo \
  && python3 -m venv /app/vendor/MoneyPrinterTurbo/.venv \
  && /app/vendor/MoneyPrinterTurbo/.venv/bin/pip install --no-cache-dir --upgrade pip \
  && /app/vendor/MoneyPrinterTurbo/.venv/bin/pip install --no-cache-dir \
    moviepy==2.2.1 \
    loguru==0.7.3 \
    numpy \
    pillow \
    pydantic \
    requests \
    pyyaml \
    pydub \
    packaging \
    toml \
  && cp /app/vendor/MoneyPrinterTurbo/config.example.toml /app/vendor/MoneyPrinterTurbo/config.toml

ENV NODE_ENV=production
ENV PORT=8080
ENV PR_VIDEO_ENGINE=moneyprinterturbo
ENV MONEYPRINTERTURBO_ROOT=/app/vendor/MoneyPrinterTurbo
ENV IMAGEIO_FFMPEG_EXE=/usr/bin/ffmpeg
EXPOSE 8080

CMD ["npx", "tsx", "services/pr-video-worker/server.ts"]
