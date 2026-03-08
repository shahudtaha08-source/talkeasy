import { useMoods } from "@/hooks/use-moods";
import { useHabits } from "@/hooks/use-habits";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { format, subDays, parseISO } from "date-fns";

export default function Statistics() {
  const { data: moods } = useMoods();
  // Fetching all habits to compute stats - passing no date fetches all.
  const { data: habits } = useHabits();

  // Process Mood Data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
  
  const moodScoreMap: Record<string, number> = { "Happy": 4, "Neutral": 3, "Stressed": 2, "Sad": 1 };
  
  const moodData = last7Days.map(date => {
    const dayMood = moods?.find((m: any) => m.date === date);
    return {
      date: format(parseISO(date), 'MMM dd'),
      score: dayMood ? moodScoreMap[dayMood.mood] : null,
      moodName: dayMood?.mood || 'None'
    };
  });

  // Process Habit Data
  const habitCompletionCounts: Record<string, { total: number, completed: number }> = {};
  habits?.forEach((h: any) => {
    if (!habitCompletionCounts[h.type]) {
      habitCompletionCounts[h.type] = { total: 0, completed: 0 };
    }
    habitCompletionCounts[h.type].total++;
    if (h.completed) habitCompletionCounts[h.type].completed++;
  });

  const habitData = Object.entries(habitCompletionCounts).map(([name, stats]) => ({
    name,
    rate: Math.round((stats.completed / stats.total) * 100)
  }));

  const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-display font-bold">Statistics & Insights</h1>
        <p className="text-muted-foreground mt-2 text-lg">Visualize your mental wellness journey over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trend Chart */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6">Mood Trend (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} stroke="#64748b" tickFormatter={(val) => {
                  if(val===4) return 'Happy';
                  if(val===3) return 'Neutral';
                  if(val===2) return 'Stressed';
                  if(val===1) return 'Sad';
                  return '';
                }} tick={{fontSize: 12}} width={70} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [props.payload.moodName, "Mood"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }} 
                  connectNulls 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit Completion Chart */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6">Habit Completion Rates</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fontSize: 12}} width={100} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value}%`, "Completion Rate"]}
                />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={24}>
                  {habitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
