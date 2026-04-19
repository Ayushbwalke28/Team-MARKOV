import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Zap, MessageSquare, TrendingUp, Search, UserPlus, FileSearch, Loader2, CheckCircle2, Send } from 'lucide-react';
import { aiApi, profileApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type SuggestionResponse = {
  suggestions: string[];
  rewrittenAbout: string;
  experienceEnhancements: { title: string; enhancedDescription: string }[];
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hello ${user?.name || 'there'}! I've analyzed your recent project entries in the ledger. Would you like me to optimize your profile or suggest some networking opportunities?` }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const messages = chatHistory.map(m => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: m.content }));
      messages.push({ role: 'user', content: userMessage });
      
      const response = await aiApi.chat(messages);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.content }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptimizeProfile = async () => {
    setIsOptimizing(true);
    setError(null);
    try {
      const profileData = await profileApi.getMe();
      const result = await aiApi.suggestProfileImprovements(profileData);
      setSuggestions(result);
    } catch (err) {
      console.error('AI Optimization failed:', err);
      setError('Failed to analyze profile. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const insights = [
    { 
      icon: FileSearch, 
      title: 'Profile Analysis', 
      desc: suggestions 
        ? 'Analysis complete! Check the suggestions below to optimize your profile.' 
        : 'Your profile "About" section could be 20% more impactful by adding specific metrics from your last role.', 
      action: suggestions ? 'Refresh Analysis' : 'Optimize Now',
      onClick: handleOptimizeProfile,
      loading: isOptimizing
    },
    { icon: TrendingUp, title: 'Market Trends', desc: 'Demand for "System Architecture" skills in the Fintech sector has increased by 15% this month.', action: 'Learn More' },
    { icon: UserPlus, title: 'Network Gap', desc: 'You follow many Engineers, but only 2 Product Managers. Expanding this could lead to more cross-functional roles.', action: 'Find PMs' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800/50 rounded-2xl p-8 text-slate-900 dark:text-white relative overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={20} className="text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Intelligent Ledger Insights</span>
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">Your AI-Powered Professional Growth Agent</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Leverage advanced analytics and peer-benchmarking to optimize your strategy, discover exclusive opportunities, and grow your professional presence.
          </p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-semibold">Verified Insights Only</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
              <Zap size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold">Real-time Analysis</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-700/50 rounded-2xl relative z-10 shrink-0">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-600/20">
            <Bot size={32} className="text-white" />
          </div>
          <span className="text-xs font-bold text-slate-500">Online</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div 
              key={ins.title} 
              onClick={ins.onClick}
              className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              {ins.loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <Loader2 className="animate-spin text-[#2563EB]" size={24} />
                </div>
              )}
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

      {suggestions && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-[#f2f4f6] flex items-center gap-3 bg-[#f7f9fb]">
            <Sparkles className="text-[#F59E0B]" size={20} />
            <h3 className="text-sm font-black text-[#0A1628] uppercase tracking-wider">AI Optimization Results</h3>
          </div>
          
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold text-[#75777d] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10B981]" /> Key Improvements
                </h4>
                <ul className="space-y-3">
                  {suggestions.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-xs text-[#191c1e] bg-[#f2f4f6] p-4 rounded-xl border border-[#e0e3e5]">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#2563EB]">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#75777d] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap size={14} className="text-[#2563EB]" /> Rewritten "About" Section
                </h4>
                <div className="bg-[#0A1628] text-white p-6 rounded-2xl text-xs leading-relaxed italic border border-white/5 relative">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Sparkles size={40} />
                  </div>
                  "{suggestions.rewrittenAbout}"
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-bold text-[#75777d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-[#8B5CF6]" /> Experience Enhancements
              </h4>
              <div className="space-y-4">
                {suggestions.experienceEnhancements.map((exp, i) => (
                  <div key={i} className="p-5 border border-[#e0e3e5] rounded-xl hover:border-[#2563EB]/30 transition-colors">
                    <div className="font-bold text-xs text-[#0A1628] mb-2">{exp.title}</div>
                    <div className="text-[11px] text-[#75777d] leading-relaxed">
                      {exp.enhancedDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-[#f7f9fb] border-t border-[#f2f4f6] flex justify-end">
            <button 
              onClick={() => setSuggestions(null)}
              className="text-xs font-bold text-[#75777d] hover:text-[#0A1628] px-4 py-2 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e0e3e5] overflow-hidden flex flex-col min-h-[500px] shadow-sm">
        <div className="p-4 border-b border-[#f2f4f6] bg-[#f7f9fb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#2563EB]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#45474c]">Chat with Assistant</h3>
          </div>
          <span className="text-[10px] text-[#75777d]">Powered by Qwen 2.5</span>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`text-xs px-4 py-3 rounded-2xl max-w-[80%] leading-relaxed border ${
                msg.role === 'user' 
                  ? 'bg-[#2563EB] text-white border-[#2563EB] rounded-br-sm' 
                  : 'bg-[#f2f4f6] text-[#191c1e] border-[#e0e3e5] rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#f2f4f6] text-[#75777d] text-xs px-4 py-3 rounded-2xl rounded-bl-sm border border-[#e0e3e5] flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Assistant is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-[#f2f4f6]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5c6cd]" size={16} />
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask for an insight (e.g. 'Compare my salary to market', 'Who should I connect with?')..." 
              className="w-full bg-[#f7f9fb] text-sm rounded-xl pl-11 pr-16 py-3 focus:outline-none border border-[#e0e3e5] focus:border-[#2563EB]/30 transition-all font-medium disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
