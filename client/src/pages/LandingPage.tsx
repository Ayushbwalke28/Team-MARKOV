import { Link } from 'react-router-dom';
import { Shield, Users, Briefcase, Calendar, TrendingUp, Bot, CheckCircle2, Building2, ArrowRight, Star, Quote } from 'lucide-react';

const features = [
  { icon: Users, title: 'Professional Networking', desc: 'Build meaningful relationships with verified peers across industries.' },
  { icon: Briefcase, title: 'Job Market', desc: 'Access exclusive roles from verified companies.' },
  { icon: TrendingUp, title: 'Business Opportunities', desc: 'Discover partnerships and B2B collaborations.' },
  { icon: Calendar, title: 'Events', desc: 'Attend curated industry events, webinars, and exclusive meetups.' },
  { icon: Shield, title: 'Investments', desc: 'Connect with active investors and verified founders.' },
  { icon: Bot, title: 'AI Assistant', desc: 'Leverage intelligent insights to optimize your professional strategy.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'VP Engineering', quote: 'The verified network has completely transformed how I source talent. I know every profile I interact with is genuine, saving hours of vetting.' },
  { name: 'Rahul Mehta', role: 'Startup Founder', quote: 'Finding serious co-founders was impossible on other platforms. Here, the signal-to-noise ratio is incredibly high. Highly recommended for founders.' },
  { name: 'Sarah Jenkins', role: 'Angel Investor', quote: 'As an investor, the company verification badges give me immediate confidence to initiate discussions. It\'s the most efficient deal-flow platform I use.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e]">
      {/* Navbar */}
      <nav className="bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-10 h-10" />
            <span className="text-xl font-bold tracking-tight">Worksphere</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#verification" className="hover:text-white transition-colors">Verification</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</Link>
            <Link to="/login" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:shadow-[#2563EB]/30">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0A1628] text-white pb-24 pt-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-[#2563EB] rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F59E0B] rounded-full blur-[160px]" />
        </div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={16} className="text-[#F59E0B]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">Verified Humans Only</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.1] mb-6">
              The Trusted <br/>Professional <span className="text-[#2563EB]">Ecosystem</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
              Connect, grow, hire, invest, and collaborate — verified humans only.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-xl shadow-[#2563EB]/30 hover:shadow-2xl flex items-center gap-2">
                Join the Ecosystem <ArrowRight size={18} />
              </Link>
              <a href="#features" className="px-6 py-4 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/20 hover:border-white/40 transition-all">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">Ecosystem Features</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1628] mb-4">A unified platform designed for <br/>serious professional growth.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-xl p-8 border border-[#e0e3e5] hover:shadow-lg hover:shadow-[#0A1628]/5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[#0A1628] flex items-center justify-center mb-5 group-hover:bg-[#2563EB] transition-colors">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#0A1628]">{f.title}</h3>
                <p className="text-sm text-[#45474c] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verification Section */}
      <section id="verification" className="bg-[#0A1628] text-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] mb-3 block">Trust & Safety</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Why Verification Matters</h2>
            <p className="text-white/50 max-w-2xl mx-auto">We believe trust is the foundation of professional growth. By ensuring every member is a verified human or legitimate company, we eliminate noise, spam, and fraud.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center mb-5">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Human Verification</h3>
              <p className="text-white/50 text-sm leading-relaxed">Every individual undergoes strict identity verification to ensure authenticity and accountability.</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B] flex items-center justify-center mb-5">
                <Building2 size={24} className="text-[#0A1628]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Company Verification</h3>
              <p className="text-white/50 text-sm leading-relaxed">Organizations are vetted to ensure legitimacy and active standing in their respective industries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">The Ledger Speaks</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0A1628]">Trusted by professionals worldwide.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-8 border border-[#e0e3e5] relative">
              <Quote size={32} className="text-[#2563EB]/10 absolute top-6 right-6" />
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[#F59E0B] fill-[#F59E0B]" />)}
              </div>
              <p className="text-sm text-[#45474c] leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#e0e3e5]">
                <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs">
                  {t.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A1628]">{t.name}</p>
                  <p className="text-xs text-[#75777d]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1628] text-white/50 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-8 h-8" />
            <span className="text-white font-bold">Worksphere</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">© 2026 Worksphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
