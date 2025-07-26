FROM python:3.9-slim

WORKDIR /app

# Install zmap and required dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    zmap \
    iproute2 \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN pip install pyzmap

EXPOSE 8000

# Run with root privileges to allow network scanning
CMD ["python", "app.py"] 