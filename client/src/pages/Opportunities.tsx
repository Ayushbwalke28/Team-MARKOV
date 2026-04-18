import { useState } from 'react';
import { Handshake, TrendingUp, DollarSign, Users, ArrowRight, Star, CheckCircle2, Globe, Filter } from 'lucide-react';

type Tab = 'partnerships' | 'investments' | 'marketplace';

const partnerships = [
  { id: 1, company: 'Vertex AI Labs', type: 'Technology Integration', desc: 'Looking for enterprise partners to integrate our AI inference API into existing workflows. Revenue share model available.', budget: '$50k - $200k', industry: 'AI/ML', verified: true },
  { id: 2, company: 'GreenScale Energy', type: 'Distribution Partnership', desc: 'Seeking channel partners in APAC region for our clean energy monitoring platform. Exclusive territory rights.', budget: '$100k - $500k', industry: 'Clean Energy', verified: true },
  { id: 3, company: 'NovaPay Financial', type: 'White-Label Solution', desc: 'Offering our payment gateway as a white-label solution for fintech startups. Full API access and custom branding.', budget: '$25k - $75k', industry: 'Fintech', verified: true },
];

const investments = [
  { id: 1, company: 'AeroSync Robotics', stage: 'Series A', seeking: '$8M', raised: '$2.5M (Seed)', desc: 'Autonomous drone fleet management for agricultural monitoring. 3x revenue growth YoY.', founder: 'Alex Novak', verified: true },
  { id: 2, company: 'MedLens Health', stage: 'Pre-Seed', seeking: '$1.5M', raised: 'Bootstrapped', desc: 'AI-powered medical imaging analysis for early cancer detection. FDA breakthrough designation pending.', founder: 'Dr. Maya Shah', verified: true },
  { id: 3, company: 'LogiTrack Systems', stage: 'Series B', seeking: '$25M', raised: '$12M (Series A)', desc: 'Real-time supply chain optimization platform. 200+ enterprise customers. $8M ARR.', founder: 'Chris Wang', verified: true },
];

const marketplace = [
  { id: 1, title: 'Enterprise SaaS Consulting', provider: 'Priya Sharma', price: '$5,000/project', rating: 4.9, reviews: 47 },
  { id: 2, title: 'Technical Architecture Review', provider: 'David Kim', price: '$3,500/project', rating: 5.0, reviews: 23 },
  { id: 3, title: 'GTM Strategy Development', provider: 'Marcus Rivera', price: '$7,500/engagement', rating: 4.8, reviews: 31 },
  { id: 4, title: 'Brand Identity & Design System', provider: 'Lena Kowalski', price: '$8,000/project', rating: 4.9, reviews: 56 },
];

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState<Tab>('partnerships');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-black text-[#0A1628]">Business Opportunities</h2>
        <p className="text-sm text-[#75777d] mt-1">Discover partnerships, investments, and B2B collaborations.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-xl p-1 w-fit">
        {([
          { key: 'partnerships', label: 'Partnerships', icon: Handshake },
          { key: 'investments', label: 'Investments', icon: TrendingUp },
          { key: 'marketplace', label: 'Marketplace', icon: DollarSign },
        ] as { key: Tab; label: string; icon: React.ComponentType<{size?: number}> }[]).map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === t.key ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#75777d] hover:text-[#191c1e]'
              }`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'partnerships' && (
        <div className="flex flex-col gap-4">
          {partnerships.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2563EB] transition-colors">{p.type}</h3>
                    {p.verified && <CheckCircle2 size={14} className="text-[#2563EB]" />}
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-xs text-[#75777d]">
                    <span className="flex items-center gap-1"><Globe size={12} /> {p.company}</span>
                    <span className="bg-[#f2f4f6] px-2 py-0.5 rounded text-[10px] font-semibold">{p.industry}</span>
                  </div>
                  <p className="text-sm text-[#45474c] leading-relaxed">{p.desc}</p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-xs text-[#75777d]">Budget</p>
                  <p className="text-sm font-black text-[#0A1628]">{p.budget}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f2f4f6]">
                <button className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline">View Details <ArrowRight size={12} /></button>
                <button className="bg-[#0A1628] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#101c2e] transition-colors">Express Interest</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="flex flex-col gap-4">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2563EB] transition-colors">{inv.company}</h3>
                    {inv.verified && <CheckCircle2 size={14} className="text-[#2563EB]" />}
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded-full">{inv.stage}</span>
                  </div>
                  <p className="text-xs text-[#75777d] mb-3 flex items-center gap-1"><Users size={12} /> Founded by {inv.founder}</p>
                  <p className="text-sm text-[#45474c] leading-relaxed">{inv.desc}</p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="text-xs text-[#75777d]">Seeking</p>
                  <p className="text-lg font-black text-[#2563EB]">{inv.seeking}</p>
                  <p className="text-[10px] text-[#c5c6cd] mt-1">Raised: {inv.raised}</p>
                </div>
              </div>
              <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#f2f4f6] gap-3">
                <button className="text-xs font-bold text-[#75777d] hover:text-[#191c1e] transition-colors">View Pitch Deck</button>
                <button className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1d4ed8] transition-colors">Schedule Meeting</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {marketplace.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-all cursor-pointer group">
              <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2563EB] transition-colors">{s.title}</h3>
              <p className="text-xs text-[#75777d] mt-1">by {s.provider}</p>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#f2f4f6]">
                <span className="text-lg font-black text-[#0A1628]">{s.price}</span>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{s.rating}</span>
                  <span className="text-xs text-[#c5c6cd] ml-1">({s.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
