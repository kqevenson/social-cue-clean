import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function LessonExplanation({ lesson, onStartPractice }) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.introduction.title}</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>

        {/* Main Concept */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <BookOpen className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-400">Main Concept</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {lesson.explanation.mainConcept}
              </p>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-400">Key Points to Remember</h2>
              <div className="space-y-4">
                {lesson.explanation.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-orange-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-6 text-orange-400">Common Mistakes to Avoid</h2>
              <div className="space-y-4">
                {lesson.explanation.commonMistakes.map((mistake, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Start Practice Button */}
        <div className="text-center mb-8">
          <button
            onClick={onStartPractice}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Start Practice Scenarios
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500">Step 2 of 4: Explanation</p>
        </div>
      </div>
    </div>
  );
}

