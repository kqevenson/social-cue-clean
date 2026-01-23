import React, { useEffect, useRef, useState } from "react";
import { apiPath } from "../utils/apiBase";

export default function WebcamEmotionMonitor({ onEmotion }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera permission denied:", error);
      }
    };
    getCamera();

    // Cleanup: stop stream when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Capture frames every 900ms
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      
      // Check if video is ready
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      const dataURL = canvas.toDataURL("image/jpeg");
      // Extract base64 string (remove "data:image/jpeg;base64," prefix)
      const base64 = dataURL.split(",")[1];

      // send to backend
      try {
        const res = await fetch(apiPath("/api/hume/emotion"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        onEmotion?.(data.emotions);
      } catch (err) {
        console.error("Emotion stream error:", err);
      }
    }, 900);

    return () => clearInterval(interval);
  }, [onEmotion]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ display: "none" }}
    />
  );
}




