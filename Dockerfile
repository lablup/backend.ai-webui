FROM node:18.17.0

# Install Homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install watchman with Homebrew
ENV PATH="/home/linuxbrew/.linuxbrew/bin:${PATH}"
RUN brew install watchman

WORKDIR /webui
COPY ./scripts/webui-dev /start-webui-dev

# Add for substitution and authorization
RUN sed -i 's/\r//' /start-webui-dev \
    && chmod +x /start-webui-dev