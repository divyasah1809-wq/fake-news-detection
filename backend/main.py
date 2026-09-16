from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle

app = FastAPI(title="Fake News Detection API")

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model and TF-IDF vectorizer
with open("../model.pkl", "rb") as f:
    model = pickle.load(f)

with open("../vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)


class NewsRequest(BaseModel):
    headline: str
    article: str


@app.get("/")
def home():
    return {"message": "Fake News Detection API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict")
def predict_news(request: NewsRequest):
    news_text = (
    request.headline.strip() + " " + request.article.strip()
).strip()

    if not news_text:
        return {"error": "Please enter some news text"}

    # Convert input text into TF-IDF features
    text_vector = vectorizer.transform([news_text])

    # Make prediction
    prediction = model.predict(text_vector)[0]

    # Get confidence score
    probabilities = model.predict_proba(text_vector)[0]
    confidence = max(probabilities) * 100

    result = "REAL" if prediction == 1 else "FAKE"

    return {
        "prediction": result,
        "confidence": round(confidence, 2)
    }