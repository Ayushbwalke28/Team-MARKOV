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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-10 h-10" />
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900 md:text-lg">Worksphere</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Verified Professional Network</p>
            </div>
          </div>
          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">Capabilities</a>
            <a href="#verification" className="transition-colors hover:text-slate-900">Verification</a>
            <a href="#testimonials" className="transition-colors hover:text-slate-900">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900">Sign In</Link>
            <Link to="/login" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800">
              Request Access
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pb-24 pt-18 text-white md:pb-28">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute -left-10 top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-[130px]" />
        <div className="absolute bottom-5 right-10 h-80 w-80 rounded-full bg-blue-500/20 blur-[140px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 md:grid-cols-[1.25fr_0.75fr] md:px-8">
          <div className="reveal-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              <Shield size={14} />
              Verified Humans And Companies
            </div>
            <h1 className="font-display text-4xl leading-[1.1] text-white md:text-6xl">
              Professional networking with institutional-grade trust.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              Worksphere helps founders, operators, investors, and hiring teams build high-value relationships in a network where identity and credibility are actively verified.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400">
                Join Worksphere <ArrowRight size={16} />
              </Link>
              <a href="#features" className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10">
                Explore Platform
              </a>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">50k+</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">Verified Members</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">3.2k</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">Verified Companies</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">96%</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-300">Trust Score</p>
              </div>
            </div>
          </div>

          <aside className="reveal-up elevated-surface self-end rounded-2xl p-6 text-slate-900 md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Platform Advantage</p>
            <h2 className="mt-3 font-display text-2xl leading-tight text-slate-900">A curated ecosystem for serious outcomes.</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                <span>Identity and company checks reduce spam, fake profiles, and low-quality outreach.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                <span>Intent-driven spaces for hiring, partnership building, investment discovery, and events.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                <span>Actionable AI support to sharpen outreach, opportunity filtering, and decision quality.</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-20 md:px-8 md:py-24">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Core Capabilities</span>
          <h2 className="font-display text-3xl leading-tight text-slate-900 md:text-5xl">Everything needed for high-trust professional growth.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            A single workspace to manage relationships, opportunities, hiring, events, and strategic collaboration.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="elevated-surface group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-blue-700">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold tracking-[0.2em] text-slate-400">0{idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="verification" className="bg-slate-900 py-20 text-white md:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-start md:px-8">
          <div>
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Trust Framework</span>
            <h2 className="font-display text-3xl leading-tight md:text-4xl">Verification is built into every professional interaction.</h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              Trust should not be optional in professional networking. Worksphere enforces clear verification pathways for individuals and organizations to keep the ecosystem credible and outcome-focused.
            </p>
            <div className="mt-8 space-y-4 border-l border-white/20 pl-5">
              <p className="text-sm text-slate-300">Identity checks for every individual account</p>
              <p className="text-sm text-slate-300">Documentation-based company validation</p>
              <p className="text-sm text-slate-300">Visible badges and transparent verification status</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold">Human Verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Every individual undergoes identity checks to ensure authenticity, accountability, and safer collaboration.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400">
                <Building2 size={24} className="text-slate-900" />
              </div>
              <h3 className="text-xl font-bold">Company Verification</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Organizations are vetted for legal legitimacy and operational credibility before profile activation.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto w-full max-w-7xl px-6 py-20 md:px-8 md:py-24">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Client Voice</span>
          <h2 className="font-display text-3xl leading-tight text-slate-900 md:text-5xl">Trusted by professionals across sectors.</h2>
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="elevated-surface relative rounded-2xl p-7">
              <Quote size={30} className="absolute right-6 top-6 text-blue-900/10" />
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-amber-500 text-amber-500" />)}
              </div>
              <p className="mb-6 text-sm italic leading-relaxed text-slate-600">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {t.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-16 w-full max-w-7xl px-6 md:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Start Now</p>
          <h3 className="mt-3 font-display text-3xl leading-tight md:text-4xl">Build credible professional momentum.</h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">Join a network where every profile carries proof, every opportunity carries intent, and every introduction has context.</p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300">
            Create Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Worksphere" className="brand-logo w-8 h-8" />
            <span className="font-bold text-slate-900">Worksphere</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="transition-colors hover:text-slate-900">About</a>
            <a href="#" className="transition-colors hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-slate-900">Terms</a>
            <a href="#" className="transition-colors hover:text-slate-900">Contact</a>
          </div>
          <p className="text-xs text-slate-500">© 2026 Worksphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
