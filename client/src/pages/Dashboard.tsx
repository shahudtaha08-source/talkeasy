import { useUser } from "@/hooks/use-user";
import { useMoods } from "@/hooks/use-moods";
import { useHabits } from "@/hooks/use-habits";
import { format } from "date-fns";
import { Smile, MessageCircle, ArrowRight, Activity, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: moods } = useMoods();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: habits } = useHabits(todayStr);

  const todayMood = moods?.find((m: any) => m.date === todayStr);
  const completedHabits = habits?.filter((h: any) => h.completed).length || 0;
  const totalHabits = habits?.length || 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display text-slate-900 dark:text-white">
            {greeting()}, {user?.firstName || 'Friend'}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Here is your daily wellness overview.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-border">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="font-medium">{format(new Date(), 'EEEE, MMMM do')}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Chat Card */}
        <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-teal-900/20 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Need to talk?</h2>
            <p className="text-teal-50 mb-6 max-w-md">Your AI therapist is here to listen, support, and guide you through whatever is on your mind today.</p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:gap-3">
              Start Conversation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <MessageCircle className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-teal-400/30 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Today's Mood Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between hover-lift">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Today's Mood</h3>
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                <Smile className="w-5 h-5" />
              </div>
            </div>
            {todayMood ? (
              <div>
                <p className="text-3xl font-display font-bold text-slate-800 dark:text-white capitalize">{todayMood.mood}</p>
                {todayMood.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">"{todayMood.notes}"</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">You haven't logged your mood today.</p>
            )}
          </div>
          {!todayMood && (
            <Link href="/mood" className="mt-4 text-teal-600 font-semibold hover:underline flex items-center gap-1">
              Log it now <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Progress */}
        <div className="glass-card rounded-3xl p-6 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Daily Habits
            </h3>
            <Link href="/habits" className="text-sm text-teal-600 font-medium hover:underline">View all</Link>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-600 dark:text-slate-300">Progress</span>
              <span className="font-bold text-teal-600">{completedHabits} / {totalHabits} completed</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {habits?.slice(0, 3).map((habit: any) => (
              <div key={habit.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${habit.completed ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300'}`}>
                  {habit.completed && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className={`font-medium ${habit.completed ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{habit.type}</span>
              </div>
            ))}
            {totalHabits === 0 && (
              <p className="text-muted-foreground text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">No habits tracked today.</p>
            )}
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
          <svg className="w-10 h-10 text-blue-200 dark:text-blue-900/50 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
          <p className="text-xl md:text-2xl font-display font-medium text-slate-800 dark:text-slate-200 italic mb-4">
            "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity."
          </p>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">— TalkEasy</p>
        </div>
      </div>
    </div>
  );
}
