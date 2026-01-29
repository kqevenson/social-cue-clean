import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function CTA() {
  const benefits = [
    "Start practicing immediately",
    "No credit card required",
    "Access to all features",
    "Cancel anytime"
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Main CTA */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Social Confidence?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of learners who are already building stronger relationships, 
            advancing their careers, and living more confidently.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-full text-xl hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <div className="flex items-center gap-4">
                <span>Start Your Free Journey</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
            </button>
          </div>

          {/* Benefits List */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔒</span>
              </div>
              <span className="text-lg">100% Secure & Private</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-lg">Instant Access</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎯</span>
              </div>
              <span className="text-lg">Proven Results</span>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Don't let social anxiety hold you back anymore
            </h3>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Every conversation is an opportunity to grow. Every interaction is a chance to connect. 
              With SocialCue, you'll have the tools and confidence to make the most of every social moment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-bold rounded-full text-lg hover:from-blue-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105">
                Get Started Now - It's Free
              </button>
              <button className="px-8 py-4 border-2 border-gray-600 text-white font-semibold rounded-full text-lg hover:border-gray-400 hover:bg-gray-700 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof Numbers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white mb-2">2M+</div>
            <div className="text-gray-400">Conversations Practiced</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white mb-2">98%</div>
            <div className="text-gray-400">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white mb-2">24/7</div>
            <div className="text-gray-400">AI Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white mb-2">Free</div>
            <div className="text-gray-400">Forever Plan</div>
          </div>
        </div>
      </div>
    </section>
  );
}
