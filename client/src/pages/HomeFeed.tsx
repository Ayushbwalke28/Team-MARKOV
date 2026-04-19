import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ImageIcon, Send, CheckCircle2, X, ChevronLeft, ChevronRight, Pencil, Link2, Video } from 'lucide-react';
import api, { connectionApi, postApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type FeedPost = {
  id: string;
  text: string;
  createdAt: string;
  shareLink?: string;
  media?: string[];
  mediaUrl?: string;
  _count: { likes: number; comments: number };
  authorUser?: { id: string; name: string; verified?: boolean };
  authorCompany?: { id: string; name: string };
  authorName?: string;
  authorInitials?: string;
  liked: boolean;
  saved: boolean;
};

type CommentItem = {
  id: string;
  text: string;
  createdAt: string;
  user?: { id: string; name: string };
};

type SuggestedPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
  profile?: { about?: string };
};

type ToastItem = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type LightboxState = {
  postId: string;
  items: string[];
  index: number;
};

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const apiOrigin = (() => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return 'http://localhost:3001';
  }
})();

const normalizeMediaUrl = (value: unknown): string | null => {
  if (!value || typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${apiOrigin}${raw}`;
  }

  return `${apiOrigin}/${raw}`;
};

const extractMediaUrls = (p: any): string[] => {
  const bucket: unknown[] = [];

  if (Array.isArray(p.media)) {
    bucket.push(...p.media);
  }
  if (p.mediaUrl) {
    bucket.push(p.mediaUrl);
  }

  return bucket
    .map((item) => {
      if (typeof item === 'string') return normalizeMediaUrl(item);
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const candidate =
          (typeof obj.url === 'string' && obj.url) ||
          (typeof obj.secure_url === 'string' && obj.secure_url) ||
          (typeof obj.src === 'string' && obj.src);
        return normalizeMediaUrl(candidate);
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
};

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);

const toDisplayPost = (p: any): FeedPost => {
  const media = extractMediaUrls(p);

  return {
    ...p,
    media,
    _count: {
      likes: p._count?.likes ?? 0,
      comments: p._count?.comments ?? 0,
    },
    authorName: p.authorUser?.name || p.authorCompany?.name || 'Unknown',
    authorInitials: (p.authorUser?.name || p.authorCompany?.name || 'U').charAt(0).toUpperCase(),
    liked: false,
    saved: false,
  };
};

export default function HomeFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentItem[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastCounterRef = useRef(0);

  const showToast = (message: string, type: ToastItem['type'] = 'info') => {
    const id = ++toastCounterRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null);
        return;
      }

      if (event.key === 'ArrowRight') {
        setLightbox((prev) => {
          if (!prev || prev.items.length === 0) return prev;
          return {
            ...prev,
            index: (prev.index + 1) % prev.items.length,
          };
        });
        return;
      }

      if (event.key === 'ArrowLeft') {
        setLightbox((prev) => {
          if (!prev || prev.items.length === 0) return prev;
          return {
            ...prev,
            index: (prev.index - 1 + prev.items.length) % prev.items.length,
          };
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/feed');
      setPosts(res.data.data.map(toDisplayPost));
    } catch (err) {
      console.error('Failed to fetch feed', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await connectionApi.getSuggestions();
      setSuggestedPeople(data);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
      showToast('Could not load suggestions right now.', 'error');
    }
  };

  const resetComposeMedia = () => {
    setNewPostImage(null);
    if (newPostImagePreview) {
      URL.revokeObjectURL(newPostImagePreview);
    }
    setNewPostImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }

    setNewPostImage(file);
    if (newPostImagePreview) {
      URL.revokeObjectURL(newPostImagePreview);
    }
    setNewPostImagePreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    if (!newPost.trim()) {
      showToast('Write something before publishing.', 'info');
      return;
    }

    setIsPublishing(true);
    try {
      const createdPost = await postApi.create({ text: newPost, authorType: 'user' });

      let postWithMedia = createdPost;
      if (newPostImage) {
        postWithMedia = await postApi.uploadMedia(createdPost.id, newPostImage);
      }

      const created = toDisplayPost({
        ...postWithMedia,
        authorUser: postWithMedia.authorUser || {
          id: user?.id,
          name: user?.name,
          verified: user?.verified,
        },
      });

      setPosts([created, ...posts]);
      setNewPost('');
      resetComposeMedia();
      setComposeOpen(false);
      showToast('Post published successfully.', 'success');
    } catch (err) {
      console.error('Failed to publish post', err);
      showToast('Failed to publish post.', 'error');
    } finally {
      setIsPublishing(false);
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
      showToast('Could not update like right now.', 'error');
    }
  };
  const toggleSave = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  };

  const toggleComments = async (postId: string) => {
    const shouldOpen = !openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: shouldOpen }));

    if (!shouldOpen || commentsByPost[postId]) return;

    try {
      const comments = await postApi.getComments(postId);
      setCommentsByPost(prev => ({ ...prev, [postId]: comments }));
    } catch (err) {
      console.error('Failed to load comments', err);
      showToast('Failed to load comments.', 'error');
    }
  };

  const addComment = async (postId: string) => {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;

    try {
      const created = await postApi.addComment(postId, text);
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } }
        : p));
      showToast('Comment added.', 'success');
    } catch (err) {
      console.error('Failed to add comment', err);
      showToast('Could not add comment.', 'error');
    }
  };

  const handleShare = async (post: FeedPost) => {
    const shareUrl = post.shareLink || `${window.location.origin}/posts/${post.id}`;
    const shareText = `${post.authorName}: ${post.text}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Post from Team MARKOV',
          text: shareText,
          url: shareUrl,
        });
        showToast('Post shared.', 'success');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      showToast('Share link copied to clipboard.', 'success');
    } catch (err) {
      console.error('Failed to share post', err);
      showToast('Failed to share post.', 'error');
    }
  };

  const handleConnect = async (receiverId: string) => {
    try {
      await connectionApi.sendRequest(receiverId);
      setSuggestedPeople(prev => prev.filter(person => person.id !== receiverId));
      showToast('Connection request sent.', 'success');
    } catch (err) {
      console.error('Failed to send request', err);
      showToast('Could not send connection request.', 'error');
    }
  };

  const openLightbox = (postId: string, items: string[], index: number) => {
    if (!items.length) return;
    setLightbox({ postId, items, index });
  };

  const closeLightbox = () => setLightbox(null);

  const goNextMedia = () => {
    setLightbox((prev) => {
      if (!prev || prev.items.length === 0) return prev;
      return {
        ...prev,
        index: (prev.index + 1) % prev.items.length,
      };
    });
  };

  const goPreviousMedia = () => {
    setLightbox((prev) => {
      if (!prev || prev.items.length === 0) return prev;
      return {
        ...prev,
        index: (prev.index - 1 + prev.items.length) % prev.items.length,
      };
    });
  };

  const currentLightboxMedia = lightbox ? lightbox.items[lightbox.index] : null;

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-[min(90vw,340px)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-3 py-2 text-xs shadow-lg backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-card border-border text-foreground'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* ── Floating Action Button (FAB) ─────────────────────────── */}
      <button
        onClick={() => setComposeOpen(true)}
        className="fixed bottom-8 right-10 z-40 w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 hover:shadow-primary/60 active:scale-95 transition-all duration-200 group"
        title="Create a post"
        aria-label="Create post"
      >
        <Pencil size={26} className="group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* ── Compose Modal ────────────────────────────────────────── */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setComposeOpen(false); resetComposeMedia(); setNewPost(''); }}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-sm shrink-0 uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground capitalize">{user?.name || 'You'}</p>
                  <p className="text-[10px] text-muted-foreground">Share with your network</p>
                </div>
              </div>
              <button
                onClick={() => { setComposeOpen(false); resetComposeMedia(); setNewPost(''); }}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Share an insight, update or opportunity</p>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share an insight, update or opportunity..."
                rows={5}
                autoFocus
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />

              {/* Image Preview */}
              {newPostImagePreview && (
                <div className="mt-3 rounded-xl border border-border overflow-hidden bg-secondary relative group">
                  <img src={newPostImagePreview} alt="Selected media" className="max-h-52 w-full object-cover" />
                  <button
                    onClick={resetComposeMedia}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Attachments Row */}
              <div className="flex items-center gap-2 mt-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mr-1">Attach</p>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImagePick} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-semibold transition-all"
                >
                  <ImageIcon size={14} /> Photo
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-semibold transition-all">
                  <Video size={14} /> Video
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-semibold transition-all">
                  <Link2 size={14} /> Link
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-secondary/40">
              <p className="text-[10px] text-muted-foreground">
                {newPost.length > 0 ? `${newPost.length} characters` : 'Your post will be visible to your network'}
              </p>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !newPost.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Publishing...</>
                ) : (
                  <><Send size={14} /> Publish</>  
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto flex gap-8">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl">

        {/* Posts - no inline compose box, FAB handles it */}
        {posts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Pencil size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">Nothing in your feed yet</p>
            <p className="text-sm mt-1">Click the pencil button to share your first post!</p>
          </div>
        )}
        {/* Posts */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:shadow-foreground/5 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-xs shrink-0">{post.authorInitials}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground capitalize">{post.authorName}</p>
                      {post.authorUser?.verified && <CheckCircle2 size={14} className="text-primary fill-primary/10" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.authorCompany ? 'Company' : 'Professional'}</p>
                    <p className="text-[10px] text-muted-foreground/60">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-5">{post.text}</p>
              {!!post.media?.length && (
                <div className={`mb-5 grid gap-2 rounded-xl overflow-hidden border border-border bg-secondary p-2 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.media.map((mediaUrl, idx) => (
                    <button
                      key={`${post.id}-media-${idx}`}
                      type="button"
                      onClick={() => openLightbox(post.id, post.media || [], idx)}
                      className="rounded-lg overflow-hidden bg-black/5 cursor-zoom-in group relative"
                    >
                      {isVideoUrl(mediaUrl) ? (
                        <video
                          src={mediaUrl}
                          muted
                          playsInline
                          className="w-full max-h-96 object-cover bg-black"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={`Post media ${idx + 1}`}
                          className="w-full max-h-96 object-cover"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${post.liked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:bg-secondary'}`}>
                    <Heart size={15} className={post.liked ? 'fill-red-500' : ''} /> {post._count?.likes || 0}
                  </button>
                  <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                    <MessageCircle size={15} /> {post._count?.comments || 0}
                  </button>
                  <button onClick={() => handleShare(post)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                    <Share2 size={15} /> Share
                  </button>
                </div>
                <button onClick={() => toggleSave(post.id)} className={`p-1.5 rounded-lg transition-colors ${post.saved ? 'text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                  <Bookmark size={16} className={post.saved ? 'fill-primary' : ''} />
                </button>
              </div>
              {openComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-3 mb-3 max-h-52 overflow-auto pr-1 scrollbar-none">
                    {(commentsByPost[post.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No comments yet. Start the conversation.</p>
                    ) : (
                      (commentsByPost[post.id] || []).map((comment) => (
                        <div key={comment.id} className="bg-secondary rounded-lg px-3 py-2 border border-border">
                          <p className="text-[11px] font-semibold text-foreground">{comment.user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) => setCommentDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:brightness-90 transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-72">
        <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">People You May Know</h3>
          <div className="flex flex-col gap-4">
            {suggestedPeople.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-brand flex items-center justify-center text-surface-brand-foreground font-bold text-[10px] shrink-0 overflow-hidden">
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{p.profile?.about || 'Professional'}</p>
                </div>
                <button onClick={() => handleConnect(p.id)} className="text-[10px] font-bold text-primary border border-primary/30 px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-all">Connect</button>
              </div>
            ))}
            {suggestedPeople.length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center py-3 bg-secondary rounded-lg">No suggestions available right now.</p>
            )}
          </div>
        </div>
      </div>
      </div>

      {lightbox && currentLightboxMedia && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 text-white/90 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close media viewer"
          >
            <X size={20} />
          </button>

          {lightbox.items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPreviousMedia();
                }}
                className="absolute left-4 md:left-8 text-white/90 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous media"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNextMedia();
                }}
                className="absolute right-4 md:right-8 text-white/90 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next media"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="max-w-5xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideoUrl(currentLightboxMedia) ? (
              <video
                src={currentLightboxMedia}
                controls
                autoPlay
                className="w-full max-h-[82vh] object-contain rounded-xl bg-black"
              />
            ) : (
              <img
                src={currentLightboxMedia}
                alt="Expanded post media"
                className="w-full max-h-[82vh] object-contain rounded-xl"
              />
            )}
          </div>

          <div className="absolute bottom-4 text-white/90 text-xs">
            {lightbox.index + 1} / {lightbox.items.length}
          </div>
        </div>
      )}
    </>
  );
}
