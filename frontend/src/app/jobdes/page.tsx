"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const dynamic = "force-dynamic";

import { useState, useEffect, JSX, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Navbar from "../components/navbar";
import NotesPage from "../components/note";
import Popup from "../components/popup";
import Footer from "../components/footer";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import router from "next/router";

const socket = io(API_BASE_URL);

// worker source to display the pdf on the page
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface CommentType {
  id: string;
  x: number;
  y: number;
  text: string;
  page: number;
  isEditing?: boolean;
}

interface User {
  email: string;
  job_des: string;
}

export default function JobDescriptionPage() {
  const [fileUrl, setJob] = useState("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1); // the pdf is paginated
  const [comments, setComments] = useState<CommentType[]>([]); // list of all the comments
  const [tool, setTool] = useState<"pointer" | "comment">("pointer"); // set 2 tools, a pointer for a mouse cursor and a comment tool that allows for comments | default is set to pointer
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
    headline: string;
    message: string;
  } | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          credentials: "include",
        });
        const userData = await response.json();
        if (response.ok) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user && user.email) {
      socket.emit("studentOnline", { studentId: user.email });

      socket.emit("studentPageChanged", {
        studentId: user.email,
        currentPage: pathname,
      });

      const updateCurrentPage = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/update-currentPage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: "jobdes", user_email: user.email }),
          });
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [user]);

  // pdfs assigned by the advisor and updated in the database for that user once assigned
  useEffect(() => {
    const fetchJob = async () => {
      if (!user || !user.job_des) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/jobdes/title?title=${encodeURIComponent(
            user.job_des
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

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
  }, [user]);

  // comments are in local storage in the browser of the user, so once a user logs off and signs in again the comments won't dissapear
  // Improve Suggestion: Make comments a database value instead of local storage, so that as soon as the user is done with the last stage all comments are automatically wiped to a new array
  useEffect(() => {
    const savedComments = localStorage.getItem("pdf-comments");
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pdf-comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    socket.on("receivePopup", ({ headline, message }) => {
      setPopup({ headline, message });
    });
    return () => {
      socket.off("receivePopup");
    };
  }, []);

  // Record mouse even to check if comment mode, and allows to add comments anywhere in the PDF only not the page itsef. 
  // comments are also filtered by the page of the pdf.
  const handlePdfClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (tool !== "comment") return;
    const pdfPage = document.querySelector(
      ".react-pdf__Page"
    ) as HTMLElement | null;
    if (!pdfPage) {
      console.log("PDF page not found.");
      return;
    }
    const pageRect = pdfPage.getBoundingClientRect();
    if (
      event.clientX >= pageRect.left &&
      event.clientX <= pageRect.right &&
      event.clientY >= pageRect.top &&
      event.clientY <= pageRect.bottom
    ) {
      // Calculate coordinates relative to PDF
      const x = ((event.clientX - pageRect.left) / pageRect.width) * 100;
      const y = ((event.clientY - pageRect.top) / pageRect.height) * 100;
      const newComment: CommentType = {
        id: String(Date.now()),
        x,
        y,
        text: "",
        page: pageNumber,
        isEditing: true,
      };
      setComments([...comments, newComment]);
    } else {
      console.log("Clicked outside the PDF page, comment not added.");
    }
  };

  // Update comment text and turn off editing mode
  const updateComment = (id: string, newText: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id
          ? { ...comment, text: newText, isEditing: false }
          : comment
      )
    );
  };

  const deleteComment = (id: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id)
    );
  };

  const toggleEditComment = (id: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === id ? { ...comment, isEditing: true } : comment
      )
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: User not found.</div>;

  return (
    <div className="bg-sand font-rubik">
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
          className={`px-5 py-2 rounded bg-navy font-rubik text-white transition duration-300 ease-in-out ${
            tool === "pointer" ? "ring-2 ring-navy" : "hover:bg-navyHeader"
          }`}
        >
          Cursor
        </button>
        <button
          onClick={() => setTool("comment")}
          className={`px-5 py-2 rounded bg-navy font-rubik text-white transition duration-300 ease-in-out ${
            tool === "comment" ? "ring-2 ring-navy" : "hover:bg-navyHeader"
          }`}
        >
          Comment
        </button>
      </div>

      <div
        id="pdf-container"
        className={`relative border border-sand p-4 w-full mx-auto flex justify-center rounded-lg ${
          tool === "comment" ? "cursor-crosshair" : ""
        }`}
        onClick={handlePdfClick}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPdfLoaded(true);
          }}
          className={`relative`}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="flex justify-center"
            scale={1.3}
          />

          {comments
            .filter((comment) => comment.page === pageNumber)
            .map((comment) => (
              <div
                key={comment.id}
                className="comment-overlay absolute bg-white shadow-md p-2 rounded-md"
                style={{
                  left: `${comment.x}%`,
                  top: `${comment.y}%`,
                }}
              >
                {comment.isEditing ? (
                  <input
                    type="text"
                    placeholder="Enter comment..."
                    autoFocus
                    className="border border-gray-400 rounded-md p-1 text-sm"
                    defaultValue={comment.text}
                    onBlur={(e) => updateComment(comment.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateComment(
                          comment.id,
                          (e.target as HTMLInputElement).value
                        );
                      }
                    }}
                  />
                ) : (
                  <div className="relative">
                    <div
                      className="bg-gray-200 text-sm p-2 rounded-md cursor-pointer"
                      onClick={() => toggleEditComment(comment.id)}
                    >
                      {comment.text}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteComment(comment.id);
                      }}
                      className="absolute top-0 right-0 text-red-500 text-xs"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            ))}
        </Document>

        {popup && (
          <Popup
            headline={popup.headline}
            message={popup.message}
            onDismiss={() => setPopup(null)}
          />
        )}
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

      <footer>
        <div className="flex justify-end mt-4 mb-4 mr-4">
          <button
            onClick={() => {
              localStorage.setItem("progress", "res-review");
              window.location.href = "/res-review";
            }}
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
