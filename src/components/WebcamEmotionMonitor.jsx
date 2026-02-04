import React, { useEffect, useRef } from "react";
import { apiPath } from "../utils/apiBase";

/**
 * WebcamEmotionMonitor — real-time facial expression detection via Hume Streaming API.
 * Captures webcam frames and sends them over a WebSocket to Hume's Expression Measurement API.
 * Calls onEmotion([{ name, score }, ...]) with the top detected emotions.
 */
export default function WebcamEmotionMonitor({ onEmotion }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      // 1. Get camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: 10 },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("👁️ Camera permission denied:", err);
        return;
      }

      // 2. Get Hume API key for Expression Measurement streaming API
      let apiKey = null;
      try {
        const res = await fetch(apiPath("/api/hume/streaming-key"));
        if (!res.ok) throw new Error("Failed to get Hume streaming key");
        const data = await res.json();
        apiKey = data.apiKey;
      } catch (err) {
        console.warn("👁️ Could not get Hume streaming key — facial detection disabled:", err.message);
        return;
      }

      if (!mountedRef.current) return;

      // 3. Connect to Hume Expression Measurement WebSocket
      const wsUrl = `wss://api.hume.ai/v0/stream/models?apikey=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("👁️ Hume face expression WebSocket connected");

        // 4. Start sending frames every 1.5 seconds (rate-limited for performance)
        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);

          // Convert to base64 JPEG
          const dataURL = canvas.toDataURL("image/jpeg", 0.7);
          const base64 = dataURL.split(",")[1];

          // Send to Hume streaming API
          const payload = {
            data: base64,
            models: {
              face: {}
            },
            raw_text: false
          };

          try {
            ws.send(JSON.stringify(payload));
          } catch (err) {
            // WebSocket may have closed
          }
        }, 1500);
      };

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);

          // Extract face predictions
          const facePredictions = result?.face?.predictions;
          if (facePredictions && facePredictions.length > 0) {
            const emotions = facePredictions[0].emotions;
            if (emotions && emotions.length > 0) {
              // Already in { name, score } format from Hume
              const sorted = [...emotions].sort((a, b) => b.score - a.score);
              const top = sorted.slice(0, 5);
              onEmotion?.(top);
            }
          }
        } catch (err) {
          // Ignore parse errors
        }
      };

      ws.onerror = (err) => {
        console.warn("👁️ Hume face WebSocket error:", err);
      };

      ws.onclose = () => {
        console.log("👁️ Hume face WebSocket closed");
      };
    };

    init();

    return () => {
      mountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
