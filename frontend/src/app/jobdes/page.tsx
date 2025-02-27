"use client";

import Navbar from "../components/navbar";
import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { pdfDocEncodingDecode, PDFDocument, rgb } from "pdf-lib";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import "../styles/jobdes.css";
import {PdfHighlighter, Highlight, Popup, AreaHighlight} from "react-pdf-highlighter";


// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

export default function JobDescriptionPage() { 
    const fileUrl = "carbonite-jobdes.pdf"; // URL of the PDF fil'
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [highlights, setHighlights] = useState<any[]>([]);
    const [tool, setTool] = useState("pointer");

    
    const completeJobDescription = () => {
        localStorage.setItem("progress", "res-review");
        window.location.href = '/res-review';
      };

      const addHighlight = (highlight: any) => {
        setHighlights([...highlights, highlight]);
      }


      return (
    <div>
        <Navbar />
        <div className="jobdes-container">
            <h1>Job Description</h1>
            </div>
        <div className="jobdes-toolbar-container">
        <div className="jobdes-toolbar"> 
            <button onClick={() => setTool("pointer")} className={tool === "pointer" ? "active" : ""}>Pointer</button>
            <button onClick={() => setTool("highlight")} className={tool === "highlight" ? "active" : ""}>Highlight</button>
            <button onClick={() => setTool("note")} className ={tool === "note" ? "active" : ""}>Note</button> 
            </div>

            <div className="pdf-container">
            <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    <Page pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}/>
                </Document>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="pagination">
                <button disabled={pageNumber <= 1} onClick={() => setPageNumber(pageNumber - 1)}>
                    ← Previous
                </button>
                <span>Page {pageNumber} of {numPages}</span>
                <button disabled={pageNumber >= (numPages || 1)} onClick={() => setPageNumber(pageNumber + 1)}>
                    Next →
                </button>
            </div>
      
      <footer>
        <button onClick={completeJobDescription}> Next: Individual Resume Review </button>
        </footer>
        </div> 
)
}