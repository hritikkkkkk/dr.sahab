import { useState, useEffect } from 'react';
import { Screen, Sidebar, Navbar, MobileNav, AuthUser, setAuthToken, clearAuthToken } from './components/Shared';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import NewPrescription from './components/NewPrescription';
import PrescriptionBuilder from './components/PrescriptionBuilder';
import Schedule from './components/Schedule';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import PatientDashboard from './components/PatientDashboard';
import Analytics from './components/Analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setAuthToken(token);
        
        const authUser: AuthUser = {
          name: firebaseUser.displayName || 'Dr. ' + firebaseUser.email!.split('@')[0],
          email: firebaseUser.email!,
          role: 'doctor', // Defaulting to doctor for now, or fetch from Firestore custom claims
          token: token
        };
        
        setUser(authUser);
        // Only set dashboard if we're coming from Landing or Login
        setCurrentScreen(current => 
          (current === 'LANDING' || current === 'LOGIN') ? 'DASHBOARD' : current
        );
      } else {
        setUser(null);
        clearAuthToken();
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (userData: AuthUser | Screen) => {
    if (typeof userData === 'string') {
      setCurrentScreen(userData);
    } else {
      setUser(userData);
      setCurrentScreen(userData.role === 'doctor' ? 'DASHBOARD' : 'PATIENT_DASHBOARD');
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LANDING':
        return <LandingPage onNavigate={setCurrentScreen} />;
      case 'LOGIN':
        return <LoginScreen onLogin={handleLogin} />;
      case 'PATIENT_DASHBOARD':
        return user ? <PatientDashboard user={user} setScreen={setCurrentScreen} /> : <LoginScreen onLogin={handleLogin} />;
      case 'DASHBOARD':
        return <Dashboard user={user!} setScreen={setCurrentScreen} />;
      case 'PATIENT_PROFILE':
        return <PatientProfile user={user!} setScreen={setCurrentScreen} />;
      case 'NEW_PRESCRIPTION':
        return <NewPrescription user={user!} setScreen={setCurrentScreen} />;
      case 'PRESCRIPTION_BUILDER':
        return <PrescriptionBuilder user={user!} setScreen={setCurrentScreen} />;
      case 'SCHEDULE':
        return <Schedule user={user!} setScreen={setCurrentScreen} />;
      case 'ANALYTICS':
        return <Analytics user={user!} setScreen={setCurrentScreen} />;
      case 'SETTINGS':
        return <Settings user={user!} setScreen={setCurrentScreen} />;
      default:
        return <Dashboard user={user!} setScreen={setCurrentScreen} />;
    }
  };

  if (currentScreen === 'LOGIN' || currentScreen === 'LANDING' || currentScreen === 'PATIENT_DASHBOARD') {
    return renderScreen();
  }

  // Wraps clinical screens with common Navigation/Header
  return (
    <div className="min-h-screen bg-surface-light text-primary-dark">
      <Sidebar currentScreen={currentScreen} setScreen={setCurrentScreen} />
      
      <div className="md:ml-64 relative min-h-screen print:ml-0">
        <Navbar user={user!} setScreen={setCurrentScreen} />
        
        <main className="pt-20 pb-24 md:pb-8 print:p-0">
          {renderScreen()}
        </main>
        
        <MobileNav setScreen={setCurrentScreen} />
      </div>
    </div>
  );
}

