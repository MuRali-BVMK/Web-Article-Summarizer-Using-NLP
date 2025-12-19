import React, { useState, useRef } from "react";
import "./App.css"; // Import updated CSS

const App = () => {
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summaryRef = useRef(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const payload = inputUrl ? { url: inputUrl } : { text: inputText };
      const response = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      } else {
        setError(data.error || "An error occurred while summarizing.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const readSummary = () => {
    if (!summaryRef.current) return;
  
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
  
    const text = summaryRef.current.innerText;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
  
    window.speechSynthesis.speak(speech);
  };
  

  return (
    <div className="container">
      <div className="card">
        <h1>📝 Text Summarizer</h1>

        <textarea
          className="input-box"
          placeholder="Enter text to summarize..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading || inputUrl}
        />

        <div className="separator">OR</div>

        <input
          type="url"
          className="input-box"
          placeholder="Enter URL to extract text..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          disabled={loading || inputText}
        />

        <button
          className={`button ${loading || (!inputText && !inputUrl) ? "disabled" : ""}`}
          onClick={handleSummarize}
          disabled={loading || (!inputText && !inputUrl)}
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>

        {error && <p className="error">{error}</p>}

        {summary && (
          <div className="summary-box">
            <h3>Summary:</h3>
            <p ref={summaryRef}>{summary}</p>
            <button className="button read-button" onClick={readSummary}>
              🔊 Read Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;