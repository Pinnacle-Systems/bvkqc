import os
from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
import traceback
from werkzeug.utils import secure_filename
from flask_cors import CORS  # Add CORS support

app = Flask(__name__)
CORS(app)  
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
def extract_text_from_pdf(file_stream):
    try:
        pdf_reader = PdfReader(file_stream)
        page_count = len(pdf_reader.pages)
        extracted_text = ""
        
        for i, page in enumerate(pdf_reader.pages):
            try:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += f"--- Page {i+1} ---\n{page_text}\n\n"
            except Exception as page_error:
                print(f"Error on page {i+1}: {str(page_error)}")
                extracted_text += f"--- Page {i+1} [TEXT EXTRACTION FAILED] ---\n\n"
        
        return extracted_text, page_count, None
    except Exception as e:
        return None, 0, str(e)

@app.route('/extract-text', methods=['POST'])
def extract_text():
    try:
        print("Received request to extract text")
        
        if 'pdf' not in request.files:
            print("No PDF in request")
            return jsonify({'error': 'No PDF file provided'}), 400
        
        pdf_file = request.files['pdf']
        
        if pdf_file.filename == '':
            print("Empty filename")
            return jsonify({'error': 'No selected file'}), 400
            
        if not pdf_file.filename.lower().endswith('.pdf'):
            print("Invalid file type:", pdf_file.filename)
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed'}), 400
        
        print(f"Processing file: {pdf_file.filename} ({pdf_file.content_length} bytes)")
        extracted_text, page_count, error = extract_text_from_pdf(pdf_file)
        
        if error:
            print(f"Extraction error: {error}")
            if "EOF marker not found" in error:
                return jsonify({'error': 'Invalid PDF structure (file might be corrupted)'}), 400
            elif "file has not been decrypted" in error:
                return jsonify({'error': 'PDF is encrypted (password protected)'}), 400
            return jsonify({'error': f'Text extraction failed: {error}'}), 500
        
        warning = None
        if not extracted_text.strip():
            warning = "No text content found - this might be a scanned document"
            print(warning)
        
        print(f"Extraction successful: {page_count} pages, {len(extracted_text)} characters")
        
        return jsonify({
            'text': extracted_text,
            'page_count': page_count,
            'warning': warning
        })
    
    except Exception as e:
        print("Server error:", traceback.format_exc())
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)