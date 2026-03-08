import { useState, useEffect } from "react";
import { useUser, useUpdateUser } from "@/hooks/use-user";
import { Loader2, User as UserIcon, Globe, Clock, Check } from "lucide-react";

export default function Settings() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateUser, isPending, isSuccess } = useUpdateUser();

  const [ageGroup, setAgeGroup] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");

  useEffect(() => {
    if (user) {
      setAgeGroup(user.ageGroup || "");
      setPreferredLanguage(user.preferredLanguage || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ ageGroup, preferredLanguage });
  };

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin w-8 h-8 text-teal-600"/></div>;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your personal information and preferences.</p>
      </div>

      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white shadow-lg overflow-hidden">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold">{user?.firstName?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" /> Age Group
            </label>
            <select 
              value={ageGroup} 
              onChange={e => setAgeGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
            >
              <option value="Teen">Teen (13-19)</option>
              <option value="Young Adult">Young Adult (20-35)</option>
              <option value="Middle Age">Middle Age (36-55)</option>
              <option value="Senior">Senior (55+)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" /> Preferred Language
            </label>
            <select 
              value={preferredLanguage} 
              onChange={e => setPreferredLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={isPending || (ageGroup === user?.ageGroup && preferredLanguage === user?.preferredLanguage)}
              className="px-8 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              Save Changes
            </button>
            {isSuccess && <span className="text-green-600 flex items-center gap-1 font-medium"><Check className="w-5 h-5"/> Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
