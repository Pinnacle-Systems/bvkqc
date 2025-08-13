import pdfplumber
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import traceback
import re

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Config
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit
UPLOAD_FOLDER = '/tmp'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Set up logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return "PDF Extraction Service Running", 200

def extract_page_tables(pdf_stream, target_page=6):
    try:
        with pdfplumber.open(pdf_stream) as pdf:
            total_pages = len(pdf.pages)

            if target_page > total_pages or target_page < 1:
                return [], total_pages, f"Page {target_page} does not exist in the PDF", ""

            page_index = target_page - 1
            page = pdf.pages[page_index]
            full_text = page.extract_text()
            tables = page.extract_tables()

            valid_tables = []
            for table_index, table in enumerate(tables):
                cleaned_table = []
                for row in table:
                    # Clean each cell: replace newlines and strip whitespace
                    cleaned_row = [
                        re.sub(r'\s+', ' ', cell).strip() if cell else ''
                        for cell in row
                    ]
                    # Only add row if it's not empty
                    if any(cleaned_row):
                        cleaned_table.append(cleaned_row)
                
                if cleaned_table:
                    valid_tables.append({
                        "page": target_page,
                        "table_index": table_index + 1,
                        "table": cleaned_table
                    })

            return valid_tables, total_pages, None, full_text

    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError:
        return [], 0, "Invalid PDF file format", ""
    except pdfplumber.pdfminer.pdfparser.PDFPasswordIncorrect:
        return [], 0, "PDF is password protected", ""
    except Exception as e:
        app.logger.error(f"Error during extraction: {str(e)}\n{traceback.format_exc()}")
        return [], 0, f"Extraction error: {str(e)}", ""

@app.route('/extract-page-tables', methods=['POST'])
def extract_page_tables_route():
    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file provided'}), 400

        pdf_file = request.files['pdf']

        if pdf_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed'}), 400

        # Additional content type validation
        if pdf_file.content_type not in ['application/pdf', 'application/octet-stream']:
            return jsonify({'error': 'Invalid file content type'}), 400

        target_page = request.form.get('target_page', default=6, type=int)

        tables, page_count, error, full_text = extract_page_tables(
            pdf_file.stream,
            target_page=target_page
        )

        if error:
            return jsonify({'error': error}), 400

        return jsonify({
            'tables': tables,
            'page_count': page_count,
            'table_count': len(tables),
            'full_text': full_text,
            'requested_page': target_page
        })

    except Exception as e:
        app.logger.error(f"Error in route: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# Expose `app` for Gunicorn
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)