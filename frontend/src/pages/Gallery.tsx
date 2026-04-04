import { useState } from 'react';
import { Link } from 'react-router-dom';

// ==========================================
// IMPORT LOCAL IMAGES DITO SA TAAS
// ==========================================
import img1Men from '../assets/image1(men).png';
import img2Men from '../assets/image2(men).png';
import img3Men from '../assets/image3(men).png';
import img4 from '../assets/image4.png';
import img5 from '../assets/image5.png';
import img1Women from '../assets/image1(women).png';
import img2Women from '../assets/image2(women).png';
import img3Women from '../assets/image3(women).png';
import img6Men from '../assets/image6(men).png';
import img6Women from '../assets/image6(women).png';
import techPackImg from '../assets/TECH PACK.png';
import finalGarmentImg from '../assets/FINAL GARMENT.png';

// Na-map na natin ang mga local images sa sari-sariling categories (Dito na naidagdag si img1Women)
const projects = [
  {
    id: 1,
    title: "Classic Corporate Polo (Men)",
    category: "Corporate",
    image: img2Men,
  },
  {
    id: 2,
    title: "Classic Corporate Polo (Women)",
    category: "Corporate",
    image: img2Women,
  },
  {
    id: 3,
    title: "Campus Uniform Set (Women)",
    category: "Bespoke",
    image: img6Women,
  },
  {
    id: 4,
    title: "Campus Uniform Set (Men)",
    category: "Bespoke",
    image: img6Men,
  },
  {
    id: 5,
    title: "Custom Tricolor Polo (Men)",
    category: "Corporate",
    image: img3Men,
  },
  {
    id: 6,
    title: "Custom Tricolor Polo (Women)",
    category: "Corporate",
    image: img3Women,
  },
  {
    id: 7,
    title: "Minimalist Essential Tee (Men)",
    category: "Subcontract",
    image: img1Men,
  },
  {
    id: 8,
    title: "Minimalist Essential Tee (Women)",
    category: "Subcontract",
    image: img1Women, // GINAMIT NA NATIN DITO PARA HINDI MAG-ERROR SI VERCEL
  },
  {
    id: 9,
    title: "Activewear Training Shorts",
    category: "Subcontract",
    image: img4,
  },
  {
    id: 10,
    title: "Casual Chino Shorts",
    category: "Subcontract",
    image: img5,
  },
];

const Gallery = () => {
  const [filter, setFilter] = useState('All');

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(project => project.category === filter);

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#09090b] text-white">
      
      {/* ================= HEADER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 md:mb-16">
        <h2 data-aos="fade-down" className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px]">Our Portfolio</h2>
        <h1 data-aos="fade-up" className="mt-3 md:mt-4 text-3xl md:text-4xl lg:text-5xl leading-tight font-serif text-white">
          The Stitch Gallery
        </h1>
        <p data-aos="fade-up" data-aos-delay="100" className="mt-4 md:mt-6 max-w-2xl text-sm md:text-lg text-zinc-400 mx-auto font-light px-2">
          From digital tech packs to finished garments. See the precision of A&P craftsmanship.
        </p>
      </div>

      {/* ================= PROJECT SPOTLIGHT ================= */}
      <div className="bg-[#0c0c0e] py-10 md:py-16 mb-10 md:mb-16 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h3 data-aos="fade-up" className="text-xl md:text-2xl font-serif text-white">Project Spotlight: Detailed Precision</h3>
            <p data-aos="fade-up" className="text-zinc-500 text-xs md:text-sm mt-2">We ensure the actual output matches the digital tech pack 100%.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            {/* Before (Digital - USING NEW UPLOADED IMAGE) */}
            <div data-aos="fade-right" className="relative group">
              <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-zinc-950 border border-zinc-800 text-white text-[9px] md:text-[10px] tracking-[0.2em] font-bold px-3 py-1.5 md:px-4 md:py-2 uppercase z-10 shadow-lg">
                TECH PACK
              </div>
              <img 
                src={techPackImg} 
                alt="Digital Design" 
                className="w-full h-64 md:h-80 object-cover filter grayscale group-hover:grayscale-0 transition duration-500 opacity-80 group-hover:opacity-100 rounded-lg md:rounded-none"
              />
            </div>

            {/* After (Actual - USING NEW UPLOADED IMAGE) */}
            <div data-aos="fade-left" className="relative group bg-white/5 rounded-lg md:rounded-none overflow-hidden">
              <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white text-black text-[9px] md:text-[10px] tracking-[0.2em] font-bold px-3 py-1.5 md:px-4 md:py-2 uppercase z-10 shadow-lg">
                FINAL GARMENT
              </div>
              <img 
                src={finalGarmentImg} 
                alt="Actual Garment" 
                className="w-full h-64 md:h-80 object-contain md:object-cover object-top border border-zinc-800 md:border-zinc-700 rounded-lg md:rounded-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTERABLE GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-24">
        
        {/* Filter Buttons */}
        <div data-aos="fade-up" className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12 flex-wrap">
          {['All', 'Bespoke', 'Corporate', 'Subcontract'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 md:px-8 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-md md:rounded-none ${
                filter === cat 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                : 'bg-[#09090b] text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* The Grid - Inayos para lumitaw yung natural colors ng product shots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-1 bg-[#09090b] md:bg-zinc-900 border-none md:border md:border-zinc-900">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id} 
              data-aos="fade-up"            
              data-aos-duration="500"      
              data-aos-delay={(index % 3) * 100} 
              className="group relative bg-white/5 md:bg-white/10 overflow-hidden cursor-pointer rounded-xl md:rounded-none border border-zinc-800 md:border-none"
            >
              <div className="aspect-w-4 aspect-h-3 h-64 md:h-80 overflow-hidden relative flex items-center justify-center">
                {/* Subtle dim effect na magliliwanag pag hover */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 z-10 pointer-events-none"></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover object-top transform group-hover:scale-105 transition duration-700"
                />
              </div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mb-1.5 md:mb-2 flex items-center gap-2">
                  <span className="w-3 md:w-4 h-[1px] bg-zinc-400 inline-block"></span>
                  {project.category}
                </p>
                <h3 className="text-lg md:text-xl font-serif text-white group-hover:text-zinc-200 transition">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 md:py-20 border border-zinc-800 rounded-xl md:rounded-none mt-6 md:mt-8">
            <p className="text-zinc-600 text-xs md:text-sm uppercase tracking-widest">No projects found in this category yet.</p>
          </div>
        )}

        <div className="mt-16 md:mt-20 text-center" data-aos="fade-up">
          <p className="text-zinc-500 text-xs md:text-sm mb-3 md:mb-4">Ready to start your production?</p>
          <Link to="/contact" className="inline-flex items-center text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] border-b border-zinc-700 hover:border-white pb-1 transition-colors">
            Request a Quote
            <svg className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Gallery;