from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BartTokenizer, BartForConditionalGeneration
import torch
import requests
import json
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load the BART model and tokenizer
model_name = "facebook/bart-large-cnn"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name).to(device)

# API key and endpoint for urltotext service
URL_TO_TEXT_API_KEY = "wdrR3JzlKC8mPfU09LguEa8zohEcEpCZ7vDYLMQh"  # Replace with your actual API key
URL_TO_TEXT_API_ENDPOINT = "https://web.apitier.com/convert/url/to/html?x-api-key=wdrR3JzlKC8mPfU09LguEa8zohEcEpCZ7vDYLMQh"

def extract_text_from_url(url):
    """
    Extracts main content text from a URL using the urltotext API.
    """
    payload = json.dumps({
        "url": url,
        "output_format": "json",
        "extract_main_content": True,
        "render_javascript": True
    })

    headers = {
        "x-api-key": URL_TO_TEXT_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(URL_TO_TEXT_API_ENDPOINT, headers=headers, data=payload)
        logging.info(f"URL to text API response: {response.status_code} - {response.text}")

        if response.status_code == 200:
            result = response.json()
            extracted_text = result.get("content", "")
            
            if not extracted_text:
                raise ValueError("No meaningful text found in the URL response.")
            
            return extracted_text.strip()
        else:
            raise ValueError(f"API error {response.status_code}: {response.text}")
    except requests.RequestException as e:
        logging.error(f"Request failed: {str(e)}")
        raise ValueError(f"Request failed: {str(e)}")

@app.route('/sample-get', methods=['GET'])
def sample_get():
    return jsonify({'message': 'Sample GET request'})

@app.route('/summarize', methods=['POST'])
def summarize_text():
    """
    Summarizes text provided as raw input or extracted from a URL.
    """
    try:
        input_data = request.get_json()
        input_text = input_data.get("text", "").strip()
        input_url = input_data.get("url", "").strip()

        # Extract text from URL if provided
        if input_url:
            input_text = extract_text_from_url(input_url)

        # Validate text input
        if not input_text:
            return jsonify({"error": "Input text is empty."}), 400

        # Tokenize input text
        inputs = tokenizer(input_text, max_length=1024, truncation=True, return_tensors="pt").to(device)

        # Generate summary
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=128,
            num_beams=4,
            early_stopping=True
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        # Return the summary
        return jsonify({"summary": summary})

    except ValueError as ve:
        logging.error(f"ValueError: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": "Internal server error."}), 500
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
