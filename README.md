# 🎀 MammAI: Breast Cancer Diagnostic Portal

MammAI is a full-stack, AI-powered diagnostic portal designed for radiologists and medical professionals. By combining state-of-the-art vision models (Swin-T v2 + RAD-DINO) with advanced Large Language Models (Gemini Flash), MammAI provides real-time mammogram analysis, clinical reporting, and patient record management.

## ✨ Features

- **Parallel Dual-Stream AI Inference**: Analyzes uploaded mammograms using both hierarchical encoders (Swin-T) and radiology-pretrained backbones (RAD-DINO) to output probability scores for Benign, Lightly Malignant, and Heavily Malignant classifications.
- **LLM-Powered Clinical Reports**: Automatically generates structured, professional clinical summaries based on the AI vision model's findings using Google's Gemini API.
- **Professional PDF Exports**: Generates clean, printer-friendly PDF reports for medical record-keeping and patient handoffs.
- **Patient Management**: Complete CRUD operations to register patients, track clinical history, and securely perform cascading deletions of patient data when appropriate.
- **Analytics Dashboard**: High-level overview of diagnostic trends and overall distribution of severity cases.

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- [TailwindCSS](https://tailwindcss.com/) & custom CSS for modern, dark-mode glassmorphic styling
- [Framer Motion](https://www.framer.com/motion/) for fluid animations
- [Lucide React](https://lucide.dev/) for iconography
- React Router DOM for routing

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) for lightning-fast API serving
- [SQLAlchemy (Async)](https://www.sqlalchemy.org/) for robust database object-relational mapping (supports SQLite & PostgreSQL)
- Uvicorn ASGI server
- Python Generative AI SDK (`google-generativeai`)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) 3.10+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/keerthicoder07/breastcancer.git
cd breastcancer
```

### 2. Backend Setup

1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend/` directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
4. Start the backend server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *(The API will be available at http://localhost:8000, and the automatic interactive API documentation will be at http://localhost:8000/docs)*

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend-react
   ```
2. Install the Node.js packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The web portal will be available at http://localhost:5173)*

## 💡 Usage

1. Open `http://localhost:5173` in your web browser.
2. Ensure both the frontend and backend servers are running.
3. Log in (or use the default bypass for testing contexts depending on your auth setup).
4. Navigate to the **Diagnostics** tab to upload a mammogram. The integrated ML pipeline and Gemini LLM will process the image and immediately output the probabilities and clinical report.
5. In the **Patient Records** and **Reports** tabs, you can view existing patients, generate PDF files for their reports, or delete records as necessary.
