FROM node:22-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*
RUN npm install -g openclaw@latest
WORKDIR /app
CMD ["openclaw", "gateway", "--verbose", "--allow-unconfigured"]
