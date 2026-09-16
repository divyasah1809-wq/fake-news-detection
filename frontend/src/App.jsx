import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [headline, setHeadline] = useState("");
  const [article, setArticle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("darkMode") === "true";
});

  // Load prediction history from browser storage
  useEffect(() => {
    const savedHistory = localStorage.getItem("predictionHistory");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);
    useEffect(() => {
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);
  // Example news
  const examples = [
    {
      name: "Example 1",
      headline: "Government announces new education policy",
      article:
        "The government announced a new policy to improve education across the country.",
    },
    {
      name: "Example 2",
      headline: "Scientists discover new treatment",
      article:
        "Researchers announced a new treatment after conducting several years of scientific studies.",
    },
    {
      name: "Example 3",
      headline: "Celebrity makes shocking announcement",
      article:
        "A viral social media post claims that a famous celebrity has made a surprising announcement.",
    },
  ];

  // Load example
  const loadExample = (example) => {
    setHeadline(example.headline);
    setArticle(example.article);
    setResult(null);
  };

  // Check news
  const checkNews = async () => {
    if (!headline.trim() && !article.trim()) {
      setResult({
        error: "Please enter a headline or article.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline: headline,
          article: article,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      // Keep spinner visible briefly
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setResult(data);

      // Add prediction to history
      const newHistoryItem = {
        headline: headline.trim() || "No headline",
        prediction: data.prediction,
        confidence: data.confidence,
        time: new Date().toLocaleTimeString(),
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 5);

      setHistory(updatedHistory);

      localStorage.setItem(
        "predictionHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      setResult({
        error: "Unable to connect to the backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear input and result
  const clearAll = () => {
    setHeadline("");
    setArticle("");
    setResult(null);
  };

  // Clear prediction history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("predictionHistory");
  };

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <div className="container">

        <button
  className="theme-button"
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>
        <h1>Fake News Detection</h1>

        <p className="subtitle">
          Analyze news content using machine learning.
        </p>

        {/* Headline */}
        <label>Headline</label>

        <input
          type="text"
          placeholder="Enter news headline..."
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />

        {/* Article */}
        <label>Article</label>

        <textarea
          placeholder="Paste the full news article here..."
          value={article}
          onChange={(e) => setArticle(e.target.value)}
        />

        {/* Example News */}
        <div className="examples">
          <p>Try an example:</p>

          <div className="example-buttons">
            {examples.map((example) => (
              <button
                key={example.name}
                className="example-button"
                onClick={() => loadExample(example)}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Buttons */}
        <div className="button-group">
          <button onClick={checkNews} disabled={loading}>
            {loading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                Analyzing...
              </span>
            ) : (
              "Check News"
            )}
          </button>

          <button className="clear-button" onClick={clearAll}>
            Clear
          </button>
        </div>

        {/* Current Result */}
        {result && (
          <div className="result">
            {result.error ? (
              <p className="error">{result.error}</p>
            ) : (
              <>
                <h2>Prediction Result</h2>

                <div
                  className={`prediction ${
                    result.prediction === "REAL" ? "real" : "fake"
                  }`}
                >
                  {result.prediction}
                </div>

                <p className="confidence">
                  Confidence: <strong>{result.confidence}%</strong>
                </p>
                <p className="result-message">
                {result.prediction === "REAL"
                ? "This news matches patterns commonly found in real news in the training data."
                : "This news matches patterns commonly found in fake news in the training data."}
                </p>

                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Prediction History */}
        {history.length > 0 && (
          <div className="history">
            <div className="history-header">
              <h2>Prediction History</h2>

              <button
                className="clear-history-button"
                onClick={clearHistory}
              >
                Clear History
              </button>
            </div>

            {history.map((item, index) => (
              <div className="history-item" key={index}>
                <div className="history-info">
                  <strong>{item.headline}</strong>
                  <span>{item.time}</span>
                </div>

                <div
                  className={`history-prediction ${
                    item.prediction === "REAL" ? "real" : "fake"
                  }`}
                >
                  {item.prediction}
                  <small>{item.confidence}%</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;