"use client";
import Navbar from "../components/navbar";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "../styles/jobdes.css";


// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   'pdfjs-dist/build/pdf.worker.min.mjs',
   import.meta.url,
 ).toString();


export default function JobDescriptionPage() {
   const fileUrl = "carbonite-jobdes.pdf"; // URL of the PDF fil'
   const [numPages, setNumPages] = useState<number | null>(null);
   const [pageNumber, setPageNumber] = useState(1);

   const completeJobDescription = () => {
       localStorage.setItem("progress", "res-review");
       window.location.href = '/res-review';
     };

     return (
   <div>
       <Navbar />
       <h1> Job description Page </h1>
       <p> Read the Job description carefully before moving on... </p>


       <div className="pdf-container">
           <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                   <Page pageNumber={pageNumber}
                   renderTextLayer={true}
                   renderAnnotationLayer={true}/>
               </Document>
               </div>

      
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



