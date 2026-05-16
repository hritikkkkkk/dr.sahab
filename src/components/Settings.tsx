import { User, Bell, Shield, Key, FileText, Globe, Smartphone, Palette, HelpCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { Screen, AuthUser, clearAuthToken } from './Shared';
import { useState } from 'react';
import { motion } from 'motion/react';

export default function Settings({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    clearAuthToken();
    setScreen('LOGIN');
  };

  const tabs = [
    { id: 'profile', label: 'Clinical Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'System Preferences', icon: Palette },
    { id: 'api', label: 'API Integrations', icon: Key },
    { id: 'help', label: 'Support & Help', icon: HelpCircle },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24 h-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-5xl font-medium tracking-tight mb-2">
            System <span className="font-bold text-black">Settings</span>
          </h2>
          <p className="text-zinc-500 font-medium text-lg">Manage your clinical preferences, security, and integrations.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-zinc-950 text-white shadow-xl' 
                    : 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <tab.icon size={18} className={isActive ? 'text-white' : 'text-zinc-400'} />
                {tab.label}
              </button>
            );
          })}
          
          <div className="pt-6 mt-6 border-t border-zinc-200">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out Securely
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm min-h-[500px]"
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-1">Clinical Profile</h3>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Your public medical identity</p>
                </div>
                
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-serif font-bold text-zinc-400 group-hover:bg-zinc-200 transition-colors">
                      {user.name ? user.name.charAt(0) : 'D'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-950 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <User size={14} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{user.name || 'Dr. Sahab'}</h4>
                    <p className="text-sm font-medium text-zinc-500">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Verified Practitioner
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                     <input type="text" defaultValue={user.name || 'Dr. Sahab'} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-950 transition-colors" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Specialization</label>
                     <input type="text" defaultValue="Internal Medicine" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-950 transition-colors" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">License Number</label>
                     <input type="text" defaultValue="MED-8824-A9" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-950 transition-colors" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clinic / Hospital</label>
                     <input type="text" defaultValue="NYC Central Clinic" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-zinc-950 transition-colors" />
                   </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="px-6 py-3 bg-zinc-950 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-zinc-800 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && (
              <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <FileText size={24} className="text-zinc-300" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Module Under Construction</h3>
                <p className="text-zinc-500 max-w-sm text-sm">The {activeTab} settings are currently being integrated with our secure backend systems.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
