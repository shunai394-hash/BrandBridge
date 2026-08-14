FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    espeak-ng \
    fonts-wqy-microhei \
    fonts-dejavu-core \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/pr-video-worker/package.json /app/package.json
COPY services/pr-video-worker/package-lock.json /app/package-lock.json
RUN npm ci --omit=dev

COPY tsconfig.json /app/tsconfig.json
COPY lib /app/lib
COPY services/pr-video-worker/server.ts /app/services/pr-video-worker/server.ts

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["npx", "tsx", "services/pr-video-worker/server.ts"]
