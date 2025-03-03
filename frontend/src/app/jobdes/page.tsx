'use client'

import Navbar from "../components/navbar";
import { useState, useEffect, JSX } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import "../styles/jobdes.css";
import {
    PdfHighlighter,
    PdfLoader,
    Highlight,
    AreaHighlight,
    Popup,
    Tip,
} from "react-pdf-highlighter";

import type {
    IHighlight,
    NewHighlight,
    ScaledPosition,
    Content
} from "react-pdf-highlighter";


// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();
import NotesPage from "../components/note";

export default function JobDescriptionPage() { 
    const fileUrl = "carbonite-jobdes.pdf"; // URL of the PDF file
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [highlights, setHighlights] = useState<IHighlight[]>([]);
    const [tool, setTool] = useState("pointer");
    const [comments, setComments] = useState<{x: number; y: number; text: string, page: number}[]>([]);

    const completeJobDescription = () => {
        localStorage.setItem("progress", "res-review");
        window.location.href = '/res-review';
      };

  useEffect(() => {
    const savedHighlights = localStorage.getItem("jobdes-highlights");
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights));
    }
  }, []);

  const saveHighlights = (newHighlights: IHighlight[]) => {
    setHighlights(newHighlights);
    localStorage.setItem("jobdes-highlights", JSON.stringify(newHighlights));
  };

  const addHighlight = (highlight: NewHighlight) => {
    const newHighlights = [...highlights, { id: String(Date.now()), ...highlight }];
    saveHighlights(newHighlights);
  };

  const resetHighlights = () => {
    saveHighlights([]);
  };

  const handlePdfClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (tool === "comment") {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 110;
        const y = ((event.clientY - rect.top) / rect.height) * 120;

        const newComment = {x, y, text: "", page: pageNumber};
        setComments([...comments, newComment]);
    }
  }; 

  const updateComment = (index: number, text: string, pageNumber: number) => {
    const updatedComments = [...comments];
    updatedComments[index].text = text;
    setComments(updatedComments);
  };


  useEffect(() => {
    const savedComments = JSON.parse(localStorage.getItem("pdf-comments") || "[]");
    setComments(savedComments);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("pdf-comments", JSON.stringify(comments));
  }, [comments]);

      return (
    <div>
        <Navbar />
        <div className="jobdes-container">
            <h1>Job Description</h1>
            </div>
            <div className="jobdes-toolbar">
  <button onClick={() => setTool("pointer")} className={`toolbar-button ${tool === "pointer" ? "active" : ""}`}> ➤ </button>
  <button onClick={() => setTool("comment")} className={`toolbar-button ${tool === "comment" ? "active" : ""}`}> 📌 </button> </div>

            <div className={`pdf-container ${tool === "comment" ? "comment-mode" : ""}`} onClick={handlePdfClick}>
            <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    <Page pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}/>
                </Document>

            {comments
            .filter(comment => comment.page === pageNumber)
            .map((comment, index) => (
                <div key={index} className="comment-marker" style={{ left: `${comment.x}%`, top: `${comment.y}%`}}>

                    {comment.text ? (
                        <div className="comment-popup"> {comment.text}</div>
                    ) : (
                        <input
                            type="text"
                            placeholder="Enter comment..."
                            autoFocus
                            onBlur={(e) => updateComment(index, e.target.value, pageNumber)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    updateComment(index, (e.target as HTMLInputElement).value, pageNumber);
                                }
                            }}
                        />
                    )}
                </div>
            ))}
            
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



            {/* HIGHLIGHTER STUFF BROKEN :/
        <div className="pdf-wrapper">
        <PdfLoader url={fileUrl} beforeLoad={<p>Loading PDF...</p>}>
          {(pdfDocument) => (
            <div className="pdf-container">
            <PdfHighlighter
              pdfDocument={pdfDocument}
              highlights={highlights}
              onSelectionFinished={(position, content) =>
                tool === "highlight" &&
                addHighlight({ position, content, comment: { text: "Highlighted Text", emoji: "⭐" } })
              }
              highlightTransform={(highlight, index, setTip, hideTip) => (
                <AreaHighlight
                  key={index}
                  highlight={highlight}
                  onMouseOver={(highlight) => setTip(highlight, () => <Tip>{highlight.comment?.text}</Tip>)}
                  onMouseOut={hideTip}
                />
              )}
            />
            </div>
          )}
        </PdfLoader>
      </div> */}
      
      <footer>
        <button onClick={completeJobDescription}> Next: Individual Resume Review </button>
        </footer>
        </div> 
)
}