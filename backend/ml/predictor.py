"""
MammAI ML Predictor — DualStream Swin-T + RAD-DINO
Preprocessing exactly matches evaluation code.
"""
import os
import io
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image
from torchvision import transforms
from torchvision.models import swin_t, Swin_T_Weights
from transformers import AutoModel
import pytorch_lightning as pl
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

# ─── Constants ────────────────────────────────────────────────────────────────
CHECKPOINT_PATH = os.getenv("MODEL_CHECKPOINT", "best_rescue_model.ckpt")
IMG_SIZE = 224
CLASS_NAMES = ["Benign", "Lightly Malignant", "Heavily Malignant"]
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ─── Focal Loss (must match training exactly) ─────────────────────────────────
class FocalLoss(nn.Module):
    def __init__(self, weight=None, gamma=1.5, reduction="mean"):
        super().__init__()
        self.gamma = gamma
        self.reduction = reduction
        self.weight = weight

    def forward(self, inputs, targets):
        if self.weight is not None:
            self.weight = self.weight.to(inputs.device)
        ce_loss = F.cross_entropy(inputs, targets, weight=self.weight, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss


# ─── Auto-Cropper (must match training exactly) ───────────────────────────────
class AutoCropBreast:
    def __call__(self, img: Image.Image) -> Image.Image:
        image = np.array(img)
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return img
        c = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        pad = 10
        cropped = image[
            max(0, y - pad): min(image.shape[0], y + h + pad),
            max(0, x - pad): min(image.shape[1], x + w + pad),
        ]
        return Image.fromarray(cropped)


# ─── Inference Transform (identical to eval code) ────────────────────────────
inference_transform = transforms.Compose([
    AutoCropBreast(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# ─── Dual-Stream Lightning Model ─────────────────────────────────────────────
class DualStreamLightningModel(pl.LightningModule):
    def __init__(self, num_classes=3, lr=1e-5):
        super().__init__()
        self.save_hyperparameters()
        self.raddino = AutoModel.from_pretrained("microsoft/rad-dino")
        self.swin = swin_t(weights=Swin_T_Weights.IMAGENET1K_V1)
        self.swin.head = nn.Identity()
        self.norm_rad = nn.BatchNorm1d(768)
        self.norm_swin = nn.BatchNorm1d(768)
        self.classifier = nn.Sequential(
            nn.Linear(1536, 256),
            nn.BatchNorm1d(256),
            nn.GELU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )
        weights = torch.tensor([1.5, 1.2, 1.5])
        self.criterion = FocalLoss(weight=weights, gamma=1.5)

    def forward(self, x):
        raddino_raw = self.raddino(pixel_values=x).pooler_output
        swin_raw = self.swin(x)
        raddino_balanced = self.norm_rad(raddino_raw)
        swin_balanced = self.norm_swin(swin_raw)
        combined = torch.cat((raddino_balanced, swin_balanced), dim=1)
        return self.classifier(combined)


# ─── Grad-CAM reshape helper ──────────────────────────────────────────────────
def _reshape_transform(tensor):
    """Swin-T: [1, 7, 7, 768] → [1, 768, 7, 7]"""
    return tensor.permute(0, 3, 1, 2)


# ─── Singleton model loader ───────────────────────────────────────────────────
_model: DualStreamLightningModel | None = None
_cam: GradCAM | None = None


def load_model():
    global _model, _cam
    if _model is not None:
        return _model, _cam

    print(f"🧠 Loading checkpoint: {CHECKPOINT_PATH}")
    _model = DualStreamLightningModel.load_from_checkpoint(
        CHECKPOINT_PATH, num_classes=len(CLASS_NAMES)
    )
    _model.to(device)
    _model.eval()

    target_layers = [_model.swin.features[-1]]
    _cam = GradCAM(
        model=_model,
        target_layers=target_layers,
        reshape_transform=_reshape_transform,
    )
    print("✅ Model ready.")
    return _model, _cam


# ─── Main inference function ──────────────────────────────────────────────────
def predict_image(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.
    Returns:
        {
          "benign": float,           # percentage 0-100
          "lightly_malignant": float,
          "heavily_malignant": float,
          "dominant_class": str,
          "gradcam_png_bytes": bytes | None
        }
    """
    model, cam = load_model()

    # 1. Decode image
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # 2. Apply same preprocessing as evaluation code
    tensor = inference_transform(pil_img).unsqueeze(0).to(device)  # [1, 3, 224, 224]

    # 3. Inference
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.nn.functional.softmax(logits, dim=1)[0]  # [3]

    benign_pct = round(probs[0].item() * 100, 1)
    light_pct  = round(probs[1].item() * 100, 1)
    heavy_pct  = round(probs[2].item() * 100, 1)

    scores = {CLASS_NAMES[0]: benign_pct, CLASS_NAMES[1]: light_pct, CLASS_NAMES[2]: heavy_pct}
    dominant = max(scores, key=scores.get)

    # 4. Grad-CAM
    gradcam_bytes = None
    try:
        pred_idx = int(probs.argmax().item())
        targets = [ClassifierOutputTarget(pred_idx)]
        grayscale_cam = cam(input_tensor=tensor, targets=targets)[0, :]

        img_arr = tensor[0].cpu().numpy().transpose(1, 2, 0)
        mean = np.array([0.485, 0.456, 0.406])
        std  = np.array([0.229, 0.224, 0.225])
        rgb_img = np.clip(std * img_arr + mean, 0, 1).astype(np.float32)

        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True,
                                          colormap=cv2.COLORMAP_JET)
        success, buf = cv2.imencode(".png", cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR))
        if success:
            gradcam_bytes = buf.tobytes()
    except Exception as e:
        print(f"⚠️  Grad-CAM failed (non-fatal): {e}")

    return {
        "benign": benign_pct,
        "lightly_malignant": light_pct,
        "heavily_malignant": heavy_pct,
        "dominant_class": dominant,
        "gradcam_png_bytes": gradcam_bytes,
    }
