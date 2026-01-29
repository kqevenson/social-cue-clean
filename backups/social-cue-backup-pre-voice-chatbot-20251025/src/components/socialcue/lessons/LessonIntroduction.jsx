import React from 'react';
import { BookOpen, Clock, Target, ArrowRight, Sparkles } from 'lucide-react';

export default function LessonIntroduction({ lesson, onStart }) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {lesson.introduction.title}
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8"></div>
        </div>

        {/* Lesson Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{lesson.introduction.title}</h2>
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <BookOpen className="w-5 h-5" />
              <span className="text-lg font-semibold">{lesson.topic}</span>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <Target className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-3 text-green-400">What You'll Learn</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {lesson.introduction.objective}
                </p>
              </div>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="mb-8">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-3 text-purple-400">Why This Matters</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {lesson.introduction.whyItMatters}
                </p>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-semibold text-yellow-400">
              Estimated Time: {lesson.introduction.estimatedTime}
            </span>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              Let's Start Learning!
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500">Step 1 of 4: Introduction</p>
        </div>
      </div>
    </div>
  );
}

