FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=bigday.settings

# Create app directory
WORKDIR /app

# Copy the upstream project from submodule
COPY django-wedding-website/ .

# Install Python dependencies from upstream
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Create data directory for SQLite database
RUN mkdir -p /data

# Expose port 8080
EXPOSE 8080
