import os
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add upload folder configuration
UPLOAD_FOLDER = '/tmp/pdf_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/extract-page-tables', methods=['POST'])
def extract_page_tables_route():
    try:
        if 'pdf' not in request.files:
            logger.error("No PDF file in request")
            return jsonify({'error': 'No PDF file provided'}), 400
        
        pdf_file = request.files['pdf']
        
        if pdf_file.filename == '':
            logger.error("Empty filename")
            return jsonify({'error': 'No selected file'}), 400
            
        if not pdf_file.filename.lower().endswith('.pdf'):
            logger.error("Invalid file type")
            return jsonify({'error': 'Invalid file type. Only PDF files are allowed'}), 400
        
        # Save file temporarily
        filename = secure_filename(pdf_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        pdf_file.save(file_path)
        logger.info(f"File saved to: {file_path}")
        
        target_page = request.form.get('target_page', default=6, type=int)
        
        # Process from saved file
        with open(file_path, 'rb') as f:
            tables, page_count, error, full_text = extract_page_tables(
                f, 
                target_page=target_page
            )
        
        # Clean up
        try:
            os.remove(file_path)
            logger.info(f"File removed: {file_path}")
        except Exception as e:
            logger.error(f"Error removing file: {str(e)}")
        
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
        logger.exception("Unhandled exception in extraction")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500