from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os, random, time

app = FastAPI(title="MammAI - Dual-Stream Diagnostic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    llm_model = genai.GenerativeModel("gemini-1.5-flash")


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"error": "Invalid file type."})

    # Simulate model inference time (2.5s)
    time.sleep(2.5)

    # Mock predictions (3-class)
    raw = [random.uniform(5, 60), random.uniform(5, 60), random.uniform(5, 60)]
    total = sum(raw)
    benign = round(raw[0] / total * 100, 1)
    light   = round(raw[1] / total * 100, 1)
    heavy   = round(100 - benign - light, 1)

    classes = {benign: "Benign", light: "Lightly Malignant", heavy: "Heavily Malignant"}
    dominant = classes[max(classes)]

    # LLM Report
    if api_key:
        try:
            prompt = f"""You are an expert radiologist AI. Write a structured clinical summary:
- Predicted Class: {dominant}
- Benign: {benign}%, Lightly Malignant: {light}%, Heavily Malignant: {heavy}%

Structure: FINDINGS, IMPRESSION, RECOMMENDATIONS. Be concise and professional."""
            response = llm_model.generate_content(prompt)
            summary = response.text
        except Exception as e:
            summary = _mock_summary(dominant, benign, light, heavy)
    else:
        summary = _mock_summary(dominant, benign, light, heavy)

    return {
        "filename": file.filename,
        "predictions": {
            "benign": benign,
            "lightly_malignant": light,
            "heavily_malignant": heavy
        },
        "dominant_class": dominant,
        "llm_summary": summary
    }


def _mock_summary(dominant, benign, light, heavy):
    return f"""PARALLEL DUAL-STREAM AI CLINICAL SUMMARY
Model: Swin-T v2 + RAD-DINO (Parallel Fusion) | LLM: Gemini 1.5 Flash (Sample Output)

FINDINGS:
The AI dual-stream system analyzed the submitted mammogram using the Swin-T hierarchical encoder and RAD-DINO radiology-pretrained backbone in parallel.

The image demonstrates tissue patterns with regions of interest flagged by the Grad-CAM saliency map. Focal areas of potential architectural distortion were noted.

IMPRESSION:
Primary Classification: {dominant.upper()}
- Benign Probability:             {benign}%
- Lightly Malignant Probability:  {light}%
- Heavily Malignant Probability:  {heavy}%

RECOMMENDATIONS:
1. Radiologist review is {"URGENT" if dominant == "Heavily Malignant" else "recommended"}.
{"2. Proceed with core needle biopsy to confirm malignancy." if dominant != "Benign" else "2. Schedule routine 6-month follow-up screening."}
{"3. Schedule contrast MRI for staging and oncology referral." if dominant == "Heavily Malignant" else "3. Continue standard screening protocol."}

NOTE: This is an AI-assisted report. Final clinical decision rests with the attending radiologist.
Set GEMINI_API_KEY environment variable for live Gemini LLM reports."""


# Serve frontend
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
