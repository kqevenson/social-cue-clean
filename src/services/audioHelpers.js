/**
 * Helper function to convert audio blob to base64 string
 * @param {Blob} blob - Audio blob to convert
 * @returns {Promise<string>} - Base64 string (without data URL prefix)
 */
export async function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      // Remove "data:audio/...;base64," prefix
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

/**
 * Helper to record audio from microphone stream
 * @param {MediaStream} stream - Media stream from getUserMedia
 * @param {number} durationMs - Duration to record in milliseconds
 * @returns {Promise<Blob>} - Recorded audio blob
 */
export async function recordAudioFromStream(stream, durationMs = 3000) {
  return new Promise((resolve, reject) => {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      resolve(blob);
    };
    
    mediaRecorder.onerror = (error) => {
      reject(error);
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, durationMs);
  });
}




