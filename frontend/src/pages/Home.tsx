import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ==========================================
// IMPORT LOCAL IMAGES
// ==========================================
import heroBg1 from '../assets/hero-bg.jpg';
import heroBg2 from '../assets/hero-bg-2.png';
import heroBg3 from '../assets/hero-bg-3.png';
import heroBg4 from '../assets/hero-bg-4.png';

import imgHeritage from '../assets/Home-Our Heritage.png';
import imgCapacity from '../assets/Home-Production Capacity.png';
import imgTech from '../assets/Home-Modern Technology.png';

const backgrounds = [heroBg1, heroBg2, heroBg3, heroBg4];

const Home = () => {
  const [currentBg, setCurrentBg] = useState(0);

  // SLIDESHOW TIMER (Palit ng background every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#09090b] text-white overflow-hidden">
      
      {/* ================= HERO SECTION (WITH SLIDESHOW) ================= */}
      <div className="relative min-h-screen w-full flex items-center justify-center pt-20 pb-16 md:py-0">
        
        {/* Slideshow Backgrounds */}
        {backgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${bg})` }}
          ></div>
        ))}

        {/* Dark Gradient Overlay (Para laging readable ang text) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-black/60 z-0"></div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8 md:mt-16 group"> 
          <div data-aos="fade-down" className="inline-block border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 mb-6 md:mb-8">
             <span className="text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] font-bold">A&P Clothing Line</span>
          </div>
          
          <h1 data-aos="fade-up" className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight mb-4 md:mb-6 drop-shadow-xl font-serif leading-[1.2] md:leading-[1.1] px-2">
            Enterprise Precision from <br className="hidden sm:block" />
            <span className="text-zinc-500 italic block sm:inline mt-2 sm:mt-0">Guiguinto, Bulacan</span>
          </h1>
          
          <p data-aos="fade-up" data-aos-delay="200" className="text-sm sm:text-base md:text-xl text-zinc-400 max-w-3xl mx-auto mb-8 md:mb-10 font-light leading-relaxed px-4">
            The trusted centralized hub for custom tailoring, bulk uniforms, and corporate branding. Experience high-fidelity craftsmanship at scale.
          </p>

          <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 px-6 sm:px-4">
            <Link to="/gallery" className="w-full sm:w-auto px-6 py-3.5 md:px-10 md:py-4 border border-zinc-700 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-white hover:text-black hover:scale-105 transition-all transform text-center">
              View Portfolio
            </Link>
            <Link to="/contact" className="w-full sm:w-auto px-6 py-3.5 md:px-10 md:py-4 bg-white text-black text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-200 hover:scale-105 transition-all transform text-center">
              Get A Quote
            </Link>
          </div>
        </div>
      </div>

      {/* ================= FEATURE 1: Heritage ================= */}
      <div className="py-16 md:py-24 bg-[#09090b] border-b border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div data-aos="fade-right" className="text-center md:text-left order-2 md:order-1">
              <h2 className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-2">Our Heritage</h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6 leading-snug">Authentic Tailoring Craftsmanship</h3>
              <p className="text-sm md:text-lg text-zinc-400 font-light leading-relaxed mb-6 md:mb-6">
                Located at Brooklyn Heights, Tuktukan Subdivision, we carry the tradition of true master sewers. 
                Unlike fast-fashion factories, we pay attention to the exact measurements, texture, and tension of every thread.
              </p>
            </div>
            
            {/* IMAGE: Heritage */}
            <div data-aos="fade-left" className="relative h-64 md:h-96 rounded-lg md:rounded-sm bg-[#0c0c0e] border border-zinc-800 flex items-center justify-center shadow-2xl order-1 md:order-2 overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
              <img 
                src={imgHeritage} 
                alt="A&P Tailoring Heritage" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURE 2: Bulk ================= */}
      <div className="py-16 md:py-24 bg-[#0c0c0e] border-b border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            
            {/* IMAGE: Production Capacity */}
            <div data-aos="fade-right" className="relative h-64 md:h-96 rounded-lg md:rounded-sm bg-[#09090b] border border-zinc-800 flex items-center justify-center shadow-2xl order-1 md:order-1 overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
              <img 
                src={imgCapacity} 
                alt="A&P Production Capacity" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </div>
            
            <div data-aos="fade-left" className="text-center md:text-left order-2 md:order-2">
              <h2 className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-2">Production Capacity</h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6 leading-snug">Ready for Bulk & Subcontracting</h3>
              <p className="text-sm md:text-lg text-zinc-400 font-light leading-relaxed mb-6 md:mb-6">
                Need 1,000 corporate polo shirts? Or 5,000 custom patches? We have the industrial machinery and structured operational workflow to scale. 
                We serve as a reliable <strong className="text-zinc-200">white-label subcontractor</strong> for major Metro Manila brands.
              </p>
              <Link to="/services" className="text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] border-b border-zinc-700 hover:border-white pb-1 transition-all inline-flex items-center group">
                Check our Capabilities
                <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURE 3: Precision ================= */}
      <div className="py-16 md:py-24 bg-[#09090b] border-b border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div data-aos="fade-right" className="text-center md:text-left order-2 md:order-1">
              <h2 className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-2">Modern Technology</h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6 leading-snug">Computerized Precision</h3>
              <p className="text-sm md:text-lg text-zinc-400 font-light leading-relaxed mb-6 md:mb-6">
                We combine traditional skill with enterprise-level software. From automated Bill of Materials (BOM) routing to strict Quality Control (QC) staging, our internal systems ensure your designs are executed perfectly every single time.
              </p>
            </div>
            
            {/* IMAGE: Modern Technology */}
            <div data-aos="fade-left" className="relative h-64 md:h-96 rounded-lg md:rounded-sm bg-[#0c0c0e] border border-zinc-800 flex items-center justify-center shadow-2xl order-1 md:order-2 overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
              <img 
                src={imgTech} 
                alt="A&P Modern Technology" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CTA ================= */}
      <div className="bg-[#050505] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 data-aos="zoom-in" className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6 leading-tight">Initialize Production</h2>
          <p data-aos="zoom-in" data-aos-delay="100" className="text-zinc-400 text-sm md:text-lg mb-8 md:mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Submit your project specifications. Our engineering team will review your requirements and generate an accurate quotation.
          </p>
          <div data-aos="zoom-in" data-aos-delay="200" className="px-4 md:px-0">
            <Link to="/contact" className="inline-block w-full sm:w-auto bg-white text-black px-8 py-4 md:px-12 md:py-4 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all transform hover:-translate-y-1 rounded-xl md:rounded-none">
              Get A Free Quote
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;