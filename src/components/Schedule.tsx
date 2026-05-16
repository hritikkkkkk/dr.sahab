import { Calendar, Clock, Plus } from 'lucide-react';
import { Screen, AuthUser } from './Shared';

export default function Schedule({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-5xl font-medium tracking-tight mb-2">
            Clinical <span className="font-bold text-black">Schedule</span>
          </h2>
          <p className="text-zinc-500 font-medium text-lg">Manage your upcoming appointments and follow-ups.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Plus size={16} /> New Appointment
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-zinc-100 shadow-sm min-h-[400px]">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Calendar size={48} className="text-red-600 opacity-80" />
        </div>
        <h3 className="font-serif text-2xl font-bold mb-2">No Appointments Today</h3>
        <p className="text-zinc-500 max-w-md text-center mb-8">Your clinical schedule is clear for today. Any newly booked appointments or follow-ups will appear here.</p>
        
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-zinc-50 border border-zinc-200 text-zinc-950 rounded-xl font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2">
            <Clock size={18} /> View Past
          </button>
          <button 
            onClick={() => setScreen('NEW_PRESCRIPTION')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-xl hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
