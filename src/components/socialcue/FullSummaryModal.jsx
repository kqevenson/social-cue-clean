import React from "react";
import { X, Lightbulb, CheckCircle, Calendar } from "lucide-react";

export default function FullSummaryModal({ isOpen, onClose, session, darkMode }) {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div
        className={`max-w-xl w-full rounded-3xl p-8 border ${
          darkMode ? "bg-white/10 border-white/20" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {session.scenarioTitle}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {new Date(session.date).toLocaleString()}
            </span>
          </div>

          {/* What went well */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                What You Did Well
              </h3>
            </div>
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {session.whatWentWell || "No data"}
            </p>
          </div>

          {/* Tip for next time */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Tip for Next Time
              </h3>
            </div>
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              {session.tipForNextTime || "No data"}
            </p>
          </div>

          {/* AI JSON (optional view) */}
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
              AI Analysis (JSON)
            </h3>
            <pre
              className={`p-4 rounded-xl text-sm overflow-auto ${
                darkMode ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}
            >
              {JSON.stringify(session.aiSummary, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

