FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create requirements file
RUN echo "fastapi" > requirements.txt && \
    echo "uvicorn" >> requirements.txt && \
    echo "python-multipart" >> requirements.txt && \
    echo "pillow" >> requirements.txt && \
    echo "numpy" >> requirements.txt && \
    echo "python-dotenv" >> requirements.txt && \
    echo "requests" >> requirements.txt

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Install torch and torchvision (CPU version)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy application code
COPY backend/ ./backend/
COPY models/firewall/firewall_cnn.pth ./models/firewall/

# Fix model path
RUN sed -i 's|BASE_DIR = "D:/PROJECTS/AI_Firewall_For_Drones"|BASE_DIR = "."|g' backend/api.py

EXPOSE 8000

CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]
