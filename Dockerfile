FROM node:18.17.0

# Install Homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install watchman with Homebrew
ENV PATH="/home/linuxbrew/.linuxbrew/bin:${PATH}"
RUN brew install watchman

WORKDIR /webui
COPY ./scripts/webui-dev /start-webui-dev

COPY package.json .
COPY Makefile .

COPY /react ./react

RUN apt-get update && apt-get install -y uuid-runtime
RUN npm install -g npm@9.8.1
RUN npm i


# Add for substitution and authorization
RUN sed -i 's/\r//' /start-webui-dev \
    && chmod +x /start-webui-dev