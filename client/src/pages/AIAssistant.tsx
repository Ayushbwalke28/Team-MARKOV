import { Bot, Sparkles, Zap, MessageSquare, TrendingUp, Search, UserPlus, FileSearch } from 'lucide-react';

const insights = [
  { icon: FileSearch, title: 'Profile Analysis', desc: 'Your profile "About" section could be 20% more impactful by adding specific metrics from your last role.', action: 'Optimize Now' },
  { icon: TrendingUp, title: 'Market Trends', desc: 'Demand for "System Architecture" skills in the Fintech sector has increased by 15% this month.', action: 'Learn More' },
  { icon: UserPlus, title: 'Network Gap', desc: 'You follow many Engineers, but only 2 Product Managers. Expanding this could lead to more cross-functional roles.', action: 'Find PMs' },
];

export default function AIAssistant() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-[#0A1628] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB] rounded-full blur-[100px] opacity-20" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={20} className="text-[#2563EB]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Intelligent Ledger Insights</span>
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">Your AI-Powered Professional Growth Agent</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Leverage advanced analytics and peer-benchmarking to optimize your strategy, discover exclusive opportunities, and grow your professional presence.
          </p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 flex items-center gap-2">
              <Sparkles size={14} className="text-[#F59E0B]" />
              <span className="text-xs font-semibold">Verified Insights Only</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/10 flex items-center gap-2">
              <Zap size={14} className="text-[#10B981]" />
              <span className="text-xs font-semibold">Real-time Analysis</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl relative z-10 shrink-0">
          <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center mb-3 shadow-lg shadow-[#2563EB]/40">
            <Bot size={32} />
          </div>
          <span className="text-xs font-bold">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div key={ins.title} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] flex items-center justify-center mb-5 group-hover:bg-[#2563EB]/10 transition-colors">
                <Icon size={20} className="text-[#45474c] group-hover:text-[#2563EB] transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-[#0A1628] mb-2">{ins.title}</h3>
              <p className="text-xs text-[#75777d] leading-relaxed mb-6 italic">"{ins.desc}"</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] hover:underline flex items-center gap-1.5">
                {ins.action} <Sparkles size={10} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-[#e0e3e5] overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-[#f2f4f6] bg-[#f7f9fb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#2563EB]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#45474c]">Chat with Assistant</h3>
          </div>
          <span className="text-[10px] text-[#75777d]">Powered by Gemini 1.5 Pro</span>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex justify-start">
            <div className="bg-[#f2f4f6] text-[#191c1e] text-xs px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%] leading-relaxed border border-[#e0e3e5]">
              Hello John! I've analyzed your recent project entries in the ledger. Your contribution to "CloudMesh Network" has increased your expertise rating in <span className="font-bold text-[#2563EB]">Kubernetes Orchestration</span> by 12 points. Would you like me to update your profile highlights?
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t border-[#f2f4f6]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c6cd]" size={16} />
            <input 
              type="text" 
              placeholder="Ask for an insight (e.g. 'Compare my salary to market', 'Who should I connect with?')..." 
              className="w-full bg-[#f7f9fb] text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none border border-[#e0e3e5] focus:border-[#2563EB]/30 transition-all font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
