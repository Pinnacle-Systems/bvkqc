import pdfplumber
import sys
import json
import traceback

def extract_page_tables(pdf_path, target_page=6):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            if target_page > total_pages or target_page < 1:
                return {
                    "tables": [],
                    "page_count": total_pages,
                    "error": f"Page {target_page} does not exist (PDF has {total_pages} pages)",
                    "full_text": ""
                }
            
            page = pdf.pages[target_page - 1]
            full_text = page.extract_text() or ""
            tables = page.extract_tables()
            
            valid_tables = []
            for i, table in enumerate(tables):
                cleaned_table = []
                for row in table:
                    # Clean each cell: remove newlines and extra spaces
                    cleaned_row = [cell.replace('\n', ' ').strip() if cell is not None else '' for cell in row]
                    # Only keep rows with at least one non-empty cell
                    if any(cleaned_row):
                        cleaned_table.append(cleaned_row)
                
                # Only keep non-empty tables
                if cleaned_table and any(any(cell for cell in row) for row in cleaned_table):
                    valid_tables.append({
                        "page": target_page,
                        "table_index": i + 1,
                        "table": cleaned_table
                    })
            
            return {
                "tables": valid_tables,
                "page_count": total_pages,
                "table_count": len(valid_tables),
                "full_text": full_text,
                "requested_page": target_page,
                "error": None
            }

    except Exception as e:
        traceback.print_exc()
        return {
            "tables": [],
            "page_count": 0,
            "error": f"Extraction error: {str(e)}",
            "full_text": ""
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments: expected PDF path and target page"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    try:
        target_page = int(sys.argv[2])
    except ValueError:
        print(json.dumps({"error": "Invalid target page: must be an integer"}))
        sys.exit(1)
    
    result = extract_page_tables(pdf_path, target_page)
    print(json.dumps(result))