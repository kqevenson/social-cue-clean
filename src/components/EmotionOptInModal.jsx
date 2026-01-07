import React from "react";

export default function EmotionOptInModal({ onEnable, onDisable }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl max-w-lg text-white border border-white/20 shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Emotional Support Mode</h1>
        <p className="text-lg mb-6 text-gray-200 leading-relaxed">
          I can help you understand your feelings during the lesson — like when something feels tricky, confusing, or exciting.
          You're always in control, and the camera never saves images.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onEnable}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
          >
            Yes, help me
          </button>
          <button
            onClick={onDisable}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold"
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}




