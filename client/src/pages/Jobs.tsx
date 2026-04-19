import { useState, useEffect, useRef } from 'react';
import {
  Search, MapPin, Clock, DollarSign, Building2, Bookmark,
  Briefcase, CheckCircle2, Filter, Plus, X, ChevronDown,
  FileText, Upload, Send, Calendar, Layers, Globe, ArrowRight, CheckCircle
} from 'lucide-react';
import api from '../lib/api';

// ─── Schema-aligned types ─────────────────────────────────────────────────────
type OpportunityType = 'all' | 'job' | 'internship' | 'freelance';
type OpportunityMode = 'all' | 'online' | 'onsite' | 'hybrid';
type OpportunityStatus = 'all' | 'open' | 'closed';

type Job = {
  id: string;
  title: string;
  company: string;
  companyId: string;
  mode: string;
  type: string;
  status: string;
  payment: string | null;
  posted: string;
  deadline: string | null;
  verified: boolean;
  description: string;
};

// ─── Application tracking (localStorage) ─────────────────────────────────────────────────────
const LS_KEY = 'worksphere_applications';

type ApplicationStatus = 'under_review' | 'shortlisted' | 'rejected';

type Application = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  type: string;
  mode: string;
  payment: string | null;
  resumeName: string;
  appliedAt: string;   // ISO date string
  status: ApplicationStatus;
};

function loadApplications(): Application[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function saveApplications(apps: Application[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(apps));
}

function addApplication(job: Job, resumeName: string): Application[] {
  const existing = loadApplications();
  if (existing.find(a => a.jobId === job.id)) return existing;
  const newApp: Application = {
    id: crypto.randomUUID(),
    jobId: job.id,
    title: job.title,
    company: job.company,
    type: job.type,
    mode: job.mode,
    payment: job.payment,
    resumeName,
    appliedAt: new Date().toISOString(),
    status: 'under_review',
  };
  const updated = [newApp, ...existing];
  saveApplications(updated);
  return updated;
}

// ─── Resume Upload Modal ───────────────────────────────────────────────────────
function ResumeUploadModal({ job, onClose, onEnrolled }: { job: Job; onClose: () => void; onEnrolled: (apps: Application[]) => void }) {
  const [resume, setResume] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [step, setStep] = useState<'upload' | 'success'>('upload');
  const [enrolling, setEnrolling] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResume(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResume(file);
  };

  const handleEnroll = async () => {
    if (!resume) return;
    setEnrolling(true);
    await new Promise(r => setTimeout(r, 1800));
    const updated = addApplication(job, resume.name);
    onEnrolled(updated);
    setEnrolling(false);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="bg-card border border-border text-foreground rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {step === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Application Submitted!</h3>
            <p className="text-sm text-muted-foreground mb-1">Your resume has been sent for</p>
            <p className="text-sm font-bold text-primary mb-6">{job.title} at {job.company}</p>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <p className="text-emerald-500 text-xs font-bold">✓ Resume uploaded · Application under review</p>
            </div>
            <button onClick={onClose}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-primary/20">
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-secondary/40">
              <div>
                <h3 className="font-bold text-foreground">Upload Your Resume</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Applying for · <span className="text-primary font-bold">{job.title}</span></p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary bg-primary/5 scale-[1.01]' :
                  resume ? 'border-emerald-500 bg-emerald-500/5' :
                  'border-border hover:border-primary/50 hover:bg-secondary/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {resume ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText size={22} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{resume.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(resume.size / 1024).toFixed(1)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Upload size={22} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Drop your resume here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse · PDF, DOC, DOCX</p>
                  </>
                )}
              </div>

              {/* Cover Note */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Cover Note (Optional)</label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  placeholder="Briefly introduce yourself and why you're a great fit..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                disabled={!resume || enrolling}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={14} /> Enroll — Submit Application</>
                )}
              </button>

              <p className="text-center text-[10px] text-muted-foreground">Your resume will be shared with {job.company} securely.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Job Details Modal ────────────────────────────────────────────────────────
function JobDetailsModal({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply: () => void }) {
  const modeColor = (m: string) => {
    if (m === 'online') return 'bg-emerald-500/10 text-emerald-500';
    if (m === 'hybrid') return 'bg-primary/10 text-primary';
    return 'bg-amber-500/10 text-amber-500';
  };
  const typeColor = (t: string) => {
    if (t === 'internship') return 'bg-purple-500/10 text-purple-500';
    if (t === 'freelance') return 'bg-orange-500/10 text-orange-500';
    return 'bg-secondary text-muted-foreground border border-border';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-card border border-border text-foreground rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-brand flex items-center justify-center text-surface-brand-foreground shrink-0">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-foreground">{job.title}</h2>
                {job.verified && <CheckCircle2 size={16} className="text-primary fill-primary/10" />}
                {job.status === 'closed' && (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 rounded-full">Closed</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Building2 size={13} /> {job.company}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Meta info pills */}
        <div className="px-6 py-4 border-b border-border bg-secondary/40 flex flex-wrap gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full capitalize ${modeColor(job.mode)}`}>
            <Globe size={12} /> {job.mode === 'online' ? 'Remote' : job.mode === 'onsite' ? 'On-site' : 'Hybrid'}
          </span>
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full capitalize ${typeColor(job.type)}`}>
            <Layers size={12} /> {job.type}
          </span>
          {job.payment && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-secondary border border-border text-foreground">
              <DollarSign size={12} /> {job.payment}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-secondary border border-border">
            <Calendar size={12} /> Posted {job.posted}
          </span>
          {job.deadline && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Clock size={12} /> Deadline: {job.deadline}
            </span>
          )}
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-none">
          <div>
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Job Description</h3>
            {job.description ? (
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line bg-secondary/40 rounded-xl p-4 border border-border">
                {job.description}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic bg-secondary/40 rounded-xl p-4 border border-border">
                No description provided for this role. Contact the company directly for more details.
              </div>
            )}
          </div>

          {/* Responsibilities placeholder */}
          <div>
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">What You'll Do</h3>
            <ul className="space-y-2">
              {[
                'Collaborate with cross-functional teams to deliver high-quality work.',
                'Bring innovative ideas and contribute to team goals.',
                'Communicate progress effectively with stakeholders.',
                'Grow your skills in a fast-paced professional environment.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground">Ready to apply? Upload your resume in the next step.</p>
          {job.status === 'open' ? (
            <button
              onClick={onApply}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-90 transition-all shadow-lg shadow-primary/25"
            >
              Apply Now <ArrowRight size={14} />
            </button>
          ) : (
            <span className="px-5 py-2.5 bg-secondary text-muted-foreground rounded-xl text-sm font-bold border border-border cursor-not-allowed">Position Closed</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post a Job Modal ─────────────────────────────────────────────────────────
function PostJobModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    type: 'job',
    mode: 'hybrid',
    status: 'open',
    payment: '',
    postName: '',
    description: '',
    registrationDeadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/opportunities', {
        type: form.type,
        mode: form.mode,
        status: form.status,
        payment: form.payment || undefined,
        postName: form.postName,
        description: form.description || undefined,
        registrationDeadline: form.registrationDeadline
          ? new Date(form.registrationDeadline).toISOString()
          : undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to post opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-card border border-border text-foreground rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-none"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="bg-surface-brand text-surface-brand-foreground px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">Post an Opportunity</h3>
              <p className="text-[10px] text-surface-brand-foreground/60 uppercase tracking-widest">Job / Internship / Freelance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-brand-foreground/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* Post Name */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Position / Role Title *</label>
            <input
              required value={form.postName} onChange={e => set('postName', e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Type + Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Opportunity Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Work Mode *</label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                <option value="online">Online / Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Status + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors">
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Compensation</label>
              <input
                value={form.payment} onChange={e => set('payment', e.target.value)}
                placeholder="e.g. ₹12L–₹18L / year"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Application Deadline (Optional)</label>
            <input
              type="datetime-local" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-secondary text-foreground border border-border rounded-xl text-sm font-bold hover:brightness-95 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Posting...</>
                : <><Plus size={16} /> Post Opportunity</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Jobs Page ───────────────────────────────────────────────────────────
export default function Jobs() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeJob, setResumeJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [applications, setApplications] = useState<Application[]>(loadApplications);

  // Active filters (schema-aligned)
  const [filterType, setFilterType] = useState<OpportunityType>('all');
  const [filterMode, setFilterMode] = useState<OpportunityMode>('all');
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = () => setActiveDropdown(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/opportunities');
      const mapped = res.data.map((o: any) => ({
        id: o.id,
        title: o.postName,
        company: o.company?.name || 'Unknown Company',
        companyId: o.companyId,
        mode: o.mode,              // online | onsite | hybrid
        type: o.type,              // job | internship | freelance
        status: o.status,          // open | closed
        payment: o.payment || null,
        posted: new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        deadline: o.registrationDeadline
          ? new Date(o.registrationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : null,
        verified: o.company?.owner?.verified || false,
        description: o.description || '',
      }));
      setJobs(mapped);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const toggleSave = (id: string) => {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const openDropdown = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setActiveDropdown(prev => prev === name ? null : name);
  };

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredJobs = jobs.filter(j => {
    const matchSearch = !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || j.type === filterType;
    const matchMode = filterMode === 'all' || j.mode === filterMode;
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchSearch && matchType && matchMode && matchStatus;
  });

  const typeLabel = filterType === 'all' ? 'Job Type' : filterType.charAt(0).toUpperCase() + filterType.slice(1);
  const modeLabel = filterMode === 'all' ? 'Work Mode' : filterMode.charAt(0).toUpperCase() + filterMode.slice(1);
  const statusLabel = filterStatus === 'all' ? 'Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1);

  const modeColor = (m: string) => {
    if (m === 'online') return 'bg-emerald-500/10 text-emerald-500';
    if (m === 'hybrid') return 'bg-primary/10 text-primary';
    return 'bg-amber-500/10 text-amber-500';
  };

  const typeColor = (t: string) => {
    if (t === 'internship') return 'bg-purple-500/10 text-purple-500';
    if (t === 'freelance') return 'bg-orange-500/10 text-orange-500';
    return 'bg-card text-muted-foreground border border-border';
  };

  const activeFiltersCount = [
    filterType !== 'all', filterMode !== 'all', filterStatus !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Job Market</h2>
          <p className="text-sm text-muted-foreground mt-1">Access exclusive roles from verified companies.</p>
        </div>
        <button
          onClick={() => setPostModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={14} /> Post a Job
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center p-1 bg-secondary rounded-xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'browse'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase size={13} /> Browse Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'applications'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText size={13} /> My Applications
          {applications.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Browse Jobs Tab ─────────────────────────── */}
      {activeTab === 'browse' && (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job titles, companies, or skills..."
                className="w-full bg-card border border-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* Job Type */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'type')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterType !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <Briefcase size={12} /> {typeLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'type' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                    {(['all', 'job', 'internship', 'freelance'] as OpportunityType[]).map(v => (
                      <button key={v} onClick={() => { setFilterType(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterType === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Types' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Mode */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'mode')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterMode !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <MapPin size={12} /> {modeLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'mode' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                    {(['all', 'online', 'onsite', 'hybrid'] as OpportunityMode[]).map(v => (
                      <button key={v} onClick={() => { setFilterMode(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterMode === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Modes' : v === 'online' ? 'Online / Remote' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'status')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterStatus !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <Clock size={12} /> {statusLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'status' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-40" onClick={e => e.stopPropagation()}>
                    {(['all', 'open', 'closed'] as OpportunityStatus[]).map(v => (
                      <button key={v} onClick={() => { setFilterStatus(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterStatus === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Statuses' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setFilterType('all'); setFilterMode('all'); setFilterStatus('all'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <X size={12} /> Clear ({activeFiltersCount})
                </button>
              )}

              <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold ml-auto">
                <Filter size={12} /> {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex flex-col gap-4">
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No opportunities match your filters</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}

            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Briefcase size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                        {job.verified && <CheckCircle2 size={14} className="text-primary fill-primary/10 shrink-0" />}
                        {job.status === 'closed' && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 rounded-full">Closed</span>
                        )}
                        {applications.find(a => a.jobId === job.id) && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 rounded-full">Applied</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                        {job.payment && <span className="flex items-center gap-1"><DollarSign size={12} /> {job.payment}</span>}
                        <span className="flex items-center gap-1"><Clock size={12} /> Posted {job.posted}</span>
                        {job.deadline && <span className="flex items-center gap-1 text-amber-500"><Clock size={12} /> Deadline: {job.deadline}</span>}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${modeColor(job.mode)}`}>
                          {job.mode === 'online' ? 'Remote' : job.mode === 'onsite' ? 'On-site' : 'Hybrid'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${typeColor(job.type)}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Bookmark size={16} className={saved.has(job.id) ? 'text-primary fill-primary' : 'text-muted-foreground'} />
                    </button>
                    {job.status === 'open' && !applications.find(a => a.jobId === job.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:brightness-90 transition-all shadow-sm"
                      >
                        Apply
                      </button>
                    )}
                    {applications.find(a => a.jobId === job.id) && (
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg border border-emerald-500/20">
                        Applied ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── My Applications Tab ─────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="flex flex-col gap-6">
          {applications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
                <FileText size={32} className="opacity-30" />
              </div>
              <p className="font-bold text-foreground">No applications yet</p>
              <p className="text-sm mt-1 mb-5">Browse jobs and click Apply to start your journey</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Applied', value: applications.length, color: 'text-foreground', bg: 'bg-secondary' },
                  { label: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border text-center`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Application list */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent Applications</h3>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all application history?')) {
                        saveApplications([]);
                        setApplications([]);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {applications.map(app => {
                  const statusConfig = {
                    under_review: { label: 'Under Review', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                    shortlisted: { label: 'Shortlisted 🎉', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                    rejected: { label: 'Not Selected', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
                  }[app.status];

                  const modeClr = app.mode === 'online'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : app.mode === 'hybrid'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-500/10 text-amber-500';

                  return (
                    <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            <Briefcase size={18} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground">{app.title}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 size={11} /> {app.company}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${modeClr}`}>
                                {app.mode === 'online' ? 'Remote' : app.mode === 'onsite' ? 'On-site' : 'Hybrid'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border capitalize">
                                {app.type}
                              </span>
                              {app.payment && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border flex items-center gap-1">
                                  <DollarSign size={9} /> {app.payment}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <FileText size={10} /> {app.resumeName}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={10} /> Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2.5 shrink-0">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${statusConfig.cls}`}>
                            {statusConfig.label}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Withdraw application for ${app.title}?`)) {
                                const updated = applications.filter(a => a.id !== app.id);
                                saveApplications(updated);
                                setApplications(updated);
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-600 font-bold transition-colors"
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center p-1 bg-secondary rounded-xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'browse'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase size={13} /> Browse Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'applications'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText size={13} /> My Applications
          {applications.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Browse Jobs Tab ─────────────────────────── */}
      {activeTab === 'browse' && (
        <>
          {/* Search & Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job titles, companies, or skills..."
                className="w-full bg-card border border-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* Job Type */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'type')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterType !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <Briefcase size={12} /> {typeLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'type' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                    {(['all', 'job', 'internship', 'freelance'] as OpportunityType[]).map(v => (
                      <button key={v} onClick={() => { setFilterType(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterType === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Types' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Mode */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'mode')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterMode !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <MapPin size={12} /> {modeLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'mode' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-44" onClick={e => e.stopPropagation()}>
                    {(['all', 'online', 'onsite', 'hybrid'] as OpportunityMode[]).map(v => (
                      <button key={v} onClick={() => { setFilterMode(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterMode === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Modes' : v === 'online' ? 'Online / Remote' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="relative">
                <button
                  onClick={e => openDropdown(e, 'status')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                    filterStatus !== 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  <Clock size={12} /> {statusLabel} <ChevronDown size={12} />
                </button>
                {activeDropdown === 'status' && (
                  <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-40" onClick={e => e.stopPropagation()}>
                    {(['all', 'open', 'closed'] as OpportunityStatus[]).map(v => (
                      <button key={v} onClick={() => { setFilterStatus(v); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors capitalize hover:bg-secondary ${filterStatus === v ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {v === 'all' ? 'All Statuses' : v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setFilterType('all'); setFilterMode('all'); setFilterStatus('all'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <X size={12} /> Clear ({activeFiltersCount})
                </button>
              )}

              <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold ml-auto">
                <Filter size={12} /> {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex flex-col gap-4">
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No opportunities match your filters</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}

            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Briefcase size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                        {job.verified && <CheckCircle2 size={14} className="text-primary fill-primary/10 shrink-0" />}
                        {job.status === 'closed' && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 rounded-full">Closed</span>
                        )}
                        {applications.find(a => a.jobId === job.id) && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 rounded-full">Applied</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Building2 size={12} /> {job.company}</span>
                        {job.payment && <span className="flex items-center gap-1"><DollarSign size={12} /> {job.payment}</span>}
                        <span className="flex items-center gap-1"><Clock size={12} /> Posted {job.posted}</span>
                        {job.deadline && <span className="flex items-center gap-1 text-amber-500"><Clock size={12} /> Deadline: {job.deadline}</span>}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${modeColor(job.mode)}`}>
                          {job.mode === 'online' ? 'Remote' : job.mode === 'onsite' ? 'On-site' : 'Hybrid'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${typeColor(job.type)}`}>
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Bookmark size={16} className={saved.has(job.id) ? 'text-primary fill-primary' : 'text-muted-foreground'} />
                    </button>
                    {job.status === 'open' && !applications.find(a => a.jobId === job.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:brightness-90 transition-all shadow-sm"
                      >
                        Apply
                      </button>
                    )}
                    {applications.find(a => a.jobId === job.id) && (
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg border border-emerald-500/20">
                        Applied ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── My Applications Tab ─────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="flex flex-col gap-6">
          {applications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
                <FileText size={32} className="opacity-30" />
              </div>
              <p className="font-bold text-foreground">No applications yet</p>
              <p className="text-sm mt-1 mb-5">Browse jobs and click Apply to start your journey</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/20"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Applied', value: applications.length, color: 'text-foreground', bg: 'bg-secondary' },
                  { label: 'Under Review', value: applications.filter(a => a.status === 'under_review').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-border text-center`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Application list */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recent Applications</h3>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all application history?')) {
                        saveApplications([]);
                        setApplications([]);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {applications.map(app => {
                  const statusConfig = {
                    under_review: { label: 'Under Review', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                    shortlisted: { label: 'Shortlisted 🎉', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                    rejected: { label: 'Not Selected', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
                  }[app.status];

                  const modeClr = app.mode === 'online'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : app.mode === 'hybrid'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-500/10 text-amber-500';

                  return (
                    <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            <Briefcase size={18} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-foreground">{app.title}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 size={11} /> {app.company}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${modeClr}`}>
                                {app.mode === 'online' ? 'Remote' : app.mode === 'onsite' ? 'On-site' : 'Hybrid'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border capitalize">
                                {app.type}
                              </span>
                              {app.payment && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border flex items-center gap-1">
                                  <DollarSign size={9} /> {app.payment}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <FileText size={10} /> {app.resumeName}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar size={10} /> Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2.5 shrink-0">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${statusConfig.cls}`}>
                            {statusConfig.label}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Withdraw application for ${app.title}?`)) {
                                const updated = applications.filter(a => a.id !== app.id);
                                saveApplications(updated);
                                setApplications(updated);
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-600 font-bold transition-colors"
                          >
                            Withdraw
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Job Modal */}
      {postModalOpen && (
        <PostJobModal
          onClose={() => setPostModalOpen(false)}
          onCreated={fetchJobs}
        />
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            setResumeJob(selectedJob);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Resume Upload Modal */}
      {resumeJob && (
        <ResumeUploadModal
          job={resumeJob}
          onClose={() => setResumeJob(null)}
          onEnrolled={(updated) => {
            setApplications(updated);
          }}
        />
      )}
    </div>
  );
}
