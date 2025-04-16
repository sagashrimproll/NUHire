"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "../components/navbar";
import NotesPage from "../components/note";
import { useProgress } from "../components/useProgress";
import Footer from "../components/footer";
import router from "next/router";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import RatingSlider from "../components/ratingSlider";
import Popup from "../components/popup";

const socket = io(API_BASE_URL);

export default function Interview() {
  useProgress();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<{
    headline: string;
    message: string;
  } | null>(null);
  const pathname = usePathname();
  const [overall, setOverall] = useState(5);
  const [professionalPresence, setProfessionalPresence] = useState(5);
  const [qualityOfAnswer, setQualityOfAnswer] = useState(5);
  const [personality, setPersonality] = useState(5);
  const [videoIndex, setVideoIndex] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [fadingEffect, setFadingEffect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [interviews, setInterviews] = useState<
    { resume_id: number; title: string; video_path: string }[]
  >([]);
  const [noShow, setNoShow] = useState(false);

  interface User {
    id: string;
    group_id: string;
    email: string;
  }

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
  }, []);

  useEffect(() => {
    if (user && user.email) {
      socket.emit("studentOnline", { studentId: user.email });

      socket.emit("studentPageChanged", {
        studentId: user.email,
        currentPage: pathname,
      });

      const updateCurrentPage = async () => {
        try {
          await fetch(`${API_BASE_URL}/update-currentpage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page: "interviewpage",
              user_email: user.email,
            }),
          });
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [user, pathname]);

  const fetchInterviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/interview_vids`);
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error("Error fetching resumes: ", error);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    socket.on("receivePopup", ({ headline, message }) => {
      setPopup({ headline, message });

      if (headline === "Abandoned Interview") {
        setNoShow(true);
      } else {
        setNoShow(false);
      }
    });
    return () => {
      socket.off("receivePopup");
    };
  }, []);

  const currentVid = interviews[videoIndex];

  useEffect(() => {
    console.log("Interviews:", interviews);
    console.log("Video Index:", videoIndex);
    console.log("Current video:", currentVid);
  }, [interviews, videoIndex, currentVid]);

  const nextVideo = () => {
    if (videoIndex < interviews.length - 1) {
      setFadingEffect(true);
      setTimeout(() => {
        setVideoIndex(videoIndex + 1);
        setTimeSpent(0);
        setFadingEffect(false);
        setNoShow(false);
        console.log(videoIndex);
      }, 500);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOverallSliderChange = (value: number) => {
    console.log("Overall Slider value changed to: ", value);
    setOverall(value);
  };

  const handleProfessionalPresenceSliderChange = (value: number) => {
    console.log("Prof. Presence Slider value changed to: ", value);
    setProfessionalPresence(value);
  };

  const handleQualityOfAnswerSliderChange = (value: number) => {
    console.log("Quality of Answer Slider value changed to: ", value);
    setQualityOfAnswer(value);
  };

  const handlePersonalitySliderChange = (value: number) => {
    console.log("Personality and Creativity Slider changed to: ", value);
    setPersonality(value);
  };

  const resetRatings = () => {
    setOverall(5);
    setProfessionalPresence(5);
    setQualityOfAnswer(5);
    setPersonality(5);
  };

  const sendResponseToBackend = async (
    overall: number,
    professionalPresence: number,
    qualityOfAnswer: number,
    personality: number,
    timeSpent: number,
    candidate_id: number
  ) => {
    if (!user || !user.id || !user.group_id) {
      console.error("Student ID or Group ID not found");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/interview/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: user.id,
          group_id: user.group_id,
          question1: overall,
          question2: professionalPresence,
          question3: qualityOfAnswer,
          question4: personality,
          timespent: timeSpent,
          candidate_id: candidate_id,
        }),
      });
      if (!response.ok) {
        console.error("Failed to submit response:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const handleSubmit = async () => {
    if (noShow) {
      await sendResponseToBackend(1, 1, 1, 1, timeSpent, currentVid.resume_id);
    } else {
      await sendResponseToBackend(
        overall,
        professionalPresence,
        qualityOfAnswer,
        personality,
        timeSpent,
        currentVid.resume_id
      );
    }

    if (videoIndex < interviews.length - 1) {
      nextVideo();
      resetRatings();
    } else {
      console.log("All interviews have been are rated!");
      setFinished(true);
    }
  };

  const completeInterview = () => {
    localStorage.setItem("progress", "makeOffer");
    window.location.href = "/makeOffer ";
  };

  if (loading) {
    <div> Loading ...</div>;
  }
  if (!user) {
    <div> User Error</div>;
  }

  return (
    <div className="bg-sand font-rubik">
      <Navbar />
      <div className="flex items-right justify-end">
        <NotesPage />
      </div>
      <div className="flex justify-center items-center font-rubik text-navyHeader text-4xl font-bold mb-4">
        Interview Page
      </div>

      <div className="relative flex flex-col md:flex-row min-h-screen mt-4">
        <div className="md:w-1/3 bg-blue-50 shadow-lg p-4 mx-4 my-2 flex flex-col items-center justify-start rounded-lg">
          <h1 className="text-2xl text-navyHeader font-bold mb-4">
            Evaluation
          </h1>
          <h3 className="font-bol text-navy text-center">
            {" "}
            Please watch the interview and rate on a scale from 1 - 10
          </h3>
          <h3 className="font-bol text-navy text-center mb-4">
            {" "}
            Submit to note your responses and move to the next interview.
          </h3>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Overall
            </h2>
            <RatingSlider onChange={handleOverallSliderChange} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Professional Presence
            </h2>
            <RatingSlider onChange={handleProfessionalPresenceSliderChange} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Quality of Answer
            </h2>
            <RatingSlider onChange={handleQualityOfAnswerSliderChange} />
          </div>

          <div className="flex flex-col items-center text-center w-full max-w-xs mb-6">
            <h2 className="text-md text-navyHeader font-semibold mb-2">
              Personality & Creativeness
            </h2>
            <RatingSlider onChange={handlePersonalitySliderChange} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={finished}
            className={`px-4 py-2 rounded-lg shadow-md transition duration-300 font-rubik mt-6 ${
              finished
                ? "bg-blue-500 text-white opacity-50 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-900"
            }`}
          >
            Submit Response
          </button>
        </div>

        {finished && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-springWater p-8 w-200 rounded-md shadow-lg z-50 font-bold font-rubik text-navyHeader">
            All Interviews have been rated! You can move onto the next stage!
          </div>
        )}

        <div className="md:w-2/3 flex flex-col items-center justify-center p-4 md:p-8">
          <h1 className="text-xl font-rubik font-bold mb-4 text-center">
            {noShow ? "Candidate No-Show" : "Place Holder interview video"}
          </h1>
          <div className="w-full max-w-4xl aspect-video border-4 border-navyHeader mb-5 rounded-lg shadow-lg mx-auto">
            {noShow ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl font-bold">
                  This candidate did not show up.
                </p>
              </div>
            ) : currentVid ? (
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src={currentVid.video_path}
                title={currentVid.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            ) : (
              <div>Loading Interview Video...</div>
            )}
          </div>
        </div>

        {popup && (
          <Popup
            headline={popup.headline}
            message={popup.message}
            onDismiss={() => setPopup(null)}
          />
        )}
      </div>

      <footer>
        <div className="flex justify-between ml-4 mt-4 mb-4 mr-4">
          <button
            onClick={() => (window.location.href = "/res-review-group")}
            className="px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik"
          >
            ← Back: Resume Review Group
          </button>
          <button
            onClick={completeInterview}
            className={`px-4 py-2 bg-navyHeader text-white rounded-lg shadow-md hover:bg-navy transition duration-300 font-rubik
            ${
              !finished
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-blue-400"
            }`}
            disabled={!finished}
          >
            Next: Make Offer page →
          </button>
        </div>
      </footer>
      <Footer />
    </div>
  );
}
