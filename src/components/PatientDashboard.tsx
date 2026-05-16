import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Calendar, 
  Bell, 
  LogOut, 
  Heart, 
  Activity,
  ChevronRight,
  Clock,
  Search,
  Download,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';
import { Screen, AuthUser, clearAuthToken } from './Shared';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import DigitalPrescription from './DigitalPrescription';

export default function PatientDashboard({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user.patientId) {
        setLoading(false);
        return;
      }
      try {
        // Fetch Prescriptions
        const rxQ = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', user.patientId),
          orderBy('createdAt', 'desc')
        );
        const rxSnap = await getDocs(rxQ);
        setPrescriptions(rxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Reminders
        const remQ = query(
          collection(db, 'reminders'),
          where('patientId', '==', user.patientId),
          orderBy('createdAt', 'desc')
        );
        const remSnap = await getDocs(remQ);
        setReminders(remSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.patientId]);

  const handleLogout = () => {
    clearAuthToken();
    setScreen('LANDING');
    window.location.reload();
  };

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedRxId) {
    return <DigitalPrescription patientId={selectedRxId} onBack={() => setSelectedRxId(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-950 pb-20">
      {/* Header */}
      <header className="bg-zinc-950 text-white p-8 pb-20 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-serif text-xl font-bold shadow-lg shadow-red-600/20">D</div>
            <span className="font-serif text-xl font-bold tracking-tight">Dr. Sahab</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-zinc-950"></span>
            </button>
            <button onClick={handleLogout} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded text-[10px] font-bold uppercase tracking-widest border border-red-600/20">Health Locker Active</span>
            <span className="px-2 py-1 bg-white/5 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-widest border border-white/5">ID: {user.patientId || 'NEW'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-3">Welcome, {user.name?.split(' ')[0] || 'Guest'}</h1>
          <p className="text-zinc-400 font-medium max-w-md leading-relaxed text-sm md:text-base">Your secure digital vault for all prescriptions and clinical records.</p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-10 space-y-10 relative z-20 pb-10">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: prescriptions.length, icon: FileText, color: 'text-zinc-600', bg: 'bg-white' },
            { label: 'Active Meds', value: reminders.length, icon: Activity, color: 'text-red-600', bg: 'bg-white' },
            { label: 'Latest Visit', value: prescriptions.length > 0 ? 'Today' : 'None', icon: Clock, color: 'text-blue-600', bg: 'bg-white' },
            { label: 'Health Score', value: 'Stable', icon: Heart, color: 'text-emerald-500', bg: 'bg-white' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${stat.bg} p-5 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col items-start gap-2`}
            >
              <stat.icon size={18} className={stat.color} />
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-serif font-black text-zinc-950">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search prescriptions by diagnosis or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold shadow-xl shadow-zinc-200/30 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Prescription Locker Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center gap-2 italic">
              <ShieldCheck size={18} className="text-red-600" /> Digital Records Locker
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{filteredPrescriptions.length} Records found</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-[2.5rem]"></div>
              ))}
            </div>
          ) : filteredPrescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredPrescriptions.map((rx, idx) => (
                  <motion.div 
                    key={rx.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedRxId(rx.id)}
                    className="bg-white p-7 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:shadow-red-600/5 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                        <Download size={16} />
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors border border-zinc-100">
                        <FileText size={24} />
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-widest border border-emerald-100">Verified</span>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                          {rx.createdAt?.toDate ? new Date(rx.createdAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-serif font-black mb-2 text-zinc-950 leading-tight group-hover:text-red-600 transition-colors">
                      {rx.diagnosis || 'Clinical Consultation'}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-6 text-zinc-500">
                      <Stethoscope size={14} className="text-red-600" />
                      <p className="text-xs font-bold uppercase tracking-widest">Dr. {rx.doctorName || 'Sahab'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-zinc-50 text-[10px] font-bold text-zinc-500 rounded-lg border border-zinc-100">Prescription Record</span>
                      <span className="px-3 py-1 bg-zinc-50 text-[10px] font-bold text-zinc-500 rounded-lg border border-zinc-100 italic">#{rx.id.slice(0, 6)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 p-20 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200/50">
                <FileText size={32} className="text-zinc-200" />
              </div>
              <h3 className="text-lg font-serif font-bold text-zinc-950 mb-1">Your Locker is Empty</h3>
              <p className="text-sm text-zinc-400 font-medium">Once your doctor issues a prescription, it will appear here automatically.</p>
            </div>
          )}
        </section>

        {/* Help & Support Card */}
        <div className="bg-zinc-950 p-8 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">Need a copy of your records?</h3>
              <p className="text-zinc-500 text-sm font-medium">You can download and share your medical documents securely with other providers.</p>
            </div>
            <button className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
