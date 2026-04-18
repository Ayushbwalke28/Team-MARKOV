import { TrendingUp, TrendingDown, Eye, Users, FileText, Briefcase } from 'lucide-react';

const stats = [
  { label: 'Total Profile Views', value: '42,891', change: '+18.2%', up: true, icon: Eye },
  { label: 'New Connections', value: '1,204', change: '+12.5%', up: true, icon: Users },
  { label: 'Active Applications', value: '342', change: '-3.1%', up: false, icon: FileText },
  { label: 'Open Requisitions', value: '18', change: '+2', up: true, icon: Briefcase },
];

const topJobs = [
  { title: 'Senior Frontend Engineer', location: 'San Francisco, CA', applicants: 245 },
  { title: 'UX Research Lead', location: 'Remote', applicants: 182 },
  { title: 'Product Marketing Manager', location: 'New York, NY', applicants: 156 },
];

const engagementData = [
  { month: 'Jan', views: 3200, interactions: 820 },
  { month: 'Feb', views: 4100, interactions: 980 },
  { month: 'Mar', views: 3800, interactions: 910 },
  { month: 'Apr', views: 5200, interactions: 1340 },
  { month: 'May', views: 4800, interactions: 1180 },
  { month: 'Jun', views: 6100, interactions: 1520 },
];

const funnelStages = [
  { stage: 'Profile Views', value: 42891, pct: 100 },
  { stage: 'Application Started', value: 8420, pct: 19.6 },
  { stage: 'Resume Submitted', value: 3210, pct: 7.5 },
  { stage: 'Interview Stage', value: 892, pct: 2.1 },
  { stage: 'Offer Extended', value: 156, pct: 0.4 },
];

const demographics = [
  { label: 'Engineering', pct: 38, color: '#2563EB' },
  { label: 'Product', pct: 22, color: '#0A1628' },
  { label: 'Design', pct: 16, color: '#F59E0B' },
  { label: 'Marketing', pct: 14, color: '#10B981' },
  { label: 'Operations', pct: 10, color: '#8B5CF6' },
];

const maxViews = Math.max(...engagementData.map(d => d.views));

export default function Analytics() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-black text-[#0A1628]">Analytics Overview</h2>
        <p className="text-sm text-[#75777d] mt-1">Real-time performance metrics and insights.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-[#e0e3e5] p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#75777d] font-medium">{s.label}</p>
                <div className="w-8 h-8 rounded-lg bg-[#f2f4f6] flex items-center justify-center"><Icon size={16} className="text-[#45474c]" /></div>
              </div>
              <p className="text-3xl font-black text-[#0A1628]">{s.value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {s.up ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
                <span className={`text-xs font-bold ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.change}</span>
                <span className="text-[10px] text-[#c5c6cd]">vs. previous 30 days</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-1">Audience Engagement</h3>
          <p className="text-xs text-[#75777d] mb-6">Profile views and interaction volume over the selected period.</p>
          <div className="flex items-end justify-between gap-4 h-44">
            {engagementData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-[#75777d]">{(d.views / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t bg-[#2563EB]/80 hover:bg-[#2563EB] transition-colors" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: 6 }} />
                  <div className="w-full rounded-t bg-[#F59E0B]/60 hover:bg-[#F59E0B] transition-colors" style={{ height: `${(d.interactions / maxViews) * 80}%`, minHeight: 4 }} />
                </div>
                <span className="text-[10px] font-semibold text-[#75777d] uppercase">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#f2f4f6]">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#2563EB]" /><span className="text-[10px] text-[#75777d]">Profile Views</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#F59E0B]" /><span className="text-[10px] text-[#75777d]">Interactions</span></div>
          </div>
        </div>

        {/* Recruitment Funnel */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-1">Recruitment Funnel</h3>
          <p className="text-xs text-[#75777d] mb-6">Conversion rates across stages.</p>
          <div className="flex flex-col gap-3">
            {funnelStages.map((f, i) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#191c1e]">{f.stage}</span>
                  <span className="text-xs text-[#75777d]">{f.value.toLocaleString()} ({f.pct}%)</span>
                </div>
                <div className="w-full bg-[#f2f4f6] rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all duration-500" style={{
                    width: `${f.pct}%`,
                    minWidth: f.pct < 5 ? '20px' : undefined,
                    backgroundColor: ['#2563EB', '#0A1628', '#F59E0B', '#10B981', '#8B5CF6'][i]
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Jobs */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-5">Top Performing Jobs</h3>
          <div className="flex flex-col gap-4">
            {topJobs.map((j, i) => (
              <div key={j.title} className="flex items-center justify-between p-4 rounded-xl bg-[#f7f9fb] hover:bg-[#f2f4f6] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0A1628] flex items-center justify-center text-white font-black text-sm">{i + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#191c1e]">{j.title}</p>
                    <p className="text-xs text-[#75777d]">{j.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#2563EB]">{j.applicants}</p>
                  <p className="text-[10px] text-[#75777d]">Applicants</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-6">
          <h3 className="text-sm font-bold text-[#0A1628] mb-5">Demographic Breakdown</h3>
          <div className="flex flex-col gap-4">
            {demographics.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-medium text-[#191c1e]">{d.label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#45474c]">{d.pct}%</span>
                </div>
                <div className="w-full bg-[#f2f4f6] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
