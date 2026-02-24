FROM node:22-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates && \
    rm -rf /var/lib/apt/lists/*
RUN printf '[url "https://github.com/"]\n\tinsteadOf = ssh://git@github.com/\n\tinsteadOf = git@github.com:\n' > /root/.gitconfig
RUN npm install -g openclaw@latest
WORKDIR /app
CMD ["openclaw", "gateway", "--verbose", "--allow-unconfigured"]
