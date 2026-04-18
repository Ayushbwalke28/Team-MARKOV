import { useState, useEffect } from 'react';
import { Search, MapPin, Clock, DollarSign, Building2, Bookmark, ChevronDown, Briefcase, CheckCircle2, Filter } from 'lucide-react';
import api from '../lib/api';

export default function Jobs() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/opportunities');
      const jobsData = res.data.filter((o: any) => o.type === 'job').map((o: any) => ({
        id: o.id,
        title: o.postName,
        company: o.company?.name || 'Unknown',
        location: o.mode.charAt(0).toUpperCase() + o.mode.slice(1),
        type: o.type.charAt(0).toUpperCase() + o.type.slice(1),
        salary: o.payment || 'Not specified',
        posted: new Date(o.createdAt).toLocaleDateString(),
        applicants: 0,
        tags: [o.mode],
        verified: o.company?.owner?.verified || false,
        description: o.description || ''
      }));
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const toggleSave = (id: string) => {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A1628]">Job Market</h2>
          <p className="text-sm text-[#75777d] mt-1">Access exclusive roles from verified companies.</p>
        </div>
        <button className="bg-[#0A1628] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#101c2e] transition-colors shadow-sm">
          + Post a Job
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75777d]" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search job titles, companies, or skills..."
            className="w-full bg-white border border-[#e0e3e5] text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/30 transition-all" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {['Location', 'Job Type', 'Salary Range', 'Experience Level'].map(f => (
            <button key={f} className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-[#e0e3e5] text-xs font-medium text-[#45474c] hover:border-[#2563EB]/30 transition-all">
              {f} <ChevronDown size={12} />
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-lg text-xs font-bold"><Filter size={12} /> All Filters</button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f2f4f6] flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-[#45474c]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#191c1e] group-hover:text-[#2563EB] transition-colors">{job.title}</h3>
                    {job.verified && <CheckCircle2 size={14} className="text-[#2563EB] fill-[#2563EB]/10" />}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-[#75777d]">
                    <span className="flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {job.posted}</span>
                  </div>
                  <p className="text-sm text-[#45474c] mt-3 leading-relaxed">{job.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {job.tags.map((t: string) => <span key={t} className="text-[10px] font-semibold text-[#2563EB] bg-[#2563EB]/8 px-2.5 py-1 rounded-full">{t}</span>)}
                    <span className="text-[10px] font-semibold text-[#45474c] bg-[#f2f4f6] px-2.5 py-1 rounded-full">{job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }} className="p-2 rounded-lg hover:bg-[#f2f4f6] transition-colors">
                  <Bookmark size={16} className={saved.has(job.id) ? 'text-[#2563EB] fill-[#2563EB]' : 'text-[#75777d]'} />
                </button>
                <span className="text-xs text-[#75777d]">{job.applicants} applicants</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
