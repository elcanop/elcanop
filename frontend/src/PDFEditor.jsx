import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function PDFEditor() {
  const [file, setFile] = useState(null);
  const [pdfData, setPdfData] = useState(null); // { file_id, image_url, text_blocks, width, height }
  const [edits, setEdits] = useState({}); // Map of block index -> new text
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPdfData(response.data);
      setEdits({});
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir el archivo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfData && containerRef.current) {
      // PDF width is in points.
      // We want to calculate the scale factor between the displayed image width and the PDF width.
      // However, to keep it simple, let's set the container width to match the PDF width (or a multiple)
      // and let the image scale to it.

      // Let's assume 1 PDF point approx 1.33 px on screen? No, CSS px is usually 96dpi, PDF is 72dpi.
      // 1 pt = 1/72 inch. 1 px = 1/96 inch.
      // So 1 pt = 96/72 px = 1.333 px.

      // But we can just use the container's visual width vs the pdf logic width.
      const updateScale = () => {
         const currentWidth = containerRef.current.offsetWidth;
         // pdfData.width is the width in points from PyMuPDF
         setScale(currentWidth / pdfData.width);
      };

      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [pdfData]);

  const handleTextChange = (index, newText) => {
    setEdits(prev => ({
      ...prev,
      [index]: newText
    }));
  };

  const handleSave = async () => {
    if (!pdfData) return;
    setLoading(true);

    // Prepare edits list
    const editsList = Object.keys(edits).map(index => {
      const block = pdfData.text_blocks[index];
      return {
        rect: block.rect,
        new_text: edits[index],
        original_text: block.text,
        size: block.size,
        color: block.color,
        font: block.font
      };
    });

    try {
      const response = await axios.post(`${API_URL}/save`, {
        file_id: pdfData.file_id,
        edits: editsList
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'documento_editado.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Error al guardar el archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Editor PDF Profesional</h1>
          <p className="text-gray-600">Edita texto en tus PDFs de forma sencilla y casi indetectable.</p>
        </header>

        {!pdfData && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-xl mx-auto text-center">
             <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  mb-4
                "
              />
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Procesando..." : "Subir y Editar"}
              </button>
          </div>
        )}

        {pdfData && (
          <div className="flex flex-col items-center">
            <div className="mb-4 sticky top-4 z-50">
               <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-green-700 font-bold transition transform hover:scale-105"
                >
                  {loading ? "Guardando..." : "Descargar PDF Editado"}
               </button>
            </div>

            <div
              ref={containerRef}
              className="relative bg-white shadow-2xl border border-gray-200"
              style={{
                width: '100%',
                maxWidth: '1000px', // Limit max width for readability
                // Aspect ratio is maintained by the image
              }}
            >
              <img
                src={pdfData.image_url}
                alt="PDF Page"
                className="w-full h-auto block select-none"
              />

              {pdfData.text_blocks.map((block, index) => {
                // Calculate position and size based on scale
                const x = block.rect[0] * scale;
                const y = block.rect[1] * scale;
                const w = (block.rect[2] - block.rect[0]) * scale;
                const h = (block.rect[3] - block.rect[1]) * scale;

                // Adjust font size slightly?
                // block.size is in points. CSS font-size in pixels?
                // if 1 pt = 1.33 px.
                // We use scale to convert PDF points to container pixels.
                // So fontSize should also be scaled.
                const fontSize = block.size * scale;

                // Convert color
                const r = (block.color >> 16) & 0xFF;
                const g = (block.color >> 8) & 0xFF;
                const b = block.color & 0xFF;
                const colorHex = `rgb(${r}, ${g}, ${b})`;

                const currentText = edits[index] !== undefined ? edits[index] : block.text;

                return (
                  <input
                    key={index}
                    type="text"
                    value={currentText}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `${y}px`, // Slight adjustment might be needed for baseline
                      width: `${w}px`,
                      height: `${h}px`,
                      fontSize: `${fontSize}px`,
                      fontFamily: 'Helvetica, Arial, sans-serif', // Fallback
                      color: colorHex,
                      background: 'white', // Solid background to cover original text
                      border: 'none',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      lineHeight: 1,
                      // For debug or hover effect to show it's editable:
                      cursor: 'text'
                    }}
                    className="hover:bg-blue-50 hover:bg-opacity-20 focus:bg-white focus:ring-1 focus:ring-blue-300 rounded-sm transition-colors"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFEditor;
