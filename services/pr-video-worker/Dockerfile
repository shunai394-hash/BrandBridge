FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    espeak-ng \
    mecab \
    mecab-ipadic-utf8 \
    mecab-utils \
    fonts-wqy-microhei \
    fonts-dejavu-core \
    ca-certificates \
  && rm -rf /usr/lib/x86_64-linux-gnu/espeak-ng-data/voices/mb \
  && espeak-ng --voices=ja \
  && printf '%s\n' '日本語のテストです。' | mecab -Oyomi > /tmp/ja-yomi.txt \
  && espeak-ng -v ja -f /tmp/ja-yomi.txt -w /tmp/ja-voice-check.wav \
  && test -s /tmp/ja-voice-check.wav \
  && rm -f /tmp/ja-yomi.txt /tmp/ja-voice-check.wav \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/pr-video-worker/package.json /app/package.json
COPY services/pr-video-worker/package-lock.json /app/package-lock.json
RUN npm ci --omit=dev

COPY tsconfig.json /app/tsconfig.json
COPY lib /app/lib
COPY public/audio/brandbridge-bgm.wav /app/public/audio/brandbridge-bgm.wav
RUN test -f /app/public/audio/brandbridge-bgm.wav
COPY services/pr-video-worker/tsconfig.json /app/services/pr-video-worker/tsconfig.json
COPY services/pr-video-worker/server.ts /app/services/pr-video-worker/server.ts

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npx", "tsx", "services/pr-video-worker/server.ts"]
