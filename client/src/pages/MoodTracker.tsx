import { useState } from "react";
import { useMoods, useCreateMood } from "@/hooks/use-moods";
import { format } from "date-fns";
import { Smile, Frown, Meh, Angry, Loader2, Check } from "lucide-react";

const MOODS = [
  { value: "Happy", icon: Smile, color: "text-green-500", bg: "bg-green-100 border-green-200 hover:bg-green-200" },
  { value: "Neutral", icon: Meh, color: "text-blue-500", bg: "bg-blue-100 border-blue-200 hover:bg-blue-200" },
  { value: "Sad", icon: Frown, color: "text-indigo-500", bg: "bg-indigo-100 border-indigo-200 hover:bg-indigo-200" },
  { value: "Stressed", icon: Angry, color: "text-rose-500", bg: "bg-rose-100 border-rose-200 hover:bg-rose-200" },
];

export default function MoodTracker() {
  const { data: moods } = useMoods();
  const { mutate: logMood, isPending } = useCreateMood();
  
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayMood = moods?.find((m: any) => m.date === todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    logMood({ mood: selectedMood, notes, date: todayStr });
    setNotes("");
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground mt-2 text-lg">Check in with yourself. How are you feeling today?</p>
      </div>

      {todayMood ? (
        <div className="glass-card rounded-3xl p-8 text-center bg-gradient-to-b from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 border-teal-100">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You've logged your mood today!</h2>
          <p className="text-xl mb-4 font-display">Feeling <strong className="capitalize text-teal-600">{todayMood.mood}</strong></p>
          {todayMood.notes && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl inline-block max-w-lg shadow-sm border border-border">
              <p className="italic text-slate-600 dark:text-slate-300">"{todayMood.notes}"</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {MOODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setSelectedMood(m.value)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${m.bg} ${
                  selectedMood === m.value ? 'ring-4 ring-offset-2 ring-teal-500 scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <m.icon className={`w-12 h-12 mb-3 ${m.color}`} />
                <span className="font-bold text-slate-800">{m.value}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-semibold">Any thoughts? (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What made you feel this way? Or just journal your day..."
              className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedMood || isPending}
            className="w-full mt-6 py-4 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-teal-600/30 flex justify-center items-center gap-2 hover:-translate-y-1"
          >
            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Daily Mood
          </button>
        </form>
      )}

      {/* History Preview */}
      <div className="mt-12">
        <h3 className="text-2xl font-display font-bold mb-6">Recent Moods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moods?.slice(0, 6).map((m: any) => {
            const moodConfig = MOODS.find(x => x.value === m.mood) || MOODS[0];
            const Icon = moodConfig.icon;
            return (
              <div key={m.id} className="glass-card p-4 rounded-2xl flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${moodConfig.bg}`}>
                  <Icon className={`w-6 h-6 ${moodConfig.color}`} />
                </div>
                <div>
                  <p className="font-bold">{m.mood}</p>
                  <p className="text-xs text-muted-foreground mb-1">{format(new Date(m.date), 'MMM do, yyyy')}</p>
                  {m.notes && <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{m.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
