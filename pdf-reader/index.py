# app.py
from flask import Flask, request, render_template_string
import fitz  # PyMuPDF

app = Flask(__name__)

# Simple HTML upload form
html = '''
    <h2>Upload PDF File</h2>
    <form method="POST" enctype="multipart/form-data">
        <input type="file" name="pdf" accept=".pdf" required>
        <button type="submit">Upload</button>
    </form>
    <hr>
    <pre>{{ text }}</pre>
'''

@app.route('/', methods=['GET', 'POST'])
def upload_pdf():
    text = ""
    if request.method == 'POST':
        file = request.files['pdf']
        if file:
            pdf_data = file.read()
            doc = fitz.open(stream=pdf_data, filetype="pdf")
            for page in doc:
                text += page.get_text()
            doc.close()
    return render_template_string(html, text=text)

if __name__ == '__main__':
    app.run(debug=True)