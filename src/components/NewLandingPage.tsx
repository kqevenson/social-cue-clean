import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, MessageCircle, Brain, Users, Sparkles, Check, Star, Zap, Target, Shield, Award, Clock, Globe, Heart } from 'lucide-react';

function NewLandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 80%, #4A90E2 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, #34D399 0%, transparent 50%),
                       radial-gradient(circle at 40% 40%, #8B5CF6 0%, transparent 50%)`,
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-end" style={{letterSpacing: '-1px'}}>
            <span className="font-extrabold text-2xl text-white">Social</span>
            <span className="font-extrabold text-2xl text-white">C</span>
            <div className="flex flex-col items-center justify-end" style={{marginBottom: '3px', height: '24px', gap: '4px'}}>
              <div className="flex" style={{gap: '6px'}}>
                <div className="rounded-full" style={{width: '3px', height: '3px', background: '#4A90E2'}}></div>
                <div className="rounded-full" style={{width: '3px', height: '3px', background: '#4A90E2'}}></div>
              </div>
              <div style={{
                width: '12px',
                height: '6px',
                borderLeft: '2px solid #34D399',
                borderRight: '2px solid #34D399',
                borderBottom: '2px solid #34D399',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px'
              }}></div>
            </div>
            <span className="font-extrabold text-2xl text-white">e</span>
          </div>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-semibold px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto text-center">
          {/* Animated Hero Wordmark */}
          <div className={`flex items-end justify-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{letterSpacing: '-3px'}}>
            <span className="font-extrabold text-8xl md:text-9xl text-white">Social</span>
            <span className="font-extrabold text-8xl md:text-9xl text-white" style={{marginRight: '8px'}}>C</span>
            <div className="flex flex-col items-center justify-end" style={{marginBottom: '10px', height: '120px', gap: '20px'}}>
              <div className="flex smile-eyes" style={{gap: '32px'}}>
                <div className="rounded-full" style={{width: '14px', height: '14px', background: '#4A90E2'}}></div>
                <div className="rounded-full" style={{width: '14px', height: '14px', background: '#4A90E2'}}></div>
              </div>
              <div className="smile-mouth" style={{
                width: '60px',
                height: '34px',
                borderLeft: '8px solid #34D399',
                borderRight: '8px solid #34D399',
                borderBottom: '8px solid #34D399',
                borderTop: 'none',
                borderRadius: '0 0 30px 30px'
              }}></div>
            </div>
            <span className="font-extrabold text-8xl md:text-9xl text-white" style={{marginLeft: '8px'}}>e</span>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 max-w-5xl mx-auto leading-tight">
              Master Social Situations with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                Real-Time AI Coaching
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
              Build confidence, read social cues, and connect authentically—guided by AI that understands you.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button 
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold px-16 py-6 rounded-full flex items-center gap-4 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-xl"
              >
                <Play className="w-7 h-7" fill="white" />
                Start Connecting
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group border-2 border-white/20 text-white font-semibold px-16 py-6 rounded-full flex items-center gap-4 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-xl">
                <Play className="w-7 h-7" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SocialCue</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of social skills development with AI-powered guidance that adapts to your unique learning style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-10 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Real-Time Guidance</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Get instant, personalized feedback as you practice. Our AI analyzes your responses and provides actionable insights in real-time.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Smart Learning</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                AI that adapts to your grade level, learning pace, and social goals. Every scenario is tailored to help you succeed.
              </p>
            </div>

            <div className="group p-10 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6">Build Confidence</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Track your progress, celebrate achievements, and watch your social confidence grow with every practice session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple, effective, and designed for real-world success. Here's how you'll transform your social skills.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Choose Your Scenario</h3>
              <p className="text-gray-300">Select from hundreds of realistic social situations tailored to your grade level and goals.</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Practice & Respond</h3>
              <p className="text-gray-300">Engage with interactive scenarios and respond naturally. No pressure, just practice.</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Get AI Feedback</h3>
              <p className="text-gray-300">Receive instant, personalized coaching on your responses with actionable tips for improvement.</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Track Progress</h3>
              <p className="text-gray-300">Watch your confidence grow with detailed analytics and celebrate your achievements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Real People. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Real Results.</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of students and professionals who've transformed their social confidence with SocialCue.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-blue-500/30 transition-all">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                "I used to dread group projects. Now I actually look forward to them! SocialCue has completely transformed how I approach conversations."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500"></div>
                <div>
                  <p className="font-bold text-xl">Sarah M.</p>
                  <p className="text-gray-400">8th Grade Student</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-emerald-500/30 transition-all">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                "As someone with social anxiety, this app has been a game-changer. The real-time support gives me the confidence I need to engage."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div>
                  <p className="font-bold text-xl">James T.</p>
                  <p className="text-gray-400">High School Senior</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                "The AI feedback is incredible. It's like having a personal coach available 24/7. My social skills have improved dramatically."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500"></div>
                <div>
                  <p className="font-bold text-xl">Maria L.</p>
                  <p className="text-gray-400">College Freshman</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that works for you. Start free, upgrade when you're ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Free Trial</h3>
                <div className="text-4xl font-bold mb-2">$0</div>
                <p className="text-gray-400">7 days free</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>3 practice scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Basic AI feedback</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Progress tracking</span>
                </li>
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 rounded-full hover:shadow-lg transition-all duration-300"
              >
                Start Free Trial
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-2 border-blue-500/50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-2 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Premium</h3>
                <div className="text-4xl font-bold mb-2">$9.99</div>
                <p className="text-gray-400">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Unlimited scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Advanced AI coaching</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Detailed analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 rounded-full hover:shadow-lg transition-all duration-300"
              >
                Get Premium
              </button>
            </div>

            {/* Family Plan */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Family</h3>
                <div className="text-4xl font-bold mb-2">$19.99</div>
                <p className="text-gray-400">per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Up to 5 accounts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Family progress tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Parental controls</span>
                </li>
              </ul>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 rounded-full hover:shadow-lg transition-all duration-300"
              >
                Choose Family
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold mb-8">
            Ready to Transform Your Social Skills?
          </h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto">
            Join thousands of people building genuine connections with confidence. Start your journey today.
          </p>
          <button 
            onClick={handleGetStarted}
            className="group bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold px-20 py-8 rounded-full flex items-center gap-4 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 mx-auto text-2xl"
          >
            <Play className="w-8 h-8" fill="white" />
            Start Your Free Trial
            <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-gray-400 mt-8 text-lg">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-end mb-6" style={{letterSpacing: '-1px'}}>
                <span className="font-extrabold text-3xl text-white">Social</span>
                <span className="font-extrabold text-3xl text-white">C</span>
                <div className="flex flex-col items-center justify-end" style={{marginBottom: '3px', height: '24px', gap: '4px'}}>
                  <div className="flex" style={{gap: '6px'}}>
                    <div className="rounded-full" style={{width: '3px', height: '3px', background: '#4A90E2'}}></div>
                    <div className="rounded-full" style={{width: '3px', height: '3px', background: '#4A90E2'}}></div>
                  </div>
                  <div style={{
                    width: '12px',
                    height: '6px',
                    borderLeft: '2px solid #34D399',
                    borderRight: '2px solid #34D399',
                    borderBottom: '2px solid #34D399',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px'
                  }}></div>
                </div>
                <span className="font-extrabold text-3xl text-white">e</span>
              </div>
              <p className="text-gray-400 text-lg max-w-md">
                Transform your social skills with AI-powered coaching. Build confidence, read cues, and connect authentically.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Features</li>
                <li className="hover:text-white cursor-pointer transition">Pricing</li>
                <li className="hover:text-white cursor-pointer transition">How It Works</li>
                <li className="hover:text-white cursor-pointer transition">Demo</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Help Center</li>
                <li className="hover:text-white cursor-pointer transition">Community</li>
                <li className="hover:text-white cursor-pointer transition">Contact</li>
                <li className="hover:text-white cursor-pointer transition">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-xl mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Privacy</li>
                <li className="hover:text-white cursor-pointer transition">Terms</li>
                <li className="hover:text-white cursor-pointer transition">Security</li>
                <li className="hover:text-white cursor-pointer transition">Cookies</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-gray-400 pt-8 border-t border-white/10">
            <p>&copy; 2025 SocialCue. All rights reserved. Made with ❤️ for social connection.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes smileWiggle {
          0%, 100% { 
            transform: translateY(0) scaleY(1);
          }
          50% { 
            transform: translateY(-3px) scaleY(1.15);
          }
        }
        
        @keyframes eyeBlink {
          0%, 90%, 100% { 
            transform: scaleY(1);
          }
          95% { 
            transform: scaleY(0.1);
          }
        }
        
        .smile-mouth {
          animation: smileWiggle 4s ease-in-out infinite;
          transform-origin: top center;
        }
        
        .smile-eyes > div {
          animation: eyeBlink 8s ease-in-out infinite;
        }
        
        .smile-eyes > div:nth-child(2) {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}

export default NewLandingPage;
