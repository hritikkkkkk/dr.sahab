import React from 'react';
import { AuthUser, Screen } from './Shared';
import { motion } from 'motion/react';
import { 
  Users, Activity, TrendingUp, Calendar,
  Pill, Clock, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsProps {
  user: AuthUser;
  setScreen: (screen: Screen) => void;
}

const patientVisitsData = [
  { name: 'Mon', visits: 12 },
  { name: 'Tue', visits: 19 },
  { name: 'Wed', visits: 15 },
  { name: 'Thu', visits: 22 },
  { name: 'Fri', visits: 28 },
  { name: 'Sat', visits: 35 },
  { name: 'Sun', visits: 10 },
];

const topMedicationsData = [
  { name: 'Amoxicillin', value: 400 },
  { name: 'Lisinopril', value: 300 },
  { name: 'Metformin', value: 300 },
  { name: 'Atorvastatin', value: 200 },
];

const ageDemographicsData = [
  { name: '0-18', value: 15 },
  { name: '19-35', value: 30 },
  { name: '36-50', value: 25 },
  { name: '51-70', value: 20 },
  { name: '71+', value: 10 },
];

const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fee2e2'];
const PIE_COLORS = ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Analytics({ user, setScreen }: AnalyticsProps) {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 tracking-tight">Analytics</h1>
          <p className="text-gray-500 font-medium">Practice performance & patient demographics</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
            Last 7 Days
          </button>
          <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold shadow-sm hover:bg-red-100 transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={24} />
            </div>
            <span className="flex items-center text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} className="mr-1" /> +12%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">1,248</h3>
          <p className="text-gray-500 text-sm font-semibold">Total Patients</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Activity size={24} />
            </div>
            <span className="flex items-center text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp size={14} className="mr-1" /> +5%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">141</h3>
          <p className="text-gray-500 text-sm font-semibold">Visits This Week</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Pill size={24} />
            </div>
            <span className="flex items-center text-sm font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
               -2%
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">892</h3>
          <p className="text-gray-500 text-sm font-semibold">Prescriptions Written</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">14m</h3>
          <p className="text-gray-500 text-sm font-semibold">Avg. Visit Duration</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Patient Visits</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">This Week</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientVisitsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Charts */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Age Demographics</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDemographicsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ageDemographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.6 }}
            className="bg-[#0a0a0a] text-white p-6 rounded-3xl shadow-xl border border-gray-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl"></div>
            <h2 className="text-lg font-bold mb-6 relative z-10">Top Medications</h2>
            <div className="h-[180px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMedicationsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {topMedicationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
