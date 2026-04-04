import { Link } from 'react-router-dom';

// ==========================================
// IMPORT LOCAL IMAGE DITO
// ==========================================
import imgMaterials from '../assets/Services-Premium Materials Only.png';

const Services = () => {
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#09090b] text-white">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 md:mb-20">
        <h2 data-aos="fade-down" className="text-zinc-500 font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-[9px] md:text-[10px]">What We Do</h2>
        <h1 data-aos="fade-up" className="mt-3 md:mt-4 text-3xl sm:text-4xl md:text-5xl leading-tight md:leading-8 font-serif text-white">
          Services & Capabilities
        </h1>
        <p data-aos="fade-up" data-aos-delay="100" className="mt-4 md:mt-6 max-w-2xl text-sm md:text-lg text-zinc-400 mx-auto font-light px-2">
          We specialize in high-volume production for brands, schools, and companies. 
          <br className="hidden sm:block" /><br className="hidden sm:block" />
          <span className="inline-block mt-4 sm:mt-0 text-white font-bold border border-zinc-800 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] bg-zinc-900/50">
            Minimum Order Quantity (MOQ): 50 pcs
          </span>
        </p>
      </div>

      {/* ================= MAIN SERVICES GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          
          {/* Service 1 */}
          <div data-aos="fade-up" className="bg-[#0c0c0e] p-8 md:p-10 hover:bg-[#111113] transition duration-500 group">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-zinc-700 flex items-center justify-center mb-6 md:mb-8 group-hover:border-white transition-colors duration-500">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 group-hover:bg-white transition-colors"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">Bespoke Tailoring</h3>
            <p className="text-zinc-400 font-light leading-relaxed mb-5 md:mb-6 text-xs md:text-sm">
              Custom measurements and high-end fabrics for individual clients requiring absolute precision.
            </p>
            <ul className="text-[10px] md:text-xs text-zinc-500 space-y-2 md:space-y-3 uppercase tracking-wider">
              <li>• Custom Pattern Drafting</li>
              <li>• Premium Fabric Sourcing</li>
              <li>• Multi-fitting Process</li>
            </ul>
          </div>

          {/* Service 2 */}
          <div data-aos="fade-up" data-aos-delay="100" className="bg-[#09090b] p-8 md:p-10 hover:bg-[#111113] transition duration-500 group">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-zinc-700 flex items-center justify-center mb-6 md:mb-8 group-hover:border-white transition-colors duration-500">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 group-hover:bg-white transition-colors"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">Corporate Uniforms</h3>
            <p className="text-zinc-400 font-light leading-relaxed mb-5 md:mb-6 text-xs md:text-sm">
              High-volume direct embroidery and assembly for company attire with strict QA/QC loops.
            </p>
            <ul className="text-[10px] md:text-xs text-zinc-500 space-y-2 md:space-y-3 uppercase tracking-wider">
              <li>• Polo Shirts & Jackets</li>
              <li>• Automated Cutting</li>
              <li>• Size Matrix Sampling</li>
            </ul>
          </div>

          {/* Service 3 */}
          <div data-aos="fade-up" data-aos-delay="200" className="bg-[#0c0c0e] p-8 md:p-10 hover:bg-[#111113] transition duration-500 group">
            <div className="w-10 h-10 md:w-12 md:h-12 border border-zinc-700 flex items-center justify-center mb-6 md:mb-8 group-hover:border-white transition-colors duration-500">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 group-hover:bg-white transition-colors"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-white mb-3 md:mb-4">Subcontracting (B2B)</h3>
            <p className="text-zinc-400 font-light leading-relaxed mb-5 md:mb-6 text-xs md:text-sm">
              Reliable production partner for Metro Manila-based clothing brands and independent designers.
            </p>
            <ul className="text-[10px] md:text-xs text-zinc-500 space-y-2 md:space-y-3 uppercase tracking-wider">
              <li>• White-label Service</li>
              <li>• Strict SLA Adherence</li>
              <li>• BOM Integration</li>
            </ul>
          </div>

        </div>
      </div>

      {/* ================= MATERIALS SHOWCASE ================= */}
      <div className="bg-[#0c0c0e] py-16 md:py-32 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div data-aos="fade-right" className="order-2 md:order-1 relative group overflow-hidden rounded-lg md:rounded-none">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
              {/* 🔥 GINAMIT ANG LOCAL IMAGE DITO 🔥 */}
              <img 
                src={imgMaterials} 
                alt="Premium Materials Showcase" 
                className="w-full h-64 md:h-auto object-cover md:object-contain grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 border border-zinc-800"
              />
            </div>
            <div data-aos="fade-left" className="order-1 md:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6">Premium Materials Only</h2>
              <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed mb-8 md:mb-10">
                We don't just sew; we engineer garments. We select the best materials suited for heavy industrial use and corporate presentation.
              </p>
              
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px] md:text-xs font-serif rounded-full md:rounded-none">I</div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-1">Industrial Threads</h4>
                    <p className="text-zinc-500 text-xs md:text-sm font-light">High-tensile strength resistant to fading and breaking.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px] md:text-xs font-serif rounded-full md:rounded-none">II</div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-1">Fabric Selection</h4>
                    <p className="text-zinc-500 text-xs md:text-sm font-light">CVC Cotton (Comb), Drifit (Sports), and Twill (Jackets).</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 border border-zinc-700 flex items-center justify-center text-white font-bold text-[10px] md:text-xs font-serif rounded-full md:rounded-none">III</div>
                  <div className="ml-4 md:ml-6">
                    <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest mb-1">Precision Hardware</h4>
                    <p className="text-zinc-500 text-xs md:text-sm font-light">YKK zippers, reinforced buttons, and quality stabilizers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FAQ SECTION ================= */}
      <div className="py-20 md:py-32 bg-[#09090b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <h2 data-aos="fade-up" className="text-2xl sm:text-3xl font-serif text-white">Frequently Asked Questions</h2>
            <p data-aos="fade-up" className="text-zinc-500 mt-3 md:mt-4 text-xs md:text-sm font-light">Operational guidelines for A&P Matrix.</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div data-aos="fade-up" className="bg-[#0c0c0e] p-6 md:p-8 border border-zinc-900 hover:border-zinc-700 transition-colors rounded-xl md:rounded-none">
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest leading-snug">Do you accept retail or single-piece orders?</h3>
              <p className="mt-3 md:mt-4 text-zinc-400 font-light text-xs md:text-sm leading-relaxed">
                Yes, but strictly under our <strong className="text-zinc-200">Bespoke Tailoring</strong> service via appointment. For corporate or standard items, our Minimum Order Quantity (MOQ) is <strong className="text-zinc-200">50 pieces</strong>.
              </p>
            </div>
            
            <div data-aos="fade-up" className="bg-[#0c0c0e] p-6 md:p-8 border border-zinc-900 hover:border-zinc-700 transition-colors rounded-xl md:rounded-none">
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest leading-snug">What is your standard lead time?</h3>
              <p className="mt-3 md:mt-4 text-zinc-400 font-light text-xs md:text-sm leading-relaxed">
                For average bulk orders (50-200 pcs), production takes <strong className="text-zinc-200">14-21 working days</strong> after tech pack and sample approval.
              </p>
            </div>

            <div data-aos="fade-up" className="bg-[#0c0c0e] p-6 md:p-8 border border-zinc-900 hover:border-zinc-700 transition-colors rounded-xl md:rounded-none">
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest leading-snug">What are your payment terms?</h3>
              <p className="mt-3 md:mt-4 text-zinc-400 font-light text-xs md:text-sm leading-relaxed">
                We require a <strong className="text-zinc-200">50% Downpayment</strong> to commence production staging, and the remaining 50% upon QC clearance prior to dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CTA SECTION ================= */}
      <div className="bg-[#050505] py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 data-aos="zoom-in" className="text-2xl sm:text-3xl font-serif text-white mb-6 md:mb-8">Ready to get started?</h2>
          <div data-aos="zoom-in" data-aos-delay="100">
             <Link to="/contact" className="inline-block w-full sm:w-auto bg-white text-black px-8 py-4 md:px-12 md:py-4 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 rounded-xl md:rounded-none">
              Request Quotation
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Services;