// src/hooks/usePopupListener.ts
"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { usePathname } from "next/navigation";

const socket = io("http://localhost:5001");

export const usePopupListener = (userEmail: string | null): [
  { headline: string; message: string } | null,
  () => void
] => {
  const [popup, setPopup] = useState<{ headline: string; message: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (userEmail) {
      socket.emit("studentOnline", { studentId: userEmail });
      socket.emit("studentPageChanged", { studentId: userEmail, currentPage: pathname });
      
      const updateCurrentPage = async () => {
        try {
          await fetch("http://localhost:5001/update-currentpage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: pathname, user_email: userEmail }),
          });
        } catch (error) {
          console.error("Error updating current page:", error);
        }
      };

      updateCurrentPage();
    }
  }, [userEmail, pathname]);

  useEffect(() => {
    socket.on("receivePopup", ({ headline, message }) => {
      setPopup({ headline, message });
    });

    return () => {
      socket.off("receivePopup");
    };
  }, []);

  const dismissPopup = () => setPopup(null);

  return [popup, dismissPopup];
};