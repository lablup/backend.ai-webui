FROM node:18.17.0

# Install Homebrew
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Install watchman with Homebrew
ENV PATH="/home/linuxbrew/.linuxbrew/bin:${PATH}"
RUN brew install watchman

WORKDIR /webui
COPY ./scripts/dev /scripts

# Add for substitution and authorization
RUN find /scripts -type f -exec sed -i 's/\r//' {} \; \
    && find /scripts -type f -exec chmod +x {} \;