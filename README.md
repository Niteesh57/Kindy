# Kindy Avatar Studio 🎨✨

Kindy is an interactive AI-powered educational avatar studio with real-time audio dialogues powered by Google Vertex AI / Gemini Flash and Gemini 3.1 Flash TTS.

---

## 🐳 Running with Docker

The project uses a unified multi-stage Docker setup that packages both the React/Vite frontend and Node.js backend together.

### 1. Build the Docker Image
```bash
docker build -t kindy-avatar-studio .
```

### 2. Run the Container
Pass your API key using the existing `server/.env` file:
```bash
docker run -d -p 8080:8080 --name kindy-app --env-file server/.env kindy-avatar-studio
```
Or pass environment variables directly:
```bash
docker run -d -p 8080:8080 --name kindy-app \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e GOOGLE_CLOUD_PROJECT="your-project-id" \
  kindy-avatar-studio
```

### 3. Open the Frontend URL
Once running, navigate to:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 🚀 Running with Docker Compose

Run with a single command:
```bash
docker compose up --build
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

To stop the container:
```bash
docker compose down
```

---

## ☁️ Deploying to Google Cloud Run

Cloud Run runs this container natively with full support for WebSockets and HTTP/2.

### Option A: One-Command Direct Source Deploy (Recommended)
From the project root:
```bash
gcloud run deploy kindy-avatar-studio \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key",GOOGLE_CLOUD_PROJECT="your-project-id",GOOGLE_CLOUD_LOCATION="us-central1"
```

### Option B: Build & Deploy Container via Google Artifact Registry
```bash
# 1. Set variables
PROJECT_ID="your-project-id"
REGION="us-central1"
REPO="kindy-repo"
IMAGE="kindy-avatar-studio"

# 2. Authenticate and build image with Cloud Build
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest

# 3. Deploy to Cloud Run
gcloud run deploy kindy-avatar-studio \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --session-affinity \
  --timeout 3600 \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key",GOOGLE_CLOUD_PROJECT="${PROJECT_ID}",GOOGLE_CLOUD_LOCATION="${REGION}"
```

> **Note on WebSockets in Cloud Run**:
> Cloud Run supports WebSockets out of the box. Specifying `--session-affinity` and `--timeout 3600` ensures long-lived real-time streaming connections stay connected smoothly.

---

## 🛠️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Container HTTP and WebSocket listening port | `8080` (Cloud Run) / `3001` (local) |
| `GEMINI_API_KEY` | Google Gemini API / Vertex AI Key | Required |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud Project ID | Optional |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI Region (e.g. `us-central1`) | `us-central1` |
| `GEMINI_FLASH_MODEL` | Dialogue model identifier | `gemini-3.8-flash` |
| `GEMINI_TTS_MODEL` | Voice synthesis model identifier | `gemini-3.1-flash-tts-preview` |
| `GEMINI_TTS_VOICE` | Default voice preset (`Zephyr`, `Kore`, `Puck`, etc.) | `Zephyr` |
