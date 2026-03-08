import { useState } from "react";
import { useHabits, useCreateHabit, useUpdateHabit } from "@/hooks/use-habits";
import { format } from "date-fns";
import { Plus, Check, Loader2 } from "lucide-react";

const COMMON_HABITS = ["Meditation", "Exercise", "Sleep 8 hours", "Hydration", "Journaling", "Reading"];

export default function HabitTracker() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: habits, isLoading } = useHabits(todayStr);
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();
  const { mutate: updateHabit } = useUpdateHabit();

  const [newHabit, setNewHabit] = useState("");

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    createHabit({ type: newHabit.trim(), completed: false, date: todayStr });
    setNewHabit("");
  };

  const addCommonHabit = (type: string) => {
    createHabit({ type, completed: false, date: todayStr });
  };

  const toggleHabit = (id: number, currentStatus: boolean) => {
    updateHabit({ id, completed: !currentStatus });
  };

  const existingHabitTypes = habits?.map((h: any) => h.type) || [];
  const suggestedHabits = COMMON_HABITS.filter(h => !existingHabitTypes.includes(h));

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold">Habit Tracker</h1>
        <p className="text-muted-foreground mt-2 text-lg">Small daily actions lead to massive positive changes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
              Today's Goals
              <span className="text-sm font-medium bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                {format(new Date(), 'MMM do')}
              </span>
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
            ) : habits?.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-muted-foreground mb-4">No habits added for today yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {habits?.map((habit: any) => (
                  <div 
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, habit.completed)}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                      habit.completed 
                      ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800' 
                      : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        habit.completed ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {habit.completed && <Check className="w-5 h-5" />}
                      </div>
                      <span className={`text-lg font-medium ${habit.completed ? 'text-slate-500 line-through' : 'text-foreground'}`}>
                        {habit.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              placeholder="Type a custom habit..."
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-border bg-card focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none text-lg"
            />
            <button 
              type="submit"
              disabled={!newHabit.trim() || isCreating}
              className="px-6 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 font-bold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 bg-blue-50 dark:bg-slate-800/80 border-blue-100 dark:border-slate-700">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedHabits.map(h => (
                <button
                  key={h}
                  onClick={() => addCommonHabit(h)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> {h}
                </button>
              ))}
              {suggestedHabits.length === 0 && <p className="text-sm text-slate-500">You're tracking all standard habits!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
