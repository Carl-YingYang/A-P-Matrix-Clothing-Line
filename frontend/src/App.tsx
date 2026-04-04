import ClientLogin from './pages/ClientLogin';
import ClientDashboard from "./pages/ClientDashboard";
import ScrollToTop from './components/ScrollToTop';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ChatButton from './components/ChatButton';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Services from './pages/Services';
import Contact from './pages/Contact';

import AOS from 'aos';
import 'aos/dist/aos.css';

// Pinagandang Wrapper: Inayos ang easing para magmukhang 'Organic' ang galaw
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] // Custom Cubic Bezier para sa 'High-End' feel
      }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // initial={false} para iwas flicker sa first load
    // mode="wait" para siguradong malinis ang palitan
    <AnimatePresence mode="wait" initial={false}> 
      <Routes location={location} key={location.pathname}>
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<ClientLogin />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    AOS.init({
      duration: 600, // Mas mabilis na AOS para sumabay sa Framer Motion
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen font-sans flex flex-col overflow-x-hidden bg-[#09090b] transition-colors duration-500 relative selection:bg-blue-500/30">
        
        {/* ========================================================= */}
        {/* 💡 THE GLOBAL DYNAMIC AMBIENT BACKGROUND 💡 */}
        {/* ========================================================= */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Subtle Grid / Blueprint Vibe */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          
          {/* Soft Blue Orb (Top Left) - Moves & Breathes */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-ambient-fast"></div>
          
          {/* Soft Emerald Orb (Bottom Right) - Moves & Breathes */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] animate-ambient-slow"></div>
        </div>

        {/* MAIN CONTENT WRAPPER - Nakataas ang Z-Index para hindi matakpan ng ilaw */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <ChatButton />
          <div className="flex-grow">
            <AnimatedRoutes />
          </div>
          <Footer />
        </div>

      </div>
    </Router>
  );
}

export default App;