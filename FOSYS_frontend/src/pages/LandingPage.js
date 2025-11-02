import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle, GitPullRequest, Shield, Zap, Clock, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.jpg" alt="FOSYS" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-bold text-white" style={{fontFamily: 'Work Sans'}}>FOSYS</span>
          </div>
          <Button 
            onClick={() => navigate('/login')} 
            data-testid="header-signin-btn"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 animate-fadeIn">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight max-w-5xl" style={{fontFamily: 'Work Sans'}}>
              AI-Powered Workspace
              <span className="block bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">Management Platform</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-3xl">
              Streamline your workflow with intelligent scrum transcription, automated task management, and seamless PR validation
            </p>
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={() => navigate('/signup')} 
                data-testid="hero-get-started-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 rounded-full text-lg font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6 text-center" style={{fontFamily: 'Work Sans'}}>
            What is FOSYS?
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed text-center">
            AI Workspace — also known as FOSYS — is a next-generation AI-powered project management tool designed to simplify organizational workflows. It automates SCRUM transcription, extracts action items, validates PRs in real time, and updates dashboards instantly — reducing manual effort while improving accountability and collaboration.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{fontFamily: 'Work Sans'}}>
            Core Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 hover-lift">
              <Bot className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3" style={{fontFamily: 'Work Sans'}}>Smart Scrum Transcription</h3>
              <p className="text-slate-400">Automatically transcribe meetings and extract action items for instant task creation.</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 hover-lift">
              <GitPullRequest className="w-12 h-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3" style={{fontFamily: 'Work Sans'}}>Real-Time PR Validation</h3>
              <p className="text-slate-400">Live peer review tracking via WebSockets for faster, transparent development.</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 hover:border-blue-500/50 hover-lift">
              <Shield className="w-12 h-12 text-violet-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3" style={{fontFamily: 'Work Sans'}}>Role-Based Dashboards</h3>
              <p className="text-slate-400">Personalized dashboards for interns, employees, managers, and admins — with secure access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose FOSYS */}
<section className="py-20 px-6 bg-slate-900/50">
  <div className="max-w-6xl mx-auto">
    <h2
      className="text-4xl font-bold text-white mb-12 text-center"
      style={{ fontFamily: 'Work Sans' }}
    >
      Why Choose FOSYS?
    </h2>
    <div className="grid md:grid-cols-2 gap-6">
      {[
        {
          title: "Automated Workflow",
          desc: "Eliminate manual task assignment with AI-driven meeting analysis.",
        },
        {
          title: "Enhanced Collaboration",
          desc: "Real-time updates keep your entire team synchronized.",
        },
        {
          title: "Complete Transparency",
          desc: "Track progress with comprehensive dashboards and live insights.",
        },
        {
          title: "Seamless Integration",
          desc: "Direct GitHub integration for effortless code validation and reviews.",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 transition-all duration-300 ease-in-out hover:translate-y-[-4px] hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-400/40"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            {item.title}
          </h3>
          <p className="text-slate-300">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{fontFamily: 'Work Sans'}}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white" style={{fontFamily: 'Work Sans'}}>Capture Meetings</h3>
              <p className="text-slate-400 text-sm">AI transcribes & identifies action items</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white" style={{fontFamily: 'Work Sans'}}>Auto-Assign Tasks</h3>
              <p className="text-slate-400 text-sm">Tasks mapped to responsible employees</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white" style={{fontFamily: 'Work Sans'}}>Validate PRs</h3>
              <p className="text-slate-400 text-sm">GitHub events update dashboard in real time</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white" style={{fontFamily: 'Work Sans'}}>Track & Optimize</h3>
              <p className="text-slate-400 text-sm">Role-based dashboards show team-wide progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{fontFamily: 'Work Sans'}}>
            Impact & Expected Outcomes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 p-8 rounded-xl border border-blue-500/30 text-center">
              <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">40%</h3>
              <p className="text-slate-300">Faster Delivery</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 p-8 rounded-xl border border-emerald-500/30 text-center">
              <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">60%</h3>
              <p className="text-slate-300">Reduction in Manual Effort</p>
            </div>
            <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 p-8 rounded-xl border border-violet-500/30 text-center">
              <Target className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-2">100%</h3>
              <p className="text-slate-300">Transparency Across Teams</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4" style={{fontFamily: 'Work Sans'}}>Privacy Policy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                At FOSYS, we value your privacy. Our platform processes only the data necessary to enhance workflow efficiency — such as meeting transcripts, assigned tasks, and project-related PR information. We do not collect personal information unrelated to work tasks. Meeting data and PR events are used solely for internal project management. User roles and access levels are securely managed using Role-Based Access Control (RBAC). All communication between users and servers is encrypted to maintain data confidentiality. By using AI Workspace, users agree to the responsible use of data strictly for productivity and project tracking purposes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4" style={{fontFamily: 'Work Sans'}}>Contact Us</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                We'd love to hear from you! For feedback, collaboration, or inquiries related to FOSYS, reach out to us below:
              </p>
              <p className="text-blue-400">Email: fosys@gmail.com</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-800">
            <p className="text-slate-500 text-sm mb-2">AI Workspace © 2025</p>
            <p className="text-slate-600 text-xs">Inspired by the intelligence of AI and the precision of engineering.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;