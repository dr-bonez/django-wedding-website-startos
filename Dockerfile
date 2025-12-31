FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=bigday.settings

# Create app directory
WORKDIR /app

# Copy the upstream project from submodule
COPY django-wedding-website/ .

# Install Python dependencies (skip psycopg2 and Fabric - we use SQLite, not PostgreSQL)
RUN pip install --no-cache-dir django==4.2.* django-environ==0.11.2 gunicorn

# Create data directory for SQLite database
RUN mkdir -p /data

# Expose port 8000 (gunicorn listens here, nginx proxies to it)
EXPOSE 8000
