import { useState } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video, Search, CheckCircle2, Circle } from 'lucide-react';

const conversations = [
  { id: 1, name: 'Sarah Chen', role: 'VP Engineering @ Vertex AI', avatar: 'SC', lastMessage: 'The Q3 roadmap looks solid. Let\'s sync on Monday.', time: '2m', unread: 2, online: true, verified: true },
  { id: 2, name: 'Marcus Rivera', role: 'Product Lead @ Figma', avatar: 'MR', lastMessage: 'Shared the new design system specs.', time: '15m', unread: 0, online: true, verified: true },
  { id: 3, name: 'Aisha Patel', role: 'Data Science @ Netflix', avatar: 'AP', lastMessage: 'Here is the link to the dataset.', time: '1h', unread: 1, online: false, verified: true },
  { id: 4, name: 'James O\'Brien', role: 'DevOps @ CloudMesh', avatar: 'JO', lastMessage: 'API deployment is successful.', time: '3h', unread: 0, online: false, verified: true },
  { id: 5, name: 'Lena Kowalski', role: 'UX Research @ Airbnb', avatar: 'LK', lastMessage: 'User testing reports are attached.', time: '5h', unread: 0, online: true, verified: true },
  { id: 6, name: 'David Kim', role: 'Senior Architect', avatar: 'DK', lastMessage: 'Meeting rescheduled to 4 PM.', time: 'Yesterday', unread: 0, online: false, verified: false },
];

const messageHistory = [
  { id: 1, sender: 'Sarah Chen', content: 'Hey! I just reviewed the Q3 product roadmap. The AI integration timeline looks really ambitious.', time: '10:15 AM', isMine: false },
  { id: 2, sender: 'You', content: 'Thanks! We\'re pushing hard on the ML pipeline. Should have the first prototype by end of month.', time: '10:18 AM', isMine: true },
  { id: 3, sender: 'Sarah Chen', content: 'That\'s exciting. I think real-time inference could be a game changer for the platform.', time: '10:20 AM', isMine: false },
  { id: 4, sender: 'You', content: 'Absolutely. We\'re exploring edge deployment with ONNX runtime to keep latency under 50ms.', time: '10:24 AM', isMine: true },
  { id: 5, sender: 'Sarah Chen', content: 'Smart approach. We used a similar strategy at Stripe. Happy to share some learnings.', time: '10:26 AM', isMine: false },
  { id: 6, sender: 'You', content: 'That would be helpful! The Q3 roadmap looks solid. Let\'s sync on Monday.', time: '10:30 AM', isMine: true },
];

export default function Messages() {
  const [activeConvo, setActiveConvo] = useState(conversations[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="h-[calc(100vh-10rem)] bg-white rounded-2xl border border-[#e0e3e5] flex overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#f2f4f6] flex flex-col shrink-0">
        <div className="p-5 border-b border-[#f2f4f6]">
          <h2 className="text-sm font-black text-[#0A1628] mb-4 uppercase tracking-wider">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c6cd]" size={14} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-[#f7f9fb] text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none border border-[#e0e3e5] focus:border-[#2563EB]/30 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#f2f4f6]/50">
          {conversations.map((c) => (
            <button 
              key={c.id} 
              onClick={() => setActiveConvo(c)}
              className={`w-full p-4 flex gap-3 text-left transition-colors ${activeConvo.id === c.id ? 'bg-[#f7f9fb]' : 'hover:bg-[#fcfdfe]'}`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {c.avatar}
                </div>
                {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-[#191c1e] truncate">{c.name}</span>
                    {c.verified && <CheckCircle2 size={12} className="text-[#2563EB] shrink-0" />}
                  </div>
                  <span className="text-[10px] text-[#c5c6cd] font-medium shrink-0 ml-2">{c.time}</span>
                </div>
                <p className={`text-[11px] truncate ${c.unread > 0 ? 'text-[#191c1e] font-bold' : 'text-[#75777d]'}`}>
                  {c.lastMessage}
                </p>
              </div>
              {c.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  {c.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-[#f2f4f6] flex items-center justify-between shadow-[0_2px_4px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {activeConvo.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#191c1e]">{activeConvo.name}</h3>
                {activeConvo.verified && <CheckCircle2 size={14} className="text-[#2563EB]" />}
              </div>
              <p className="text-[10px] text-[#75777d]">{activeConvo.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#75777d] hover:text-[#2563EB] transition-colors"><Phone size={18} /></button>
            <button className="p-2 text-[#75777d] hover:text-[#2563EB] transition-colors"><Video size={18} /></button>
            <button className="p-2 text-[#75777d] hover:text-[#2563EB] transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-[#f2f4f6] text-[10px] font-bold text-[#c5c6cd] uppercase tracking-wider">Today</span>
          </div>
          {messageHistory.map((m) => (
            <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] group`}>
                <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  m.isMine 
                    ? 'bg-[#0A1628] text-white rounded-br-sm' 
                    : 'bg-[#f7f9fb] text-[#191c1e] border border-[#f2f4f6] rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
                <p className={`text-[9px] mt-1.5 font-medium ${m.isMine ? 'text-right text-[#c5c6cd]' : 'text-left text-[#c5c6cd]'}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-5 border-t border-[#f2f4f6]">
          <div className="flex items-center gap-3 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-2 hover:border-[#2563EB]/30 focus-within:border-[#2563EB]/30 transition-all">
            <button className="text-[#75777d] hover:text-[#2563EB] transition-colors"><Paperclip size={18} /></button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none text-xs py-2 focus:outline-none text-[#191c1e] font-medium"
            />
            <button className="bg-[#2563EB] text-white p-2 rounded-lg shadow-lg shadow-[#2563EB]/25 hover:scale-105 transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
