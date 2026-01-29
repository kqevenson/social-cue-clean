import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      avatar: "SC",
      rating: 5,
      text: "SocialCue helped me overcome my anxiety about networking events. The interactive scenarios felt so real, and the AI feedback was incredibly helpful. I went from avoiding conversations to leading team meetings!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Manager",
      avatar: "MR",
      rating: 5,
      text: "As someone who struggled with public speaking, this platform was a game-changer. The personalized coaching helped me identify my specific challenges and gave me practical tools to improve. Now watching me present, you'd never know I used to panic!"
    },
    {
      name: "Emma Thompson",
      role: "College Student",
      avatar: "ET",
      rating: 5,
      text: "I was really shy and had trouble making friends in college. SocialCue's scenarios helped me practice conversations in a safe environment. The progress tracking kept me motivated, and now I'm much more confident in social situations."
    },
    {
      name: "David Kim",
      role: "Sales Professional",
      avatar: "DK",
      rating: 5,
      text: "The AI-powered feedback is incredible. It caught subtle things I was doing wrong that I never noticed. My sales conversations have improved dramatically, and I've built much better relationships with clients."
    },
    {
      name: "Lisa Johnson",
      role: "Teacher",
      avatar: "LJ",
      rating: 5,
      text: "I used to dread parent-teacher conferences because I felt awkward talking to parents. SocialCue helped me practice these conversations and gave me confidence. Now I actually look forward to meeting with parents!"
    },
    {
      name: "Alex Rivera",
      role: "Entrepreneur",
      avatar: "AR",
      rating: 5,
      text: "Starting a business requires so much networking and pitching. SocialCue helped me refine my communication skills and build confidence when talking to investors. The scenarios were so realistic and helpful."
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gray-800 rounded-full px-6 py-3 mb-8">
            <Quote className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Real Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Loved by Thousands of
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Social Learners
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how SocialCue has transformed the social confidence of people from all walks of life.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <Quote className="w-8 h-8 text-blue-400" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-300 leading-relaxed mb-6 text-lg">
                "{testimonial.text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">10,000+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">4.9/5</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">95%</div>
            <div className="text-gray-400">Report Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">50+</div>
            <div className="text-gray-400">Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
}
