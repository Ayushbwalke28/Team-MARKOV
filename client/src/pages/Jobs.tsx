import { useState } from 'react';
import { Search, MapPin, Clock, DollarSign, Building2, Bookmark, Filter, ChevronDown, Briefcase, CheckCircle2 } from 'lucide-react';

const jobs = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Vertex AI Labs', location: 'San Francisco, CA', type: 'Full-time', salary: '$180k - $240k', posted: '2 days ago', applicants: 245,
    tags: ['React', 'TypeScript', 'Node.js'], verified: true, description: 'Build next-gen AI-powered developer tools with a world-class engineering team.' },
  { id: 2, title: 'UX Research Lead', company: 'GreenScale Energy', location: 'Remote', type: 'Full-time', salary: '$140k - $185k', posted: '3 days ago', applicants: 182,
    tags: ['User Research', 'Figma', 'Prototyping'], verified: true, description: 'Lead user research initiatives for clean energy products impacting millions of customers.' },
  { id: 3, title: 'Product Marketing Manager', company: 'NovaPay Financial', location: 'New York, NY', type: 'Full-time', salary: '$130k - $170k', posted: '5 days ago', applicants: 156,
    tags: ['Growth', 'Analytics', 'B2B SaaS'], verified: true, description: 'Drive go-to-market strategies for our rapidly growing fintech platform.' },
  { id: 4, title: 'DevOps Architect', company: 'CloudMesh Network', location: 'Seattle, WA', type: 'Contract', salary: '$160k - $210k', posted: '1 week ago', applicants: 98,
    tags: ['Kubernetes', 'Terraform', 'AWS'], verified: false, description: 'Design cloud-native infrastructure for enterprise-scale distributed systems.' },
  { id: 5, title: 'Data Science Manager', company: 'Vertex AI Labs', location: 'Remote', type: 'Full-time', salary: '$190k - $260k', posted: '1 day ago', applicants: 312,
    tags: ['Python', 'ML', 'Leadership'], verified: true, description: 'Lead a team building advanced ML models for real-time data processing.' },
  { id: 6, title: 'Design Systems Engineer', company: 'CloudMesh Network', location: 'Remote', type: 'Full-time', salary: '$150k - $200k', posted: '4 days ago', applicants: 134,
    tags: ['React', 'Storybook', 'CSS'], verified: false, description: 'Build and maintain a comprehensive design system used across all products.' },
];

export default function Jobs() {
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (id: number) => {
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
                    {job.tags.map(t => <span key={t} className="text-[10px] font-semibold text-[#2563EB] bg-[#2563EB]/8 px-2.5 py-1 rounded-full">{t}</span>)}
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
