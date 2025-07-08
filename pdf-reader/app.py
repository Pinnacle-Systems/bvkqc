import os
import base64
from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import traceback
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024

@app.route('/extract-images', methods=['POST'])
def extract_images():
    try:
        print("Received request to extract images")
        
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
        
        # Read the PDF file
        pdf_data = pdf_file.read()
        doc = fitz.open(stream=pdf_data, filetype="pdf")
        page_count = len(doc)
        images = []
        total_image_size = 0
        
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            img_list = page.get_images(full=True)
            
            for img_index, img in enumerate(img_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]
                size_kb = len(image_bytes) / 1024
                total_image_size += size_kb
                
                # Convert to base64 for frontend display
                image_base64 = base64.b64encode(image_bytes).decode("ascii")
                data_uri = f"data:image/{image_ext};base64,{image_base64}"
                
                images.append({
                    "page": page_num + 1,
                    "width": width,
                    "height": height,
                    "size_kb": round(size_kb, 2),
                    "data": data_uri,
                    "format": image_ext,
                    "xref": xref
                })
        
        doc.close()
        
        if not images:
            warning = "No images found in the PDF document"
            print(warning)
            return jsonify({'warning': warning}), 200
        
        print(f"Extracted {len(images)} images from {page_count} pages")
        
        return jsonify({
            'images': images,
            'page_count': page_count,
            'image_count': len(images),
            'total_size_kb': round(total_image_size, 2)
        })
    
    except Exception as e:
        print("Server error:", traceback.format_exc())
        error_msg = str(e).lower()
        if "encrypted" in error_msg or "password" in error_msg:
            return jsonify({'error': 'PDF is encrypted (password protected)'}), 400
        elif "invalid cross reference" in error_msg or "xref" in error_msg:
            return jsonify({'error': 'Invalid PDF structure (file might be corrupted)'}), 400
        return jsonify({
            'error': f'Image extraction failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)