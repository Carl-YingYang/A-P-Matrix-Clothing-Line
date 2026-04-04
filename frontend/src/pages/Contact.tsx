import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UploadCloud, CheckCircle, X, AlertTriangle, MapPin, Calendar, Scissors, AlignCenter, Loader2 } from 'lucide-react';

const Contact = () => {
  const location = useLocation();
  const reorderData = location.state?.reorderData; 

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ==========================================
  // FORM STATE (HINIWALAY ANG FIRST & LAST NAME)
  // ==========================================
  const [formData, setFormData] = useState(() => {
    const defaultEmail = localStorage.getItem('user_email') || '';
    
    if (reorderData) {
      const raw = reorderData.details || '';
      const fMatch = raw.match(/FABRIC PREFERENCE:\s*(.*)/);
      const sMatch = raw.match(/SIZE BREAKDOWN:\s*(.*)/);
      const nSplit = raw.split(/CLOTHING DETAILS & NOTES:\n/);

      return {
        firstName: '', // Blanko parin para i-type nila
        lastName: '',  // Blanko parin
        email: defaultEmail,
        phone: reorderData.phone || '',
        company: reorderData.company === 'N/A' ? '' : (reorderData.company || ''),
        service: reorderData.service || 'Custom Tailoring',
        quantity: reorderData.quantity?.toString() || '',
        budget: reorderData.budget || '',
        targetDate: '', 
        fabric: fMatch && fMatch[1] !== 'Not specified' ? fMatch[1].trim() : '',
        sizes: sMatch && sMatch[1] !== 'Not specified' ? sMatch[1].trim() : '',
        details: nSplit.length > 1 ? nSplit[1].trim() : raw,
        reference_image: reorderData.reference_image || ''
      };
    }

    return {
      firstName: '', lastName: '', email: defaultEmail, phone: '', company: '',
      service: 'Custom Tailoring', quantity: '', budget: '', 
      targetDate: '', fabric: '', sizes: '', details: '', 
      reference_image: ''
    };
  });

  const [errors, setErrors] = useState({ firstName: '', lastName: '', email: '', phone: '', quantity: '', details: '', targetDate: '' });
  const [fileName, setFileName] = useState(reorderData?.reference_image ? "reorder_image_attached.png" : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); 
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const sanitizeInput = (input: string) => {
    return input.replace(/<[^>]*>?/gm, '').replace(/['";\-\-]/g, ''); 
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[a-zA-ZñÑ\s\-\.]{2,50}$/.test(value)) error = "Letters only (min 2).";
        break;
      case 'email':
        if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) error = "Invalid email format.";
        break;
      case 'phone':
        if (value && !/^(09|\+639)\d{9}$/.test(value.replace(/\s+/g, ''))) error = "Must be a valid PH mobile number.";
        break;
      case 'quantity':
        const num = Number(value);
        if (value && (!Number.isInteger(num) || num < 50 || num > 50000)) error = "Minimum 50 pcs required.";
        break;
      case 'targetDate':
        if (value) {
          const selectedDate = new Date(value);
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + 29); 
          minDate.setHours(0,0,0,0);
          if (selectedDate <= minDate) {
            error = "We require at least a 30-day lead time for production.";
          }
        }
        break;
      case 'details':
        if (value.length > 0) {
           if (value.length < 30) error = "Please provide more specific details (min 30 chars).";
        }
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanValue = (name === 'details' || name === 'company' || name === 'firstName' || name === 'lastName' || name === 'fabric' || name === 'sizes') 
      ? sanitizeInput(value) 
      : value;

    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    
    if (cleanValue.length > 0) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, cleanValue) }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSubmitStatus(null);

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setSubmitStatus({ type: 'error', message: "Invalid file type. Only JPG, PNG, or WEBP allowed." });
        removeImage();
        return;
      }
      if (file.size > 2 * 1024 * 1024) { 
        setSubmitStatus({ type: 'error', message: "File too large. Maximum size is 2MB." });
        removeImage();
        return; 
      }
      
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, reference_image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFileName("");
    setFormData(prev => ({ ...prev, reference_image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFormValid = 
    formData.firstName.length >= 2 && formData.lastName.length >= 2 && formData.email && formData.phone &&
    formData.quantity !== '' && Number(formData.quantity) >= 50 && formData.budget !== '' &&
    formData.targetDate !== '' &&
    !Object.values(errors).some(err => err !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setIsRedirecting(false);
    
    const compiledDetails = `
TARGET DATE: ${formData.targetDate}
FABRIC PREFERENCE: ${formData.fabric || 'Not specified'}
SIZE BREAKDOWN: ${formData.sizes || 'Not specified'}

CLOTHING DETAILS & NOTES:
${formData.details || 'None'}
    `.trim();

    // ==========================================
    // PINAGDIKIT YUNG PANGALAN DITO 
    // ==========================================
    const combinedFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: combinedFullName, // <-- Ito yung babasahin ng backend
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          company: formData.company.trim() || "N/A",
          service: formData.service,
          quantity: Number(formData.quantity),
          budget: formData.budget,
          details: compiledDetails,
          reference_image: formData.reference_image || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          setIsRedirecting(true);
          setSubmitStatus({ 
            type: 'success', 
            message: "Inquiry saved! Please wait while we transfer you to our secure payment gateway to process your ₱1,000 commitment fee." 
          });
          setTimeout(() => {
            window.location.href = data.checkout_url;
          }, 2500);
        } else {
          setSubmitStatus({ type: 'success', message: "We have securely received your inquiry. Our team will contact you shortly." });
          setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', service: 'Custom Tailoring', quantity: '', budget: '', targetDate: '', fabric: '', sizes: '', details: '', reference_image: '' });
          removeImage();
        }
      } else {
        throw new Error("Server rejected the request.");
      }
    } catch (error) { 
      setSubmitStatus({ type: 'error', message: "Unable to connect to A&P Matrix servers. Please check your connection and try again." });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-32 min-h-screen bg-[#09090b] text-white overflow-hidden">
      
      {submitStatus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center zoom-in-95 animate-in duration-300">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-5 md:mb-6 shadow-inner ${
              submitStatus.type === 'success' ? 'bg-[#061e12] border border-[#064e3b] text-[#34d399]' : 'bg-[#3b0711] border border-[#7f1d1d] text-[#fb7185]'
            }`}>
              {submitStatus.type === 'success' ? <CheckCircle size={32} className="md:w-9 md:h-9" strokeWidth={2} /> : <AlertTriangle size={32} className="md:w-9 md:h-9" strokeWidth={2} />}
            </div>
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-3 md:mb-4">
              {submitStatus.type === 'success' ? (isRedirecting ? 'Securing Link...' : 'Thank You!') : 'Submission Failed'}
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6 md:mb-8 font-sans px-2">
              {submitStatus.message}
            </p>
            <button 
              onClick={() => setSubmitStatus(null)} 
              disabled={isRedirecting}
              className={`w-full py-3.5 md:py-4 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 ${
                isRedirecting ? 'bg-blue-600 text-white cursor-wait opacity-90' : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
              }`}
            >
              {isRedirecting ? <><Loader2 size={16} className="animate-spin" /> Transferring to PayMongo...</> : 'Return to Page'}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 md:mb-16">
          <h2 data-aos="fade-down" className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-[9px] md:text-[10px] font-sans">Start Your Order</h2>
          <h1 className="mt-3 md:mt-4 text-3xl sm:text-4xl md:text-5xl font-serif text-white">
            {reorderData ? "Re-order Request" : "Request Quotation"}
          </h1>
          {reorderData && <p className="mt-2 text-sm text-blue-400 font-medium">Auto-filled from Order Ref: {reorderData.id}</p>}
        </div>

        <div className="grid lg:grid-cols-5 gap-8 md:gap-12 bg-[#0c0c0e] border border-zinc-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative">
          
          <div data-aos="fade-right" className="lg:col-span-2 bg-[#050505] p-10 border-r border-zinc-800 flex flex-col justify-between hidden lg:flex relative overflow-hidden font-sans">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
             <div>
               <h3 className="text-2xl font-serif text-white mb-2">A&P Matrix HQ</h3>
               <p className="text-sm text-zinc-400 mb-10">Corporate Uniforms & Subcontracting</p>
               <div className="space-y-6 mb-10">
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5"><MapPin size={12}/> Location</p>
                   <p className="text-zinc-300 font-medium text-sm">Brooklyn Heights, Tuktukan Subdivision<br/>Guiguinto, Bulacan</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5"><CheckCircle size={12}/> Secure Contact</p>
                   <p className="text-zinc-300 font-medium text-sm">inquire@apmatrix.ph</p>
                 </div>
               </div>
               <div className="w-full h-48 rounded-xl overflow-hidden border border-zinc-800 relative group">
                 <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                 <iframe 
                   src="https://maps.google.com/maps?q=Brooklyn%20Heights,%20Tuktukan%20Subdivision,%20Guiguinto,%20Bulacan&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                   width="100%" height="100%" 
                   style={{ border: 0, filter: 'grayscale(100%) invert(100%) contrast(85%)' }} 
                   allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                   className="transition-all duration-500 group-hover:filter-none"
                 ></iframe>
               </div>
             </div>
          </div>

          <div data-aos="fade-left" className="lg:col-span-3 p-5 sm:p-8 lg:p-12 font-sans">
            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
              
              <div>
                <h4 className="text-xs md:text-sm font-bold text-white mb-5 md:mb-6 border-b border-zinc-800 pb-2">1. Your Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  
                  {/* HINIWALAY NA FIRST NAME AT LAST NAME */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="e.g. Juan" />
                      {errors.firstName && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] text-red-500 font-medium">{errors.firstName}</p>}
                    </div>
                    <div className="relative group">
                      <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="e.g. Dela Cruz" />
                      {errors.lastName && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] text-red-500 font-medium">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Company / School / Brand</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="Leave blank if personal" />
                  </div>
                  
                  <div className="relative group">
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="client@email.com" />
                    {errors.email && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] md:text-[10px] text-red-500 font-medium">{errors.email}</p>}
                  </div>
                  
                  <div className="relative group">
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Phone Number *</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="09123456789" />
                    {errors.phone && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] md:text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-bold text-white mb-5 md:mb-6 border-b border-zinc-800 pb-2 mt-4">2. Order Overview</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">What do you need? *</label>
                    <select name="service" value={formData.service} onChange={handleChange} className="w-full bg-[#0c0c0e] border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm cursor-pointer transition-colors">
                      <option>Custom Tailoring</option><option>Corporate Uniforms</option><option>Subcontracting</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">How many pieces? *</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="Minimum of 50" min="50" />
                    {errors.quantity && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] md:text-[10px] text-red-500 font-medium">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Estimated Budget *</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} required className="w-full bg-[#0c0c0e] border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm cursor-pointer transition-colors">
                      <option value="" disabled hidden>Select Budget</option>
                      <option>Below ₱10,000</option>
                      <option>₱10,000 - ₱50,000</option>
                      <option>₱50,000 - ₱100,000</option>
                      <option>Above ₱100,000</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs md:text-sm font-bold text-white mb-5 md:mb-6 border-b border-zinc-800 pb-2 mt-4 flex items-center gap-2">
                  3. Clothing Details & Design
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div className="relative">
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2 flex items-center gap-1.5"><Calendar size={12}/> When do you need this? *</label>
                    <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} required className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors [color-scheme:dark]" />
                    {errors.targetDate && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] md:text-[10px] text-red-500 font-medium">{errors.targetDate}</p>}
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2 flex items-center gap-1.5"><Scissors size={12}/> What fabric do you prefer?</label>
                    <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="e.g. Cotton, Drifit (Optional)" />
                  </div>
                </div>

                <div className="mb-6 md:mb-8">
                  <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2 flex items-center gap-1.5"><AlignCenter size={12}/> What sizes do you need?</label>
                  <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} className="w-full bg-transparent border-b border-zinc-700 text-white py-2.5 md:py-2 outline-none focus:border-blue-500 text-sm transition-colors" placeholder="e.g. 10 Small, 20 Medium, 20 Large (Optional)" />
                </div>

                <div className="mb-6 md:mb-8 relative">
                  <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Describe your clothing design *</label>
                  <textarea 
                    rows={4} name="details" value={formData.details} onChange={handleChange} required
                    className={`w-full bg-[#050505] border ${errors.details ? 'border-red-500/50' : 'border-zinc-800'} rounded-xl text-white p-4 outline-none focus:border-blue-500 text-sm resize-none transition-colors leading-relaxed`} 
                    placeholder="e.g. We need 50 polo shirts with our company logo embroidered on the left chest. The collar should be black..."
                  />
                  {errors.details && <p className="absolute -bottom-4 md:-bottom-5 left-0 text-[9px] md:text-[10px] text-red-500 font-medium">{errors.details}</p>}
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 md:mb-2">Upload your Design or Logo (Optional)</label>
                  <div className="border border-dashed border-zinc-700 bg-[#050505] rounded-xl p-5 md:p-6 flex flex-col items-center justify-center text-center relative hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    {fileName ? (
                      <div className="flex items-center justify-between w-full max-w-sm gap-2 text-blue-400 z-10 bg-blue-900/20 px-3 py-2.5 rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle size={16} className="shrink-0" /> 
                          <span className="text-xs md:text-sm font-bold truncate">{fileName}</span>
                        </div>
                        <button type="button" onClick={removeImage} className="ml-2 text-blue-400 hover:text-red-400 bg-black/20 p-1.5 rounded-full transition-colors shrink-0"><X size={14}/></button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-zinc-900 p-2.5 md:p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                          <UploadCloud size={20} className="text-zinc-400" />
                        </div>
                        <p className="text-xs md:text-sm font-bold text-zinc-300">Click to upload image file</p>
                        <p className="text-[9px] md:text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">JPG, PNG, WEBP (Max 2MB)</p>
                      </>
                    )}
                    <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting} 
                  className={`w-full font-black py-3.5 md:py-4 rounded-xl transition-all uppercase tracking-widest text-[10px] md:text-[11px] flex justify-center items-center gap-2 ${
                    !isFormValid ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Transmitting Securely...</> : 'Transmit Inquiry to Production Queue'}
                </button>
                <p className="text-center text-zinc-600 text-[9px] md:text-[10px] mt-3 md:mt-4 font-medium uppercase tracking-widest font-sans">SSL Encrypted Transmission</p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;