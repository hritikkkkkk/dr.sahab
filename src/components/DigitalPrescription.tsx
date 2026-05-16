import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, ShieldCheck, User, Stethoscope, CheckCircle2, ChevronLeft, MapPin, Phone } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_PATIENTS } from './Shared';

interface DigitalRxProps {
  patientId: string;
  onBack: () => void;
}

export default function DigitalPrescription({ patientId, onBack }: DigitalRxProps) {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (patientId === 'demo' || patientId.startsWith('demo')) {
          setPatient(MOCK_PATIENTS[0]);
          setPrescription({ 
            diagnosis: 'Hypertension Follow-up', 
            vitals: { bp: '130/85', weight: '72kg', temp: '98.6°F' },
            date: new Date().toISOString()
          });
          setItems([
            { drugName: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 Days', instructions: 'After breakfast' },
            { drugName: 'Metoprolol', dosage: '25mg', frequency: '0-0-1', duration: '30 Days', instructions: 'After dinner' }
          ]);
        } else {
          // Fetch real data
          const pDoc = await getDoc(doc(db, 'patients', patientId));
          if (pDoc.exists()) {
            setPatient({ id: pDoc.id, ...pDoc.data() });
          }

          const rxQuery = query(
            collection(db, 'prescriptions'), 
            where('patientId', '==', patientId),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const rxSnapshot = await getDocs(rxQuery);
          
          if (!rxSnapshot.empty) {
            const rxData = rxSnapshot.docs[0];
            setPrescription({ id: rxData.id, ...rxData.data() });
            
            const itemsQuery = query(
              collection(db, 'prescription_items'),
              where('prescriptionId', '==', rxData.id)
            );
            const itemsSnapshot = await getDocs(itemsQuery);
            setItems(itemsSnapshot.docs.map(d => d.data()));
          }
        }
      } catch (err) {
        console.error("Error fetching Rx:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Verifying Signature...</p>
      </div>
    );
  }

  if (!patient || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck size={64} className="text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Prescription Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">This digital prescription link may have expired or does not exist.</p>
        <button onClick={onBack} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl text-sm">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-24 print:bg-white print:pb-0">
      
      {/* App Bar - Hidden on Print */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 print:hidden">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600">Verified Softcopy</span>
        </div>
        <button 
          onClick={() => window.print()} 
          className="p-2 -mr-2 text-red-600 hover:bg-red-50 rounded-full"
        >
          <Download size={20} />
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 md:p-8"
      >
        {/* Prescription Paper */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          
          {/* Clinic Header */}
          <div className="bg-red-600 text-white p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-600 mb-4 shadow-lg">
              <Stethoscope size={32} />
            </div>
            <h1 className="text-3xl font-serif font-black tracking-tight mb-1">Dr. Sahab Clinic</h1>
            <p className="text-white/80 text-sm font-medium mb-4">Internal Medicine & General Practice</p>
            <div className="flex flex-col gap-2 text-xs font-medium text-white/70">
              <span className="flex items-center justify-center gap-1"><MapPin size={12}/> 123 Healthcare Ave, Medical District</span>
              <span className="flex items-center justify-center gap-1"><Phone size={12}/> +91 98765 43210</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Patient Info */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Patient Details</p>
                <h2 className="text-xl font-black text-gray-900">{patient.name}</h2>
                <p className="text-sm text-gray-500 font-medium">{patient.age} Yrs • {patient.gender}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(prescription.createdAt?.toDate?.() || prescription.date || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Vitals & Diagnosis */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Diagnosis</p>
                <p className="text-sm font-bold text-gray-900">{prescription.diagnosis || 'General Checkup'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Vitals</p>
                <p className="text-sm font-bold text-gray-900">
                  {prescription.vitals?.bp ? `BP: ${prescription.vitals.bp}` : 'Vitals normal'}
                  {prescription.vitals?.weight ? ` • Wt: ${prescription.vitals.weight}` : ''}
                </p>
              </div>
            </div>

            {/* Medications */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-serif font-black text-red-600">Rx</span>
                <div className="h-px bg-gray-100 flex-1"></div>
              </div>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No medications prescribed during this visit.</p>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900">{item.drugName} <span className="text-gray-500 font-medium text-sm">{item.dosage}</span></h3>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold tracking-widest">{item.frequency}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold tracking-widest">{item.duration}</span>
                        </div>
                        {item.instructions && (
                          <p className="text-xs text-gray-500 italic">{item.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Valid Until</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-center">
                <div className="w-40 h-16 border-b border-gray-200 mb-2 relative">
                  <div className="absolute bottom-1 right-2 w-12 h-12 rounded-full border-2 border-red-600/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-red-600/40 uppercase tracking-widest transform -rotate-12">Verified</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Doctor's Signature</p>
              </div>
            </div>

          </div>
        </div>
        
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 print:hidden">
          Powered by Dr. Sahab AI
        </p>
      </motion.div>

      {/* Floating Action Button for Mobile Download */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50 print:hidden md:hidden">
        <button 
          onClick={() => window.print()}
          className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download size={20} />
          Save as PDF
        </button>
      </div>
    </div>
  );
}
