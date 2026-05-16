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
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Thermometer,
  Wind
} from 'lucide-react';
import { Screen, AuthUser, clearAuthToken } from './Shared';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import DigitalPrescription from './DigitalPrescription';

export default function PatientDashboard({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [activeMeds, setActiveMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);
  const [view, setView] = useState<'LOCKER' | 'DOSAGE' | 'APPOINTMENT' | 'VITALS'>('LOCKER');

  // Appointment State
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [booking, setBooking] = useState(false);

  // Vitals State
  const [vitals, setVitals] = useState({ temp: '', bp: '', heartRate: '', spO2: '' });
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

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
        const rxList = rxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrescriptions(rxList);

        // Fetch Active Meds
        if (rxList.length > 0) {
          const latestRxId = rxList[0].id;
          const medsQ = query(
            collection(db, 'prescription_items'),
            where('prescriptionId', '==', latestRxId)
          );
          const medsSnap = await getDocs(medsQ);
          setActiveMeds(medsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), taken: false })));
        }

        // Fetch Vitals History
        const vitalsQ = query(
          collection(db, 'vitals'),
          where('patientId', '==', user.patientId),
          orderBy('createdAt', 'desc')
        );
        const vitalsSnap = await getDocs(vitalsQ);
        setVitalsHistory(vitalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

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

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate || !appointmentReason) return;
    setBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.patientId,
        patientName: user.name,
        date: appointmentDate,
        reason: appointmentReason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Appointment request sent successfully!');
      setAppointmentDate('');
      setAppointmentReason('');
      setView('LOCKER');
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newVital = {
        ...vitals,
        patientId: user.patientId,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'vitals'), newVital);
      setVitalsHistory([newVital, ...vitalsHistory]);
      setVitals({ temp: '', bp: '', heartRate: '', spO2: '' });
      alert('Vitals logged successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedRxId) {
    return <DigitalPrescription patientId={selectedRxId} onBack={() => setSelectedRxId(null)} />;
  }

  const renderVitals = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Log Vitals Form */}
        <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/20">
          <h2 className="text-xl font-serif font-black mb-6">Log Daily Vitals</h2>
          <form onSubmit={handleLogVitals} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Temperature (°F)</label>
                <input 
                  type="text" placeholder="98.6" 
                  value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/10 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Blood Pressure</label>
                <input 
                  type="text" placeholder="120/80" 
                  value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-600/10 outline-none" 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-zinc-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">Save Daily Check</button>
          </form>
        </div>

        {/* Vitals History */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 ml-2">Recent Logs</h2>
          {vitalsHistory.map((v, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Thermometer size={20} />
                </div>
                <div>
                  <p className="font-bold text-zinc-950">{v.temp || '--'} °F • {v.bp || '--'}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logged {v.createdAt?.toDate ? new Date(v.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                </div>
              </div>
              <Activity size={16} className="text-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointment = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/40">
        <div className="w-16 h-16 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg shadow-red-600/20">
          <Calendar size={32} />
        </div>
        <h2 className="text-3xl font-serif font-black text-zinc-950 mb-2">Book Appointment</h2>
        <p className="text-zinc-400 text-sm font-medium mb-8">Request a follow-up or a new consultation with Dr. Sahab.</p>
        
        <form onSubmit={handleBookAppointment} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Preferred Date & Time</label>
            <input 
              type="datetime-local" 
              value={appointmentDate}
              onChange={e => setAppointmentDate(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 outline-none"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Reason for Visit</label>
            <textarea 
              placeholder="E.g., Monthly checkup, Persistent cough..."
              value={appointmentReason}
              onChange={e => setAppointmentReason(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 outline-none h-32 resize-none"
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={booking}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
          >
            {booking ? 'Sending Request...' : 'Send Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDosageTimeline = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-serif font-black text-zinc-950">Medication Timeline</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{activeMeds.filter(m => m.taken).length}/{activeMeds.length} Taken</span>
        </div>
      </div>

      {activeMeds.length === 0 ? (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 p-16 rounded-[3rem] text-center">
          <AlertCircle size={40} className="text-zinc-200 mx-auto mb-4" />
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">No active medications scheduled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {['1-0-0', '0-1-0', '0-0-1'].map((timeSlot) => {
            const slotMeds = activeMeds.filter(m => {
               if (timeSlot === '1-0-0') return m.frequency?.includes('1-0-0') || m.frequency?.includes('1-1-1') || m.frequency?.includes('1-0-1');
               if (timeSlot === '0-1-0') return m.frequency?.includes('0-1-0') || m.frequency?.includes('1-1-1');
               if (timeSlot === '0-0-1') return m.frequency?.includes('0-0-1') || m.frequency?.includes('1-1-1') || m.frequency?.includes('1-0-1');
               return false;
            });

            if (slotMeds.length === 0) return null;

            return (
              <div key={timeSlot} className="relative pl-10">
                <div className="absolute left-4 top-2 bottom-0 w-0.5 bg-zinc-100"></div>
                <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-zinc-950 border-4 border-white shadow-sm"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">
                  {timeSlot === '1-0-0' ? '🌅 Morning' : timeSlot === '0-1-0' ? '☀️ Afternoon' : '🌙 Night'}
                </h3>

                <div className="grid gap-4">
                  {slotMeds.map((med) => (
                    <motion.div 
                      key={med.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {}}
                      className="p-5 rounded-[2rem] border transition-all bg-white border-zinc-100 shadow-xl shadow-zinc-200/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 text-zinc-400">
                          <Activity size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-950">{med.drugName}</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{med.dosage} • {med.instructions || 'After Food'}</p>
                        </div>
                      </div>
                      <CheckCircle2 size={24} className="text-zinc-100" />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-950 pb-20">
      {/* Header */}
      <header className="bg-zinc-950 text-white p-8 pb-24 rounded-b-[3rem] relative overflow-hidden">
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
            <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded text-[10px] font-bold uppercase tracking-widest border border-red-600/20">Patient Portal</span>
            <span className="px-2 py-1 bg-white/5 text-zinc-500 rounded text-[10px] font-bold uppercase tracking-widest border border-white/5">ID: {user.patientId || 'NEW'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-3 italic">Hello, {user.name?.split(' ')[0] || 'Guest'}</h1>
          <p className="text-zinc-400 font-medium max-w-md leading-relaxed text-sm">Stay on track with your recovery and clinical history.</p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-12 space-y-10 relative z-20 pb-10">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setView('LOCKER')}
            className={`flex-1 min-w-[120px] py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'LOCKER' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <ShieldCheck size={14} /> Locker
          </button>
          <button 
            onClick={() => setView('DOSAGE')}
            className={`flex-1 min-w-[120px] py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'DOSAGE' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <Clock size={14} /> Dosage
          </button>
          <button 
            onClick={() => setView('APPOINTMENT')}
            className={`flex-1 min-w-[120px] py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'APPOINTMENT' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <Calendar size={14} /> Booking
          </button>
          <button 
            onClick={() => setView('VITALS')}
            className={`flex-1 min-w-[120px] py-4 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view === 'VITALS' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <Activity size={14} /> Vitals
          </button>
        </div>

        {view === 'DOSAGE' ? renderDosageTimeline() : view === 'APPOINTMENT' ? renderAppointment() : view === 'VITALS' ? renderVitals() : (
          <>
            {/* Locker View Content */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {[
                { label: 'Records', value: prescriptions.length, icon: FileText, color: 'text-zinc-600', bg: 'bg-white' },
                { label: 'Log Count', value: vitalsHistory.length, icon: Activity, color: 'text-red-600', bg: 'bg-white' },
                { label: 'Next Visit', value: 'Pending', icon: Clock, color: 'text-blue-600', bg: 'bg-white' },
                { label: 'Health Status', value: 'Good', icon: Heart, color: 'text-emerald-500', bg: 'bg-white' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-5 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col items-start gap-2`}>
                  <stat.icon size={18} className={stat.color} />
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className="text-xl font-serif font-black text-zinc-950">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-100 rounded-[2rem] pl-14 pr-6 py-5 text-sm font-bold shadow-xl shadow-zinc-200/30 outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all placeholder:text-zinc-400"
              />
            </div>

            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center gap-2 italic">
                  <FileText size={18} className="text-red-600" /> Historical Records
                </h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-[2.5rem]"></div>)}
                </div>
              ) : filteredPrescriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode='popLayout'>
                    {filteredPrescriptions.map((rx, idx) => (
                      <motion.div 
                        key={rx.id} layout
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedRxId(rx.id)}
                        className="bg-white p-7 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 hover:shadow-2xl hover:shadow-red-600/5 hover:-translate-y-1 transition-all group cursor-pointer relative"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-600 transition-colors border border-zinc-100">
                            <FileText size={24} />
                          </div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2">
                            {rx.createdAt?.toDate ? new Date(rx.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                        <h3 className="text-xl font-serif font-black mb-2 text-zinc-950 leading-tight group-hover:text-red-600 transition-colors italic">{rx.diagnosis || 'Clinical Record'}</h3>
                        <div className="flex items-center gap-2 mb-6 text-zinc-500">
                          <Stethoscope size={14} className="text-red-600" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Dr. Sahab</p>
                        </div>
                        <span className="px-3 py-1 bg-zinc-50 text-[9px] font-black text-zinc-500 rounded-lg border border-zinc-100 uppercase tracking-tighter">Verified Clinical Record</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 p-20 rounded-[3rem] text-center">
                  <FileText size={32} className="text-zinc-200 mx-auto mb-4" />
                  <p className="text-sm text-zinc-400 font-medium italic">No records in your vault yet.</p>
                </div>
              )}
            </section>
          </>
        )}

        <div className="bg-zinc-950 p-8 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-serif font-bold mb-2 italic">Need medical assistance?</h3>
              <p className="text-zinc-500 text-sm font-medium">Use the Booking tab to schedule a physical consultation at the clinic.</p>
            </div>
            <button onClick={() => setView('APPOINTMENT')} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl">Book Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}
