import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ImageIcon, Send, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const suggestedPeople = [
  { name: 'Lena Kowalski', role: 'Design Systems @ Airbnb', avatar: 'LK', mutual: 14 },
  { name: 'Marcus Rivera', role: 'Product Lead @ Figma', avatar: 'MR', mutual: 8 },
  { name: 'Aisha Patel', role: 'Data Science @ Netflix', avatar: 'AP', mutual: 22 },
];

export default function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/feed');
      setPosts(res.data.data.map((p: any) => ({
        ...p,
        authorName: p.authorUser?.name || p.authorCompany?.name || 'Unknown',
        authorInitials: (p.authorUser?.name || p.authorCompany?.name || 'U').charAt(0).toUpperCase(),
        liked: false, // In a real app, backend should return this
        saved: false
      })));
    } catch (err) {
      console.error('Failed to fetch feed', err);
    }
  };

  const handlePublish = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await api.post('/posts', { text: newPost, authorType: 'user' });
      const created = {
        ...res.data,
        authorName: user?.name,
        authorInitials: user?.name?.charAt(0).toUpperCase() || 'U',
        liked: false,
        saved: false
      };
      setPosts([created, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Failed to publish post', err);
    }
  };

  const toggleLike = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, _count: { ...p._count, likes: p.liked ? p._count.likes - 1 : p._count.likes + 1 } } : p));
    
    try {
      if (post.liked) {
        await api.delete(`/posts/${id}/like`);
      } else {
        await api.post(`/posts/${id}/like`);
      }
    } catch (err) {
      // Revert on failure
      setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: post.liked, _count: { ...p._count, likes: post._count.likes } } : p));
    }
  };
  const toggleSave = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-8">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl">
        {/* Compose Box */}
        <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase">{user?.name?.charAt(0) || 'U'}</div>
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
                <button onClick={handlePublish} className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#1d4ed8] transition-colors flex items-center gap-1.5 shadow-sm">
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
                  <div className="w-11 h-11 rounded-full bg-[#0A1628] flex items-center justify-center text-white font-bold text-xs shrink-0">{post.authorInitials}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#191c1e] capitalize">{post.authorName}</p>
                      {post.authorUser?.verified && <CheckCircle2 size={14} className="text-[#2563EB] fill-[#2563EB]/10" />}
                    </div>
                    <p className="text-xs text-[#75777d]">{post.authorCompany ? 'Company' : 'Professional'}</p>
                    <p className="text-[10px] text-[#c5c6cd]">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#75777d]"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-[#191c1e] leading-relaxed whitespace-pre-line mb-5">{post.text}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#f2f4f6]">
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${post.liked ? 'text-red-500 bg-red-50' : 'text-[#75777d] hover:bg-[#f2f4f6]'}`}>
                    <Heart size={15} className={post.liked ? 'fill-red-500' : ''} /> {post._count?.likes || 0}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#75777d] hover:bg-[#f2f4f6] transition-colors">
                    <MessageCircle size={15} /> {post._count?.comments || 0}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#75777d] hover:bg-[#f2f4f6] transition-colors">
                    <Share2 size={15} /> 0
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
