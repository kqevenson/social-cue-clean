import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, MessageCircle, Brain, Users, Sparkles, Check, Star } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, #4A90E2 0%, transparent 50%), radial-gradient(circle at 20% 80%, #34D399 0%, transparent 50%)`,
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-end justify-center mb-8" style={{letterSpacing: '-2px'}}>
            <span className="font-extrabold text-5xl text-white">Social</span>
            <span className="font-extrabold text-5xl text-white" style={{marginRight: '6px'}}>C</span>
            <div className="flex flex-col items-center justify-end" style={{marginBottom: '7px', height: '62px', gap: '10px'}}>
              <div className="flex smile-eyes" style={{gap: '16px'}}>
                <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
                <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
              </div>
              <div className="smile-mouth" style={{
                width: '35px',
                height: '22px',
                borderLeft: '5px solid #34D399',
                borderRight: '5px solid #34D399',
                borderBottom: '5px solid #34D399',
                borderTop: 'none',
                borderRadius: '0 0 17px 17px'
              }}></div>
            </div>
            <span className="font-extrabold text-5xl text-white" style={{marginLeft: '6px'}}>e</span>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Real-time coaching for real-world connection
          </p>
          <div className="flex justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold px-8 py-4 rounded-full flex items-center gap-3 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-6 h-6" />
              Start Connecting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Social Coach</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Guidance</h3>
              <p className="text-gray-400">
                Get instant conversation prompts and tips during live interactions. Never feel stuck or awkward again.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Learning</h3>
              <p className="text-gray-400">
                AI analyzes your conversation patterns and helps you improve over time with personalized insights.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Build Confidence</h3>
              <p className="text-gray-400">
                Practice in safe scenarios and track your progress as you become more comfortable in social situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Simple. Powerful. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Effective.</span>
          </h2>
          
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold">1</div>
                  <h3 className="text-3xl font-bold">Set Your Goals</h3>
                </div>
                <p className="text-gray-400 text-lg">
                  Automatic translation of text to speech in the app. Toggle on/off in settings.
                </p>
              </div>
              <div className="flex-1 h-64 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30"></div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl font-bold">2</div>
                  <h3 className="text-3xl font-bold">Practice & Learn</h3>
                </div>
                <p className="text-gray-400 text-lg">
                  Engage with realistic scenarios and get immediate feedback. Build your skills in a safe, pressure-free environment.
                </p>
              </div>
              <div className="flex-1 h-64 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xl font-bold">3</div>
                  <h3 className="text-3xl font-bold">Track Progress</h3>
                </div>
                <p className="text-gray-400 text-lg">
                  Watch your confidence grow with detailed analytics and personalized insights. Celebrate your wins along the way.
                </p>
              </div>
              <div className="flex-1 h-64 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Start Your Journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Today</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">Choose the plan that works best for you</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">5 practice sessions per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Basic feedback</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Progress tracking</span>
                </li>
              </ul>
              <button onClick={handleGetStarted} className="w-full py-3 rounded-full border border-white/20 hover:bg-white/5 transition">
                Get Started
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border-2 border-emerald-500/50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-emerald-400 px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Unlimited practice sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Smart insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Personalized scenarios</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <button onClick={handleGetStarted} className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition">
                Start Free Trial
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <h3 className="text-2xl font-bold mb-2">Family</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$39</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Up to 5 family members</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Parent dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Family progress reports</span>
                </li>
              </ul>
              <button onClick={handleGetStarted} className="w-full py-3 rounded-full border border-white/20 hover:bg-white/5 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Real Results.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "I used to dread networking events. Now I actually look forward to them! SocialCue has completely transformed how I approach conversations."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500"></div>
                <div>
                  <p className="font-bold">Sarah M.</p>
                  <p className="text-sm text-gray-400">Marketing Professional</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "As someone with social anxiety, this app has been a game-changer. The real-time support gives me the confidence I need to engage."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div>
                  <p className="font-bold">James T.</p>
                  <p className="text-sm text-gray-400">Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Level Up Your Social Skills?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of people building genuine connections with confidence.
          </p>
          <button 
            onClick={handleGetStarted}
            className="group bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold px-12 py-5 rounded-full flex items-center gap-3 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 mx-auto"
          >
            <Play className="w-6 h-6" fill="white" />
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Features</li>
                <li className="hover:text-white cursor-pointer transition">Pricing</li>
                <li className="hover:text-white cursor-pointer transition">How It Works</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">About</li>
                <li className="hover:text-white cursor-pointer transition">Blog</li>
                <li className="hover:text-white cursor-pointer transition">Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Help Center</li>
                <li className="hover:text-white cursor-pointer transition">Community</li>
                <li className="hover:text-white cursor-pointer transition">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition">Privacy</li>
                <li className="hover:text-white cursor-pointer transition">Terms</li>
                <li className="hover:text-white cursor-pointer transition">Security</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-400 pt-8 border-t border-white/10">
            <p>&copy; 2025 SocialCue. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes smileWiggle {
          0%, 100% { 
            transform: translateY(0) scaleY(1);
          }
          50% { 
            transform: translateY(-2px) scaleY(1.1);
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
          animation: smileWiggle 3s ease-in-out infinite;
          transform-origin: top center;
        }
        
        .smile-eyes > div {
          animation: eyeBlink 6s ease-in-out infinite;
        }
        
        .smile-eyes > div:nth-child(2) {
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  );
}