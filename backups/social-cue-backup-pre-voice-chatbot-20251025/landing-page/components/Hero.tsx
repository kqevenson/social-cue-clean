import React from 'react';
import { Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl font-black text-white tracking-tight">Social</span>
            <div className="relative mx-2">
              <span className="text-6xl font-black text-white">C</span>
              <div className="absolute -top-2 left-0 w-full h-8 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <div className="w-6 h-6 bg-emerald-500 rounded-full -ml-3"></div>
              </div>
              <div className="absolute -bottom-2 left-0 w-12 h-6 border-l-4 border-r-4 border-b-4 border-emerald-500 rounded-b-full"></div>
            </div>
            <span className="text-6xl font-black text-white">e</span>
          </div>
          <p className="text-xl text-gray-400 font-medium">Master the art of social connection</p>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          Build Social Skills
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Through Practice
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Interactive scenarios, AI-powered feedback, and personalized coaching to help you 
          navigate any social situation with confidence.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-full text-lg hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-2xl">
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              Start Practicing Free
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
          </button>
          
          <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-full text-lg hover:border-gray-400 hover:bg-gray-800 transition-all duration-300">
            Watch Demo
          </button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-black"></div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-black"></div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-black"></div>
              <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-black"></div>
            </div>
            <span className="text-sm">Join 10,000+ learners</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(5)}
            </div>
            <span className="text-sm">4.9/5 rating</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
