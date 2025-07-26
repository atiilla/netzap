FROM node:18-slim

# Install dependencies for zmap
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libgmp3-dev \
    gengetopt \
    libpcap-dev \
    flex \
    byacc \
    libjson-c-dev \
    zmap \
    sudo \
    libcap2-bin \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .


# Set environment variable to indicate Docker environment
ENV DOCKER_ENV=true

# Build the Next.js app
RUN npm run build

EXPOSE 3000

# Custom entrypoint to run zmap.sh before starting Next.js
CMD ["npm", "start"]
