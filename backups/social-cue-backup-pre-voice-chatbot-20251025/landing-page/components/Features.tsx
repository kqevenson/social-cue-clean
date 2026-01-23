import React from 'react';
import { MessageCircle, Brain, Target, BarChart3, Users, Award } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: MessageCircle,
      title: "Interactive Scenarios",
      description: "Practice real-world conversations with AI-powered scenarios that adapt to your skill level and learning pace.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Feedback",
      description: "Get instant, personalized feedback on your responses with detailed explanations and improvement suggestions.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Personalized Coaching",
      description: "AI coach that learns your patterns and provides targeted advice to help you overcome specific social challenges.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics, skill assessments, and milestone celebrations.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other learners, share experiences, and get support from peers on similar journeys.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Unlock badges, complete challenges, and celebrate your social skill milestones with gamified learning.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Master Social Skills
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with proven learning methods 
            to help you build confidence in any social situation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 border border-gray-700 hover:border-gray-600"
            >
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`relative w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect Line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-gray-800 rounded-full px-8 py-4 border border-gray-700">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">All features included in free plan</span>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
