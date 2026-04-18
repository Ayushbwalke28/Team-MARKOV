import { useState } from 'react';
import { Calendar, MapPin, Users, Globe, Filter, Search, ChevronRight, CheckCircle2, Star, Clock } from 'lucide-react';

type EventType = 'all' | 'technology' | 'leadership' | 'networking' | 'design';

const events = [
  { id: 1, title: 'AI & Machine Learning Summit 2026', type: 'technology', date: 'May 12, 2026', time: '9:00 AM - 5:00 PM PST', location: 'Moscone Center, San Francisco', attendees: 2400, mode: 'In-person', description: 'Join industry leaders exploring the latest breakthroughs in artificial intelligence, from LLMs to autonomous agents.', verified: true },
  { id: 2, title: 'Product Leadership Masterclass', type: 'leadership', date: 'May 18, 2026', time: '2:00 PM - 4:00 PM EST', location: 'Virtual Event', attendees: 850, mode: 'Virtual', description: 'A deep-dive workshop on building world-class product teams and shipping at scale.', verified: true },
  { id: 3, title: 'Web3 & Decentralized Finance Forum', type: 'technology', date: 'June 4, 2026', time: '10:00 AM - 6:00 PM GMT', location: 'ExCeL London', attendees: 1200, mode: 'In-person', description: 'Discussing the future of finance, identity, and the decentralized web with top protocol founders.', verified: true },
  { id: 4, title: 'Executive Networking Night', type: 'networking', date: 'June 12, 2026', time: '6:30 PM - 9:30 PM PST', location: 'The Ritz-Carlton, NYC', attendees: 150, mode: 'In-person', description: 'An exclusive evening for C-suite executives and founders to forge strategic partnerships.', verified: true },
  { id: 5, title: 'Design Systems Conference', type: 'design', date: 'June 25, 2026', time: '9:00 AM - 4:00 PM PST', location: 'Virtual Event', attendees: 3500, mode: 'Virtual', description: 'The premier global event for designers and engineers building cohesive digital products.', verified: false },
];

export default function Events() {
  const [activeTab, setActiveTab] = useState<EventType>('all');
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter(e => 
    (activeTab === 'all' || e.type === activeTab) && 
    (e.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A1628]">Events</h2>
          <p className="text-sm text-[#75777d] mt-1">Discover conferences, workshops, and networking opportunities.</p>
        </div>
        <button className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#101c2e] transition-colors shadow-sm">
          + Create Event
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" size={18} />
          <input 
            type="text" 
            placeholder="Search events by title, keyword, or speaker..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/30 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#f2f4f6] rounded-xl p-1">
          {(['Upcoming', 'Past Events', 'My Events']).map((t, i) => (
            <button key={t} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${i === 0 ? 'bg-white text-[#0A1628] shadow-sm' : 'text-[#75777d] hover:text-[#191c1e]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {([
          { key: 'all', label: 'All' },
          { key: 'technology', label: 'Technology' },
          { key: 'leadership', label: 'Leadership' },
          { key: 'networking', label: 'Networking' },
          { key: 'design', label: 'Design' },
        ] as { key: EventType; label: string }[]).map((t) => (
          <button 
            key={t.key} 
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-all shrink-0 ${
              activeTab === t.key 
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-[#2563EB]/20' 
                : 'bg-white text-[#45474c] border-[#e0e3e5] hover:border-[#2563EB]/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col md:flex-row">
            <div className={`md:w-1/3 bg-[#f7f9fb] flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#f2f4f6] relative`}>
              <div className="w-12 h-12 rounded-2xl bg-[#0A1628] flex items-center justify-center text-white mb-3 shadow-lg group-hover:bg-[#2563EB] transition-colors">
                <Calendar size={24} />
              </div>
              <p className="text-sm font-bold text-[#0A1628] text-center">{e.date}</p>
              <p className="text-[10px] text-[#75777d] mt-1 shrink-0">{e.mode}</p>
              <div className="absolute top-4 right-4 text-[#2563EB]">
                {e.verified && <CheckCircle2 size={16} fill="currentColor" className="fill-[#2563EB]/10" />}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  e.mode === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {e.mode === 'Virtual' ? 'Virtual' : 'In-Person'}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {e.type}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#0A1628] group-hover:text-[#2563EB] transition-colors line-clamp-1">{e.title}</h3>
              <p className="text-xs text-[#75777d] mt-2 line-clamp-2 leading-relaxed">{e.description}</p>
              
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-[#45474c] font-medium">
                  <MapPin size={12} className="text-[#c5c6cd]" /> {e.location}
                </div>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#f2f4f6]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-[#45474c] font-bold">
                      <Users size={12} className="text-[#c5c6cd]" /> {e.attendees.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#45474c] font-bold">
                      <Clock size={12} className="text-[#c5c6cd]" /> {e.time.split(' ')[0]}
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Register Now <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
