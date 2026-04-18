import { useState, useEffect } from 'react';
import { Handshake, DollarSign, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import api from '../lib/api';

type Tab = 'internships' | 'freelance' | 'all';

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState<Tab>('internships');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/opportunities');
      const opsData = res.data.filter((o: any) => o.type !== 'job').map((o: any) => ({
        id: o.id,
        title: o.postName,
        company: o.company?.name || 'Unknown',
        type: o.type,
        mode: o.mode.charAt(0).toUpperCase() + o.mode.slice(1),
        budget: o.payment || 'Negotiable',
        desc: o.description || '',
        verified: o.company?.owner?.verified || false
      }));
      setOpportunities(opsData);
    } catch (err) {
      console.error('Failed to fetch opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = opportunities.filter(o => activeTab === 'all' || o.type === activeTab);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-black text-[#0A1628]">Business Opportunities</h2>
        <p className="text-sm text-[#75777d] mt-1">Discover partnerships, investments, and B2B collaborations.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-xl p-1 w-fit">
        {([
          { key: 'internships', label: 'Internships', icon: Handshake },
          { key: 'freelance', label: 'Freelance', icon: DollarSign },
          { key: 'all', label: 'All Opportunities', icon: Globe },
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

      <div className="flex flex-col gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2563EB] transition-colors">{p.title}</h3>
                  {p.verified && <CheckCircle2 size={14} className="text-[#2563EB]" />}
                </div>
                <div className="flex items-center gap-3 mb-3 text-xs text-[#75777d]">
                  <span className="flex items-center gap-1"><Globe size={12} /> {p.company}</span>
                  <span className="bg-[#f2f4f6] px-2 py-0.5 rounded text-[10px] font-semibold">{p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span>
                  <span className="bg-[#f2f4f6] px-2 py-0.5 rounded text-[10px] font-semibold">{p.mode}</span>
                </div>
                <p className="text-sm text-[#45474c] leading-relaxed">{p.desc}</p>
              </div>
              <div className="text-right shrink-0 ml-6">
                <p className="text-xs text-[#75777d]">Compensation</p>
                <p className="text-sm font-black text-[#0A1628]">{p.budget}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f2f4f6]">
              <button className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline">View Details <ArrowRight size={12} /></button>
              <button className="bg-[#0A1628] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#101c2e] transition-colors">Apply Now</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500 text-sm">No opportunities found for this category.</div>
        )}
      </div>
    </div>
  );
}
