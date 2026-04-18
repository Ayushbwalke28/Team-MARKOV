import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ImageIcon, Send, CheckCircle2 } from 'lucide-react';

const feedPosts = [
  { id: 1, author: 'Priya Sharma', role: 'VP Engineering @ Vertex AI Labs', avatar: 'PS', time: '2h', verified: true,
    content: 'Excited to announce our team just shipped a new real-time inference engine that processes ML predictions in under 50ms. This was a 6-month journey involving edge deployment with ONNX runtime. Proud of the incredible team effort! 🚀',
    likes: 234, comments: 42, shares: 18, liked: false, saved: false },
  { id: 2, author: 'Rahul Mehta', role: 'Founder & CEO @ GreenScale Energy', avatar: 'RM', time: '4h', verified: true,
    content: 'We just closed our Series B at $45M led by Sequoia Capital. The clean energy space is booming, and we are positioned to accelerate the transition to sustainable infrastructure. Looking for senior engineers and product managers to join us!',
    likes: 892, comments: 156, shares: 87, liked: true, saved: true },
  { id: 3, author: 'Sarah Jenkins', role: 'Angel Investor & Board Advisor', avatar: 'SJ', time: '6h', verified: true,
    content: 'After reviewing 200+ pitch decks this quarter, here are the top 3 things that make founders stand out:\n\n1. Clear unit economics from day one\n2. A distribution strategy beyond "we\'ll go viral"\n3. Genuine domain expertise, not just market research\n\nWhat would you add to this list?',
    likes: 1247, comments: 328, shares: 203, liked: false, saved: false },
  { id: 4, author: 'David Kim', role: 'Senior Architect @ CloudMesh Network', avatar: 'DK', time: '8h', verified: false,
    content: 'Just published a deep-dive article on event-driven architectures for multi-region deployments. Covers patterns for handling eventual consistency, saga orchestration, and dead-letter queue strategies. Link in comments!',
    likes: 156, comments: 23, shares: 45, liked: false, saved: false },
];

const suggestedPeople = [
  { name: 'Lena Kowalski', role: 'Design Systems @ Airbnb', avatar: 'LK', mutual: 14 },
  { name: 'Marcus Rivera', role: 'Product Lead @ Figma', avatar: 'MR', mutual: 8 },
  { name: 'Aisha Patel', role: 'Data Science @ Netflix', avatar: 'AP', mutual: 22 },
];

export default function HomeFeed() {
  const [posts, setPosts] = useState(feedPosts);
  const [newPost, setNewPost] = useState('');

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };
  const toggleSave = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-8">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl">
        {/* Compose Box */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shrink-0">JD</div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an insight, update, or opportunity..."
                rows={3}
                className="w-full bg-[#f7f9fb] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 border border-[#e0e3e5] focus:border-[#2563EB]/30"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#f2f4f6] text-[#75777d] transition-colors"><ImageIcon size={18} /></button>
                </div>
                <button className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#1d4ed8] transition-colors flex items-center gap-1.5 shadow-sm">
                  <Send size={14} /> Publish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-[#e0e3e5] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shrink-0">{post.avatar}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#191c1e]">{post.author}</p>
                      {post.verified && <CheckCircle2 size={14} className="text-[#2563EB] fill-[#2563EB]/10" />}
                    </div>
                    <p className="text-xs text-[#75777d]">{post.role}</p>
                    <p className="text-[10px] text-[#c5c6cd]">{post.time} ago</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#75777d]"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-[#191c1e] leading-relaxed whitespace-pre-line mb-5">{post.content}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#f2f4f6]">
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${post.liked ? 'text-red-500 bg-red-50' : 'text-[#75777d] hover:bg-[#f2f4f6]'}`}>
                    <Heart size={15} className={post.liked ? 'fill-red-500' : ''} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#75777d] hover:bg-[#f2f4f6] transition-colors">
                    <MessageCircle size={15} /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#75777d] hover:bg-[#f2f4f6] transition-colors">
                    <Share2 size={15} /> {post.shares}
                  </button>
                </div>
                <button onClick={() => toggleSave(post.id)} className={`p-1.5 rounded-lg transition-colors ${post.saved ? 'text-[#2563EB]' : 'text-[#75777d] hover:bg-[#f2f4f6]'}`}>
                  <Bookmark size={16} className={post.saved ? 'fill-[#2563EB]' : ''} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-72">
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 sticky top-24">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#45474c] mb-4">People You May Know</h3>
          <div className="flex flex-col gap-4">
            {suggestedPeople.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-[10px] shrink-0">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-[10px] text-[#75777d] truncate">{p.role}</p>
                  <p className="text-[10px] text-[#c5c6cd]">{p.mutual} mutual</p>
                </div>
                <button className="text-[10px] font-bold text-[#2563EB] border border-[#2563EB]/30 px-3 py-1 rounded-full hover:bg-[#2563EB] hover:text-white transition-all">Connect</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
