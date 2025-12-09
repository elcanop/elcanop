from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import fitz  # PyMuPDF
# from PIL import Image # Removed unused import
import io
import os
import uuid
import json
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mount uploads directory to serve images
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

class TextBlock(BaseModel):
    text: str
    rect: List[float] # x0, y0, x1, y1
    size: float
    color: int
    font: str

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    file_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")

    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    # Process PDF: Extract text and convert first page to image
    try:
        print(f"Opening PDF: {pdf_path}, Size: {os.path.getsize(pdf_path)}")
        doc = fitz.open(pdf_path)
        print(f"PDF Opened. Pages: {len(doc)}")
        page = doc[0] # Focus on first page for MVP

        # Render page to image
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better quality
        img_filename = f"{file_id}_page0.png"
        img_path = os.path.join(UPLOAD_DIR, img_filename)
        pix.save(img_path)

        # Extract text with coordinates
        text_blocks = []
        # get_text("dict") returns a dictionary with text blocks
        page_dict = page.get_text("dict")

        for block in page_dict["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        text_blocks.append({
                            "text": span["text"],
                            "rect": span["bbox"],
                            "size": span["size"],
                            "color": span["color"],
                            "font": span["font"]
                        })

        width = page.rect.width
        height = page.rect.height
        doc.close()

        return {
            "file_id": file_id,
            "image_url": f"http://localhost:8000/static/{img_filename}",
            "text_blocks": text_blocks,
            "width": width,
            "height": height
        }

    except Exception as e:
        print(f"Error processing PDF: {e}")
        # if os.path.exists(pdf_path):
        #    os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

class TextEdit(BaseModel):
    rect: List[float]
    new_text: str
    original_text: str
    size: float
    color: int
    font: str = "helv"  # Default if not provided

class SaveRequest(BaseModel):
    file_id: str
    edits: List[TextEdit]

@app.post("/api/save")
async def save_pdf(request: SaveRequest):
    pdf_path = os.path.join(UPLOAD_DIR, f"{request.file_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        doc = fitz.open(pdf_path)
        page = doc[0] # MVP: First page only

        for edit in request.edits:
            # 1. Redact (erase) the original area
            # We use the original rect.
            # Note: We might need to adjust rect slightly if it doesn't cover everything
            rect = fitz.Rect(edit.rect)
            page.add_redact_annot(rect, fill=(1, 1, 1)) # Fill with white
            page.apply_redactions()

            # 2. Insert new text
            # We try to use the same point of origin (bottom-left of text usually, but pymupdf insert_text uses top-left or baseline depending on function)
            # insert_text point is usually bottom-left of the text start.
            # However, `insert_textbox` fits text in a box.

            if edit.new_text.strip():
                # Simple font mapping
                font_lower = edit.font.lower()
                fontname = "helv"
                if "times" in font_lower or "serif" in font_lower or "roman" in font_lower:
                    fontname = "tiro"
                elif "courier" in font_lower or "mono" in font_lower or "typewriter" in font_lower:
                    fontname = "cour"

                # Convert color integer to RGB tuple (0-1 range for fitz)
                r = ((edit.color >> 16) & 0xFF) / 255.0
                g = ((edit.color >> 8) & 0xFF) / 255.0
                b = (edit.color & 0xFF) / 255.0

                page.insert_text(
                    point=(rect.x0, rect.y1 - (rect.y1-rect.y0)*0.2), # heuristic baseline
                    text=edit.new_text,
                    fontsize=edit.size,
                    fontname=fontname,
                    color=(r, g, b)
                )

        output_filename = f"{request.file_id}_edited.pdf"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        doc.save(output_path)
        doc.close()

        return FileResponse(output_path, filename="documento_editado.pdf")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
