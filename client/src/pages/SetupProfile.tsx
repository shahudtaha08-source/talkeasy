import { useState } from "react";
import { useUser, useUpdateUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function SetupProfile() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [, setLocation] = useLocation();

  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || "English");

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal-600 w-8 h-8"/></div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageGroup || !preferredLanguage) return;

    updateUser({ ageGroup, preferredLanguage }, {
      onSuccess: () => {
        setLocation("/dashboard");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-2">Welcome to TalkEasy</h1>
          <p className="text-slate-500">Let's personalize your experience before we begin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">What is your age group?</label>
            <select 
              value={ageGroup} 
              onChange={e => setAgeGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              required
            >
              <option value="" disabled>Select age group</option>
              <option value="Teen">Teen (13-19)</option>
              <option value="Young Adult">Young Adult (20-35)</option>
              <option value="Middle Age">Middle Age (36-55)</option>
              <option value="Senior">Senior (55+)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Preferred Language</label>
            <select 
              value={preferredLanguage} 
              onChange={e => setPreferredLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              required
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isPending || !ageGroup}
            className="w-full py-4 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
