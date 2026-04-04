import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-white pt-12 md:pt-20 pb-6 md:pb-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        
        {/* 🔥 GINAWANG COMPACT GRID: Magkatabi na ang mga lists sa mobile para walang empty space 🔥 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-12 mb-10 md:mb-16">
          
          {/* COLUMN 1: Brand Info (Kumukuha ng 2 columns sa mobile, 1 sa desktop) */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block leading-none mb-3 md:mb-5 group">
              <span className="text-xl md:text-2xl font-serif font-black tracking-widest text-white group-hover:text-zinc-400 transition-colors">
                A&P <span className="font-light">Clothing</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-[11px] md:text-sm font-light leading-relaxed max-w-md">
              Bridging the gap between bespoke tailoring and high-volume enterprise manufacturing. 
              Precision-cut. Masterfully sewn. Built for scale.
            </p>
          </div>

          {/* COLUMN 2: Quick Links (Magkatabi sila ni Column 3 sa mobile) */}
          <div className="col-span-1">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3 md:mb-5">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3">
              <li><Link to="/" className="text-zinc-400 hover:text-white transition-colors text-[11px] md:text-sm font-light inline-block">Home</Link></li>
              <li><Link to="/gallery" className="text-zinc-400 hover:text-white transition-colors text-[11px] md:text-sm font-light inline-block">Portfolio</Link></li>
              <li><Link to="/services" className="text-zinc-400 hover:text-white transition-colors text-[11px] md:text-sm font-light inline-block">Services</Link></li>
              <li><Link to="/contact" className="text-zinc-400 hover:text-white transition-colors text-[11px] md:text-sm font-light inline-block">Get Quote</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: Services */}
          <div className="col-span-1">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3 md:mb-5">Our Expertise</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="text-zinc-400 text-[11px] md:text-sm font-light">Bespoke Tailoring</li>
              <li className="text-zinc-400 text-[11px] md:text-sm font-light">Corporate Uniforms</li>
              <li className="text-zinc-400 text-[11px] md:text-sm font-light">Bulk Subcontracting</li>
              <li className="text-zinc-400 text-[11px] md:text-sm font-light">Direct Embroidery</li>
            </ul>
          </div>

          {/* COLUMN 4: Contact (Kumukuha ulit ng 2 columns sa mobile para magkasya ang email/address) */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3 md:mb-5">Visit Us</h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start text-zinc-400 text-[11px] md:text-sm font-light leading-relaxed">
                <svg className="h-4 w-4 mr-2.5 mt-0.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Brooklyn Heights, Tuktukan Subdivision, Guiguinto, Bulacan</span>
              </li>
              <li className="flex items-center text-zinc-400 text-[11px] md:text-sm font-light">
                <svg className="h-4 w-4 mr-2.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>inquire@apmatrix.ph</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR: Compact na rin para hindi malapad */}
        <div className="border-t border-zinc-900 pt-5 md:pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-2 md:gap-0">
          <p className="text-zinc-600 text-[9px] md:text-xs font-light tracking-widest">
            &copy; {new Date().getFullYear()} A&P Clothing Line. All rights reserved.
          </p>
          <div className="flex">
            <span className="text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">
              System Engineered by Carl Nieva
            </span>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;