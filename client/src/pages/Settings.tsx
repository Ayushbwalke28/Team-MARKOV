import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Globe, CreditCard, ChevronRight, LogOut, Camera } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const sections = [
  { icon: User, label: 'Personal Information', desc: 'Update your profile photo, bio, and contact details' },
  { icon: Shield, label: 'Security & Verification', desc: 'Manage your ledger verification status and 2FA' },
  { icon: Bell, label: 'Notifications', desc: 'Choose what updates you want to receive' },
  { icon: Globe, label: 'Privacy & Visibility', desc: 'Control who can see your activity and profile' },
  { icon: CreditCard, label: 'Billing & Subscriptions', desc: 'Manage your SyncUp Pro enterprise plan' },
];

type ProfileDetails = {
  fullName?: string | null;
  about?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
};

type ProfileMeResponse = {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    verified: boolean;
  };
  profile?: ProfileDetails | null;
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get<ProfileMeResponse>('/profile/me');
        setProfile(data?.profile ?? null);
      } catch (error) {
        setProfile(null);
      }
    };

    loadProfile();
  }, []);

  const displayName = profile?.fullName || user?.name || 'User';
  const initial = displayName.charAt(0).toUpperCase() || 'U';
  const tagline = profile?.about || (user?.roles?.includes('company_owner') ? 'Company Owner' : 'Verified Professional');
  const joinedText = useMemo(() => {
    if (!profile?.createdAt) return 'Joined recently';
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return 'Joined recently';
    return `Joined ${date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;
  }, [profile?.createdAt]);

  const handleLogoutAll = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }

    setAvatarError(null);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<{ avatarUrl: string }>('/profile/me/avatar', formData);
      setProfile((prev) => ({ ...(prev || {}), avatarUrl: data.avatarUrl }));
    } catch (error) {
      setAvatarError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#0A1628]">Settings</h2>
        <p className="text-sm text-[#75777d] mt-1">Manage your account preferences and professional visibility.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-sm">
        {/* Profile Section */}
        <div className="p-8 border-b border-[#f2f4f6] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarPick}
              />
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#0A1628] flex items-center justify-center text-white text-3xl font-black shadow-lg uppercase">
                  {initial}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#2563EB] rounded-lg text-white shadow-lg border-2 border-white hover:scale-110 transition-transform"
                title="Upload profile photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-[#191c1e]">{displayName}</h3>
                <span className="bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={10} fill="currentColor" /> {user?.verified ? 'Verified Human' : 'Unverified'}
                </span>
              </div>
              <p className="text-sm text-[#75777d]">{tagline}</p>
              <p className="text-xs text-[#c5c6cd] mt-2 italic">{joinedText} • Ledger ID: {user?.id?.slice(0, 8) || 'N/A'}</p>
              {isUploadingAvatar && <p className="text-xs text-[#2563EB] mt-1">Uploading avatar...</p>}
              {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#191c1e] text-xs font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            View Public Profile
          </button>
        </div>

        {/* Setting Items */}
        <div className="divide-y divide-[#f2f4f6]">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.label} className="w-full flex items-center justify-between p-6 hover:bg-[#fcfdfe] transition-colors group text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f7f9fb] flex items-center justify-center text-[#45474c] group-hover:bg-[#2563EB]/10 group-hover:text-[#2563EB] transition-colors">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#191c1e]">{s.label}</h4>
                    <p className="text-xs text-[#75777d] mt-0.5">{s.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#c5c6cd] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-6 bg-[#fef2f2]/30">
          <button
            type="button"
            onClick={handleLogoutAll}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 font-bold text-sm transition-colors"
          >
            <LogOut size={18} /> Sign Out of All Devices
          </button>
        </div>
      </div>

      <div className="bg-[#0A1628] rounded-2xl p-8 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB] rounded-full blur-[60px] opacity-20" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">SyncUp Pro Enterprise</h3>
          <p className="text-white/50 text-xs">Your enterprise subscription expires in 284 days.</p>
        </div>
        <button className="px-6 py-2.5 bg-white text-[#0A1628] rounded-lg text-xs font-black shadow-lg hover:scale-105 transition-all relative z-10">
          Manage Plan
        </button>
      </div>
    </div>
  );
}
