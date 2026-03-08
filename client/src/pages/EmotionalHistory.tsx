import { useEmotionalHistory } from "@/hooks/use-history";
import { format, parseISO } from "date-fns";
import { Bot, Smile, CalendarDays, Loader2 } from "lucide-react";

export default function EmotionalHistory() {
  const { data: history, isLoading } = useEmotionalHistory();

  // Group by date
  const grouped = history?.reduce((acc: any, item: any) => {
    const d = item.date.split('T')[0];
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const dates = grouped ? Object.keys(grouped).sort().reverse() : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-display font-bold">Emotional Timeline</h1>
        <p className="text-muted-foreground mt-2 text-lg">A chronological view of your moods and AI therapy insights.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>
      ) : dates.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl">
          <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-500 font-medium">No history recorded yet.</p>
        </div>
      ) : (
        <div className="relative border-l-4 border-teal-100 dark:border-teal-900/50 ml-6 pl-8 space-y-12 pb-12">
          {dates.map(date => (
            <div key={date} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[45px] bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-4 border-background">
                {format(parseISO(date), 'd')}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 mt-1">
                {format(parseISO(date), 'MMMM yyyy')}
              </h3>

              <div className="space-y-4">
                {grouped[date].map((item: any) => (
                  <div key={`${item.type}-${item.id}`} className="glass-card p-6 rounded-2xl hover-lift">
                    {item.type === 'mood' ? (
                      <div>
                        <div className="flex items-center gap-2 text-teal-600 font-semibold mb-2">
                          <Smile className="w-5 h-5" /> Self-Reported Mood
                        </div>
                        <p className="text-2xl font-display mb-2">{item.value}</p>
                        {item.notes && <p className="text-slate-600 dark:text-slate-300 italic">"{item.notes}"</p>}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
                          <Bot className="w-5 h-5" /> AI Therapist Detected
                        </div>
                        <p className="text-xl font-display mb-2 capitalize">{item.value}</p>
                        {item.suggestion && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mt-3 border border-blue-100 dark:border-blue-900/50">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">AI Suggestion</p>
                            <p className="text-slate-700 dark:text-slate-300 text-sm">{item.suggestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
