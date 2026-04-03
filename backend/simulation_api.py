from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os
import io
from pathlib import Path

app = FastAPI(title="Adversarial AI Firewall")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CONFIGURATION
# ============================================================
BASE_DIR = Path(__file__).parent.parent
SIMULATION_DIR = BASE_DIR / "frontend" / "public" / "simulation"
MODEL_PATH = BASE_DIR / "models" / "firewall" / "firewall_cnn.pth"
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print(f"Using device: {DEVICE}")
print(f"Model path: {MODEL_PATH}")
print(f"Model exists: {MODEL_PATH.exists()}")

# ============================================================
# MODEL ARCHITECTURE (Must match training exactly)
# ============================================================
class FirewallAI(nn.Module):
    def __init__(self):
        super(FirewallAI, self).__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.4),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        x = self.cnn(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

# ============================================================
# LOAD MODEL
# ============================================================
print("\n📦 Loading model...")
model = FirewallAI().to(DEVICE)

if MODEL_PATH.exists():
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()
    print("✅ Model loaded successfully")
else:
    print(f"❌ Model not found at {MODEL_PATH}")
    print("⚠️ Using fallback logic until model is placed correctly")

# ============================================================
# PREPROCESSING (Must match training EXACTLY)
# ============================================================
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ============================================================
# SHARED PREDICTION FUNCTION (Used by both /simulate and /predict)
# ============================================================
def predict_image(image: Image.Image) -> tuple:
    """
    Predict if image is clean or attack
    Returns: (prediction_string, confidence_score)
    """
    try:
        # Ensure RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Apply transforms
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        # Inference
        with torch.no_grad():
            output = model(image_tensor)
            confidence = output.item()
            
            # Binary classification: 0=clean, 1=attack
            if confidence > 0.5:
                prediction = "attack"
            else:
                prediction = "clean"
        
        return prediction, confidence
    
    except Exception as e:
        print(f"Prediction error: {e}")
        return "error", 0.0

# ============================================================
# SIMULATION STATE
# ============================================================
simulation_state = {
    "current_index": 0,
    "total_images": 0
}

def get_image_list():
    """Get list of all images in simulation folder (1-20)"""
    images = []
    for i in range(1, 21):
        for ext in ['.jpeg', '.jpg', '.png']:
            img_path = SIMULATION_DIR / f"{i}{ext}"
            if img_path.exists():
                images.append({
                    "path": str(img_path),
                    "filename": f"{i}{ext}",
                    "url": f"/simulation/{i}{ext}"
                })
                break
    simulation_state["total_images"] = len(images)
    return images

# ============================================================
# API ENDPOINTS
# ============================================================
@app.get("/simulate/next")
async def get_next_image():
    """Get next image with REAL model prediction"""
    images = get_image_list()
    
    if not images:
        return JSONResponse(status_code=404, content={"error": "No images found"})
    
    current_idx = simulation_state["current_index"] % len(images)
    image_info = images[current_idx]
    
    # Load and predict using REAL model
    try:
        img = Image.open(image_info["path"])
        prediction, confidence = predict_image(img)
        
        print(f"🔍 Processing: {image_info['filename']} → {prediction.upper()} ({confidence:.2f})")
        
    except Exception as e:
        print(f"Error processing {image_info['filename']}: {e}")
        prediction = "error"
        confidence = 0.0
    
    # Update index for next call
    simulation_state["current_index"] += 1
    
    return {
        "image_url": image_info["url"],
        "filename": image_info["filename"],
        "prediction": prediction,
        "confidence": confidence,
        "index": current_idx + 1,
        "total": len(images)
    }

@app.post("/predict")
async def predict_upload(file: UploadFile = File(...)):
    """Predict uploaded image using REAL model"""
    try:
        # Read uploaded file
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Use shared prediction function
        prediction, confidence = predict_image(img)
        
        print(f"📤 Upload: {file.filename} → {prediction.upper()} ({confidence:.2f})")
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "filename": file.filename
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/simulate/reset")
async def reset_simulation():
    """Reset simulation counter"""
    simulation_state["current_index"] = 0
    return {"status": "reset"}

@app.get("/simulate/status")
async def get_status():
    """Get current simulation status"""
    return {
        "current_index": simulation_state["current_index"],
        "total_images": simulation_state["total_images"]
    }

# Serve static files
app.mount("/simulation", StaticFiles(directory=str(SIMULATION_DIR)), name="simulation")

print("\n✅ Backend ready!")
print(f"📍 Simulation images: {SIMULATION_DIR}")
print(f"📍 Model: {MODEL_PATH}")