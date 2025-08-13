from flask import Flask, request, jsonify
import pdfplumber

app = Flask(__name__)

# Default route to check if service is running
@app.route('/', methods=['GET'])
def home():
    return "PDF Extraction Service Running", 200


# POST route for extracting tables from a specific page
@app.route('/extract-page-tables', methods=['POST'])
def extract_page_tables_endpoint():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['file']
    try:
        target_page = int(request.form.get('target_page', 1))
    except ValueError:
        return jsonify({"error": "Invalid target_page value"}), 400

    try:
        with pdfplumber.open(pdf_file) as pdf:
            if target_page < 1 or target_page > len(pdf.pages):
                return jsonify({"error": "Invalid page number"}), 400

            page = pdf.pages[target_page - 1]
            tables = page.extract_tables()
            return jsonify({"tables": tables}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Make sure it listens on all interfaces in production
    app.run(host='0.0.0.0', port=5000, debug=True)
