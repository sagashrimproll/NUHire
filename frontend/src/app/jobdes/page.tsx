'use client'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import Navbar from "../components/navbar";
import { useState, useEffect, JSX, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css"
import NotesPage from "../components/note";
import {
    PdfHighlighter,
    PdfLoader,
    Highlight,
    AreaHighlight,
    Popup,
    Tip,
} from "react-pdf-highlighter";
import Footer from "../components/footer";

import type {
    IHighlight,
    NewHighlight,
    ScaledPosition,
    Content
} from "react-pdf-highlighter";
import router from "next/router";



pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();


export default function JobDescriptionPage() { 
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [highlights, setHighlights] = useState<IHighlight[]>([]);
    const [tool, setTool] = useState("pointer");
    const [comments, setComments] = useState<{x: number; y: number; text: string, page: number}[]>([]);
     const [loading, setLoading] = useState(true);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [fileUrl, setJob] = useState("");
    const [user, setUser] = useState(null);

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
    const pdfPage = document.querySelector(".react-pdf__Page") as HTMLElement | null; // Select the actual page
    if (!pdfPage) {
        console.log("PDF page not found.");
        return;
    }

    const pageRect = pdfPage.getBoundingClientRect();

    const x = (event.clientX + pageRect.left) / 18.5;
    const y = (event.clientY + pageRect.top) / 18.5;

    
    if (
      event.clientX >= pageRect.left && 
      event.clientX <= pageRect.right &&
      event.clientY >= pageRect.top && 
      event.clientY <= pageRect.bottom
    ) {
        if (tool === "comment") {
            const newComment = { x, y, text: "", page: pageNumber };
            setComments([...comments, newComment]);
        }
    } else {
        console.log("Clicked outside the PDF page, comment not added.");
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, { credentials: "include" });
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
          router.push("/login"); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login"); 
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);



  useEffect(() => {
    if (user && user.email) {
      const updateCurrentPage = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/update-currentpage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 'jobdes', user_email: user.email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update current page:", errorData.error);
          }
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [user]);

  useEffect(() => {
    const fetchJob = async () => {
      if (!user || !user.job_des) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/jobdes/title?title=${encodeURIComponent(user.job_des)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch job description");
        }
  
        const job = await response.json();
        setJob(`${API_BASE_URL}/${job.file_path}`);
      } catch (error) {
        console.error("Error fetching job description:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJob();
  }, [user]); // ✅ Depend on `user`
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user || user.affiliation !== "student" || user.group === null) {
    return null;
  }

      return (
        <div>
          <Navbar />
          <div className="flex items-right justify-end">
            <NotesPage />
          </div>
          <div className="flex justify-center items-center font-rubik text-navyHeader text-4xl font-bold mb-4">
            Job Description
          </div>
          <div className="flex justify-center space-x-4 my-4">
            <button
              onClick={() => setTool("pointer")}
              className={`px-5 py-2 rounded bg-navy font-rubik text-white transition duration-300 ease-in-out 
                ${
                  tool === "pointer"
                    ? "ring-2 ring-navy"
                    : "hover:bg-navyHeader"
                }`}
            >

              Cursor
            </button>
            <button
              onClick={() => setTool("comment")}
              className={`px-5 py-2 rounded bg-navy font-rubik text-white transition duration-300 ease-in-out 
                ${
                  tool === "comment"
                    ? "ring-2 ring-navy"
                    : "hover:bg-navyHeader"
                }`}
            >
              Comment
            </button>
          </div>

          <div
            id="pdf-container"
            className={`relative border border-gray-300 p-4 w-full mx-auto flex justify-center 
    ${tool === "comment" ? "cursor-crosshair" : ""}`}
            onClick={handlePdfClick}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPdfLoaded(true);
              }}
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="flex justify-center"
                scale={1.3}
              />
            </Document>

            {comments
              .filter((comment) => comment.page === pageNumber)
              .map((comment, index) => (
                <div
                  key={index}
                  className="absolute bg-white shadow-md p-2 rounded-md"
                  style={{ left: `${(comment.x / 1.3)}%`, top: `${(comment.y / 1.3)}%` }}
                >
                  {comment.text ? (
                    <div className="bg-gray-200 text-sm p-2 rounded-md">
                      {comment.text}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter comment..."
                      autoFocus
                      className="border border-gray-400 rounded-md p-1 text-sm"
                      onBlur={(e) =>
                        updateComment(index, e.target.value, pageNumber)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateComment(
                            index,
                            (e.target as HTMLInputElement).value,
                            pageNumber
                          );
                        }
                      }}
                    />
                  )}
                </div>
              ))}
          </div>

          <div className="flex justify-center items-center gap-5 mt-5 mb-5 w-full">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(pageNumber - 1)}
              className="px-4 py-2 rounded bg-navy font-rubik text-white transition duration-300 hover:bg-navyHeader disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <span className="font-bold text-lg mx-4">
              Page {pageNumber} of {numPages}
            </span>

            <button
              disabled={pageNumber >= (numPages || 1)}
              onClick={() => setPageNumber(pageNumber + 1)}
              className="px-4 py-2 rounded bg-navy font-rubik text-white transition duration-300 hover:bg-navyHeader disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
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
                addHighlight({ position, content, comment: { text: "Highlighted Text"} })
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
            <div className="flex justify-end mt-4 mb-4 mr-4">
              <button
                onClick={completeJobDescription}
                className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
              >
                Next: Resume Review pt. 1 →
              </button>
            </div>
          </footer>

          <Footer />
        </div>
      );
}