import { Leaf, Shield, Heart, Sparkles } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-950 dark:to-teal-950 flex flex-col">
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-lg">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-800 dark:text-white">TalkEasy</span>
        </div>
        <button 
          onClick={handleLogin}
          className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-semibold shadow-sm hover:shadow-md transition-all border border-teal-100 dark:border-teal-900"
        >
          Log In
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mt-[-10vh]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium mb-8 text-sm border border-teal-200 dark:border-teal-800">
          <Sparkles className="w-4 h-4" />
          Your Safe Space for Mental Wellness
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white leading-tight mb-6">
          Find clarity through <br className="hidden md:block"/>
          <span className="text-gradient">compassionate AI conversation.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed">
          TalkEasy combines AI therapy chat, mood tracking, and habit building to help you understand your emotions and foster a healthier mind every single day.
        </p>

        <button 
          onClick={handleLogin}
          className="px-8 py-4 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg shadow-xl shadow-teal-600/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
        >
          Get Started for Free
        </button>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="glass-card p-6 rounded-2xl">
            <Heart className="w-10 h-10 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Therapist Chat</h3>
            <p className="text-muted-foreground">A non-judgmental space to express your feelings and get actionable advice.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <Shield className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Private & Secure</h3>
            <p className="text-muted-foreground">Your emotional history and daily habits are kept entirely private.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <Leaf className="w-10 h-10 text-teal-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Holistic Growth</h3>
            <p className="text-muted-foreground">Track moods, build positive habits, and see your progress over time.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
