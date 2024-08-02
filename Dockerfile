# Use the official Python 3.12 image from the Docker Hub
FROM python:3.12.4-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /owl

# Install system dependencies
RUN apt-get update && apt-get install -y curl postgresql-client

# Install Rye
RUN pip install poetry


COPY pyproject.toml /owl/
COPY poetry.lock /owl/
COPY README.md /owl/
COPY owl /owl/owl

RUN poetry config virtualenvs.create false

RUN poetry install

# Ensure the storage directory exists
RUN mkdir -p /owl/storage

# Expose the port the app runs on
EXPOSE 5000

