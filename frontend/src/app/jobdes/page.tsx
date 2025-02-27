"use client";

import Navbar from "../components/navbar";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import "../styles/jobdes.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

export default function JobDescriptionPage() { 
    const fileUrl = "carbonite-jobdes.pdf"; // URL of the PDF fil'
    const [numPages, setNumPages] = useState<number | null>(null);
    
    const completeJobDescription = () => {
        localStorage.setItem("progress", "res-review");
        window.location.href = '/res-review';
      };


      return (
    <div>
        <Navbar />
        <h1> Job description Page </h1>
        <p> Complete this section before moving on to the next </p>

        <div className="pdf-container">
                <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    {Array.from(new Array(numPages), (_, index) => (
                        <Page key={index} pageNumber={index + 1} />
                    ))}
                </Document>
            </div>
      
      <footer>
        <button onClick={completeJobDescription}> Next: Individual Resume Review </button>
        </footer>
        </div> 
)
}