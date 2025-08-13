from flask import Flask, request, render_template_string, jsonify
import fitz  # PyMuPDF
import re
import os

app = Flask(__name__)

# Improved HTML template with styling
html = '''
<!DOCTYPE html>
<html>
<head>
    <title>PDF Text Extractor</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #2c3e50; }
        form { margin-bottom: 20px; }
        input[type="file"] { margin: 10px 0; }
        button { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #2980b9; }
        pre { 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 15px; 
            border-radius: 4px; 
            overflow-x: auto;
            max-height: 500px;
            white-space: pre-wrap;
        }
        .error { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h2>PDF Text Extractor</h2>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="pdf" accept=".pdf" required><br>
            <button type="submit">Extract Text</button>
        </form>
        
        {% if error %}
            <div class="error"><strong>Error:</strong> {{ error }}</div>
        {% endif %}
        
        {% if text %}
            <h3>Extracted Text:</h3>
            <pre>{{ text }}</pre>
        {% endif %}
    </div>
</body>
</html>
'''

@app.route('/', methods=['GET', 'POST'])
def upload_pdf():
    text = ""
    error = ""
    
    if request.method == 'POST':
        # Check if file was uploaded
        if 'pdf' not in request.files:
            error = "No file uploaded"
            return render_template_string(html, error=error)
            
        file = request.files['pdf']
        
        # Validate file
        if file.filename == '':
            error = "No selected file"
        elif not file.filename.lower().endswith('.pdf'):
            error = "Invalid file type. Only PDF files are allowed"
        else:
            try:
                pdf_data = file.read()
                doc = fitz.open(stream=pdf_data, filetype="pdf")
                
                # Extract text from all pages
                for page in doc:
                    text += page.get_text()
                    
                doc.close()
                
                # Clean up text
                text = re.sub(r'\s+', ' ', text).strip()
                
            except Exception as e:
                error = f"Error processing PDF: {str(e)}"
    
    return render_template_string(html, text=text, error=error)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)