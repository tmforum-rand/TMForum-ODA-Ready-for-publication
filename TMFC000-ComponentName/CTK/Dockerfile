# Base image with Python 3.10
FROM python:3.13.3-slim-bookworm

# Install Node.js (for report generation)
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY componentCTK/ componentCTK/
COPY componentCTK/scripts/requirements.txt componentCTK/scripts/requirements.txt
COPY componentCTK/run.sh componentCTK/run.sh

RUN pip install -r componentCTK/scripts/requirements.txt

CMD ["bash", "componentCTK/run.sh"]
