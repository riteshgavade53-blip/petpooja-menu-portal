  /**
   * @license
   * SPDX-License-Identifier: Apache-2.0
   */

  import React, { useState, useEffect, useRef } from 'react';
  import { 
    LayoutDashboard, 
    Tag, 
    PlusCircle, 
    FileText, 
    Bell, 
    CheckCircle2, 
    Upload, 
    Clock,
    Zap,
    Smartphone,
    UtensilsCrossed,
    Info,
    Sparkles,
    User
  } from 'lucide-react';
  import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';

  type Tab = 'menu-update' | 'price-update' | 'item-addition' | 'menu-format';

  // 3D Tilt Wrapper Component
  function TiltCard({
    children,
    className = "",
    interactive = true,
  }: {
    children: React.ReactNode,
    className?: string,
    interactive?: boolean,
  }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const motionStyle = interactive
      ? {
          rotateY,
          rotateX,
          transformStyle: "preserve-3d" as const,
        }
      : undefined;

    return (
      <motion.div
        onMouseMove={interactive ? handleMouseMove : undefined}
        onMouseLeave={interactive ? handleMouseLeave : undefined}
        style={motionStyle}
        className={`relative transition-shadow duration-500 ${className}`}
      >
        <div style={interactive ? { transform: "translateZ(50px)", transformStyle: "preserve-3d" } : undefined}>
          {children}
        </div>
      </motion.div>
    );
  }

  // Floating Element Component
  function FloatingElement({ emoji, delay = 0, className = "" }: { emoji: string, delay?: number, className?: string }) {
    return (
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 5 + Math.random() * 2,
          repeat: Infinity,
          delay,
          ease: "easeInOut"
        }}
        className={`absolute pointer-events-none text-4xl opacity-20 filter blur-[1px] ${className}`}
      >
        {emoji}
      </motion.div>
    );
  }

  export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('menu-update');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedData, setSubmittedData] = useState<any>(null);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
    
    // Persist form data at App level
    const [formData, setFormData] = useState({
      petpoojaId: "",
      restaurantName: "",
      ownerName: "",
      contactNumber: "",
      email: "",
      outletType: "Single Outlet",
      outlets: [""],
      platforms: [] as string[],
      otherPlatform: "",
      updateType: "",
      fileName: "",
      remarks: ""
    });

    const handleFormSubmit = (data: any) => {
      setSubmittedData(data);
      setIsSubmitted(true);
      setIsEmailPreviewOpen(false);
    };

    const handleTabChange = (tab: Tab) => {
      setActiveTab(tab);
      setIsSubmitted(false);
      setIsEmailPreviewOpen(false);
    };

    const emailTimestamp = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const emailUpdateType = submittedData?.updateType || 'General';
    const subjectPetpoojaId = submittedData?.petpoojaId?.trim();
    const subjectPrefix = subjectPetpoojaId ? '[Petpooja ' + subjectPetpoojaId + ']' : '[Petpooja]';
    const emailSubject = `${subjectPrefix} Menu Update Request {${emailUpdateType}} - ${submittedData?.restaurantName || '—'}`;
    const emailFrom = `${submittedData?.ownerName || '—'} <${submittedData?.email || '—'}>`;
    const selectedPlatforms = submittedData?.platforms?.length
      ? submittedData.platforms
          .map((p: string) => (p === 'Other' ? `Other (${submittedData?.otherPlatform || '—'})` : p))
          .join(', ')
      : '—';
    const outletSummary = submittedData?.outletType === 'Multiple Outlets'
      ? (submittedData?.outlets?.filter((o: string) => o)?.join(', ') || '—')
      : 'Single Outlet';
    const finalRemark = submittedData?.remarks || "";

    const plainEmailContent = [
      `Subject: ${emailSubject}`,
      `From: ${emailFrom}`,
      `To: support@petpooja.com`,
      ``,
      `Request Details`,
      `Restaurant Name: ${submittedData?.restaurantName || '—'}`,
      `Petpooja ID: ${submittedData?.petpoojaId || '—'}`,
      `Owner Name: ${submittedData?.ownerName || '—'}`,
      `Contact Number: ${submittedData?.contactNumber || '—'}`,
      `Email: ${submittedData?.email || '—'}`,
      ``,
      `Outlet Information`,
      `Outlet Type: ${submittedData?.outletType || '—'}`,
      `Outlets: ${outletSummary}`,
      ``,
      `Platform & Update`,
      `Platform(s): ${selectedPlatforms}`,
      `Update Type: ${submittedData?.updateType || '—'}`,
      `Attachment: ${submittedData?.fileName || '—'}`,
      ...(finalRemark ? [`Mail: ${finalRemark}`] : []),
      ``,
      `This is an auto-generated request from Petpooja Menu Update Portal.`,
    ].join('\n');

    const copyEmail = async () => {
      await navigator.clipboard.writeText(plainEmailContent);
    };

    const openMailClient = () => {
      const mailto = `mailto:support@petpooja.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(plainEmailContent)}`;
      window.location.href = mailto;
    };

    const navItems = [
      { id: 'menu-update', label: 'Menu Update Mail *(Guidance Only)', icon: LayoutDashboard, color: 'text-red-600' },
      { id: 'price-update', label: 'Price Update Guide', icon: Tag, color: 'text-blue-600' },
      { id: 'item-addition', label: 'Item Addition Guide', icon: PlusCircle, color: 'text-emerald-600' },
      { id: 'menu-format', label: 'Menu Format Guide', icon: FileText, color: 'text-amber-600' },
    ];

    const renderContent = () => {
      switch (activeTab) {
        case 'menu-update':
          return <MenuUpdateForm formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} />;
        case 'price-update':
          return <PriceUpdateGuide />;
        case 'item-addition':
          return <ItemAdditionGuide />;
        case 'menu-format':
          return <MenuFormatGuide />;
        default:
          return null;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#FDF5EE] text-[#1A0806] font-sans selection:bg-red-100 selection:text-red-600 overflow-x-hidden">
        {/* Background 3D Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-orbit-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full animate-orbit-reverse" />
          <div className="absolute top-[35%] left-[45%] w-72 h-72 bg-rose-300/10 blur-[100px] rounded-full animate-float-soft" />
          
          <FloatingElement emoji="🍕" className="top-[15%] left-[5%]" delay={0} />
          <FloatingElement emoji="🍔" className="top-[45%] right-[8%]" delay={1} />
          <FloatingElement emoji="🍜" className="bottom-[15%] left-[12%]" delay={2} />
          <FloatingElement emoji="🍩" className="bottom-[40%] right-[15%]" delay={0.5} />
          <FloatingElement emoji="☕" className="top-[10%] right-[25%]" delay={1.5} />
          <FloatingElement emoji="🍱" className="top-[70%] left-[30%]" delay={3} />
          <FloatingElement emoji="🌮" className="bottom-[5%] right-[40%]" delay={4} />
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex md:w-72 bg-white/80 backdrop-blur-xl border-r border-red-100 flex-col fixed left-0 top-0 h-screen overflow-hidden z-50 shadow-xl shadow-red-900/5">
          <div className="p-8 border-b border-red-50/50 mb-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight tracking-tight">Easy Petpooja Menu update Guide</h1>
              </div>
            </motion.div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-black transition-all duration-300 group relative overflow-hidden ${
                  activeTab === item.id 
                  ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' 
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? item.color : 'text-stone-500 group-hover:text-stone-950'} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-500 rounded-r-full shadow-[0_0_10px_rgba(232,0,28,0.4)]"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="p-6 mt-auto border-t border-red-50/50">
            <div className="bg-white p-4 rounded-2xl border border-red-50 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-600 font-bold">
                RA
              </div>
              <div>
                <p className="text-xs font-bold">Restaurant Admin</p>
                <p className="text-[10px] text-stone-400 font-medium">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto relative z-10 ml-0 md:ml-72">
          <header className="h-20 md:h-24 bg-white/70 backdrop-blur-md border-b border-red-50/50 sticky top-0 z-40 px-4 sm:px-6 md:px-10 flex items-center justify-between gap-3">
            <div>
              <motion.h2
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-black text-lg sm:text-xl md:text-2xl tracking-tight text-stone-950"
              >
                {navItems.find(i => i.id === activeTab)?.label}
              </motion.h2>
              <p className="hidden sm:block text-sm text-stone-500 font-black">Elevating your restaurant experience</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-white rounded-xl border border-stone-200 shadow-sm text-xs md:text-sm font-black text-stone-950">
                <Clock size={16} className="text-red-500" />
                Portal Active
              </div>
              <button type="button" className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-100 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/50" />
              </button>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 md:p-10 max-w-[92rem] mx-auto">
            <nav className="md:hidden mb-5">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id as Tab)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="max-w-4xl mx-auto relative"
                >
                  <div className="bg-white rounded-[34px] border border-stone-200 shadow-[0_22px_60px_rgba(28,10,8,0.22)] p-5 sm:p-8 md:p-12 text-center">
                    <div className="text-5xl sm:text-7xl mb-5">🎉</div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A0806] mb-3">Request Submitted!</h2>
                    <p className="text-black text-base sm:text-xl md:text-2xl font-bold mb-8 bg-red-500">This section is for guidance only. No email will be sent directly from here. It is provided solely to help you review and share the email with proper and complete details.</p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                      <span className="px-4 py-2 rounded-full bg-red-50 border border-red-100 text-sm font-black text-red-700">
                        {submittedData?.restaurantName || 'Restaurant'}
                      </span>
                      <span className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-black text-blue-700">
                        {submittedData?.updateType || 'Update'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEmailPreviewOpen(true)}
                        className="w-full sm:w-auto sm:min-w-56 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-red-600 text-white font-black text-lg sm:text-2xl shadow-[0_12px_28px_rgba(225,29,72,0.4)] hover:bg-red-700 transition-all"
                      >
                        📧 View Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="w-full sm:w-auto sm:min-w-44 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-blue-600 text-white font-black text-lg sm:text-2xl shadow-[0_12px_28px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all"
                      >
                        ✓ Done
                      </button>
                    </div>
                  </div>

                  {isEmailPreviewOpen && (
                    <div
                      className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
                      onClick={() => setIsEmailPreviewOpen(false)}
                    >
                      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white border border-stone-200 shadow-[0_24px_70px_rgba(0,0,0,0.25)] p-4 sm:p-6 md:p-8">
                        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl">📧</div>
                            <div>
                              <p className="text-xl sm:text-2xl md:text-3xl font-black text-stone-950">Email Preview</p>
                              <p className="text-sm sm:text-base text-stone-500 font-bold">Your request has been formatted as an email</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEmailPreviewOpen(false)}
                            className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="rounded-2xl border border-stone-200 overflow-hidden">
                          <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3">
                            <div className="font-black text-stone-950 text-lg">🍽️ Petpooja</div>
                            <div className="text-sm font-bold text-stone-500">{emailTimestamp}</div>
                          </div>
                          <div className="px-5 py-4 space-y-3 border-b border-stone-100 text-[15px]">
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4"><span className="w-20 text-stone-500 font-black">From</span><span className="font-bold text-stone-900 break-all">{emailFrom}</span></div>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4"><span className="w-20 text-stone-500 font-black">To</span><span className="font-bold text-stone-900 break-all">support@petpooja.com</span></div>
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4"><span className="w-20 text-stone-500 font-black">Subject</span><span className="font-black text-stone-950 break-words">{emailSubject}</span></div>
                          </div>

                          <div className="p-5 text-[14px] font-bold text-stone-700 space-y-5">
                            <div>
                              <p className="font-black text-stone-900 mb-2">📋 Request Details</p>
                              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-1">
                                <span>Restaurant Name</span><span>{submittedData?.restaurantName || '—'}</span>
                                <span>Petpooja ID</span><span>{submittedData?.petpoojaId || '—'}</span>
                                <span>Owner Name</span><span>{submittedData?.ownerName || '—'}</span>
                                <span>Contact Number</span><span>{submittedData?.contactNumber || '—'}</span>
                                <span>Email</span><span>{submittedData?.email || '—'}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-black text-stone-900 mb-2">📍 Outlet Information</p>
                              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-1">
                                <span>Outlet Type</span><span>{submittedData?.outletType ? (<span className="inline-block px-2 py-0.5 rounded bg-yellow-200 text-stone-900">{submittedData?.outletType}</span>) : '—'}</span>
                                <span>Outlets</span><span>{submittedData?.outletType ? (<span className="inline-block px-2 py-0.5 rounded bg-yellow-200 text-stone-900">{outletSummary}</span>) : outletSummary}</span>
                              </div>
                            </div>
                            <div>
                              <p className="font-black text-stone-900 mb-2">📱 Platform & Update</p>
                              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-1">
                                <span>Platform(s)</span><span>{selectedPlatforms}</span>
                                <span>Update Type</span><span>{submittedData?.updateType ? (<span className="inline-block px-2 py-0.5 rounded bg-yellow-200 text-stone-900">{submittedData?.updateType}</span>) : '—'}</span>
                              </div>
                            </div>
                            <p className="text-[13px] text-[#6B2418]">This is an auto-generated request from Petpooja Menu Update Portal.</p>
                          </div>

                          {submittedData?.fileName && (
                            <div className="px-5 py-4 border-t border-stone-100 bg-stone-50 text-sm">
                              <p className="font-black text-stone-600 mb-1">📎 Attachment</p>
                              <p className="font-bold text-stone-900">{submittedData.fileName}</p>
                            </div>
                          )}

                          {finalRemark && (
                            <div className="px-5 py-4 border-t border-stone-100 bg-red-50/40 text-sm">
                              <p className="font-black text-red-700 mb-1">Mail</p>
                              <p className="font-bold text-stone-900">{finalRemark}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEmailPreviewOpen(false)}
                            className="px-6 py-3 rounded-xl border border-stone-200 bg-white text-stone-700 font-black hover:bg-stone-50 transition-colors"
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            onClick={copyEmail}
                            className="px-6 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors"
                          >
                            📋 Copy Email
                          </button>
                          <button
                            type="button"
                            onClick={openMailClient}
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors"
                          >
                            📤 Open in Mail
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {renderContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    );
  }

  function SummaryItem({ label, value }: any) {
    return (
      <div>
        <p className="text-[12px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-stone-950">{value || 'Not provided'}</p>
      </div>
    );
  }

  function MenuUpdateForm({ formData, setFormData, onSubmit }: { formData: any, setFormData: any, onSubmit: (data: any) => void }) {
    const updateField = (field: string, value: any) => {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const updateOutlet = (index: number, value: string) => {
      const newOutlets = [...formData.outlets];
      newOutlets[index] = value;
      updateField('outlets', newOutlets);
    };

    const addOutlet = () => {
      updateField('outlets', [...formData.outlets, ""]);
    };

    const removeOutlet = (index: number) => {
      if (formData.outlets.length <= 1) return;
      const nextOutlets = formData.outlets.filter((_: string, i: number) => i !== index);
      updateField('outlets', nextOutlets);
    };

    const togglePlatform = (platform: string) => {
      setFormData((prev: any) => {
        const isSelected = prev.platforms.includes(platform);
        const newPlatforms = isSelected
          ? prev.platforms.filter((p: string) => p !== platform)
          : [...prev.platforms, platform];
        if (platform === 'Other' && isSelected) {
          return { ...prev, platforms: newPlatforms, otherPlatform: "" };
        }
        return { ...prev, platforms: newPlatforms };
      });
    };

    const isStep1Complete = formData.restaurantName && formData.ownerName && formData.contactNumber && formData.email;
    const isStep2Complete = formData.outletType === "Single Outlet" || formData.outlets.some(o => o.length > 0);
    const isOtherPlatformValid = !formData.platforms.includes('Other') || !!formData.otherPlatform?.trim();
    const isStep3Complete = formData.platforms.length > 0 && isOtherPlatformValid;
    const isStep4Complete = !!formData.updateType;
    const isStep5Complete = !!formData.fileName;
    const isStep6Complete = !!formData.remarks?.trim();
    const canSubmit = isStep1Complete && isStep2Complete && isStep3Complete && isStep4Complete && isStep5Complete && isStep6Complete;

    const getFirstIncompleteStep = () => {
      if (!isStep1Complete) return "01";
      if (!isStep2Complete) return "02";
      if (!isStep3Complete) return "03";
      if (!isStep4Complete) return "04";
      if (!isStep5Complete) return "05";
      if (!isStep6Complete) return "06";
      return null;
    };

    const handleSubmitClick = () => {
      if (canSubmit) {
        onSubmit(formData);
        return;
      }

      const firstIncompleteStep = getFirstIncompleteStep();
      if (!firstIncompleteStep) return;
      document.getElementById(`step-${firstIncompleteStep}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    return (
      <div className="space-y-8 md:space-y-12">
        {/* 3D Hero Section */}
        <TiltCard interactive={false}>
          <div className="bg-stone-900 rounded-[28px] md:rounded-[40px] p-6 sm:p-10 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-red-600/10 blur-[120px] rounded-full -mr-36 md:-mr-64 -mt-36 md:-mt-64 animate-pulse" />
            
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[12px] font-black uppercase tracking-widest text-red-400 mb-8"
              >
                <Sparkles size={14} className="animate-spin-slow" />
                Menu Management Portal
              </motion.div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 md:mb-6 leading-[1.05] md:leading-[0.95]">
                Update Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-red-500 bg-[length:200%_auto] animate-shimmer">Restaurant Menu</span>
              </h1>
              <p className="text-stone-300 max-w-lg text-base sm:text-lg md:text-xl leading-relaxed mb-8 md:mb-10 font-bold">
                Kindly fill in the required details to ensure the menu is updated properly.
              </p>
              
              <div className="flex flex-col gap-2">
                <p className="text-xl sm:text-2xl md:text-5xl font-black text-white tracking-tight break-words">+91 7969223344 | Petpooja Support</p>
                <p className="text-base sm:text-xl md:text-2xl font-black text-red-300 break-all">support@petpooja.com</p>
              </div>
            </div>
            
            {/* Floating 3D Icon */}
            <motion.div 
              animate={{ y: [0, -30, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 text-[200px] opacity-20 select-none pointer-events-none filter drop-shadow-[0_20px_30px_rgba(232,0,28,0.5)]"
            >
              🍱
            </motion.div>
          </div>
        </TiltCard>

        {/* Form Steps */}
        <div className="space-y-6">
          {/* Step 01: Basic Details */}
          <div id="step-01">
            <StepCard 
              step="01" 
              title="Basic Details" 
              icon={User} 
              color="red"
              isComplete={isStep1Complete}
            >
              <p className="text-stone-500 mb-6 -mt-6">Restaurant & owner contact information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Restaurant Name" placeholder="e.g. Spice Garden" value={formData.restaurantName} onChange={(v: string) => updateField('restaurantName', v)} />
                <Input label="Petpooja ID" placeholder="e.g. PP123456" value={formData.petpoojaId} onChange={(v: string) => updateField('petpoojaId', v)} />
                <Input label="Owner Name" placeholder="e.g. Ramesh Patel" value={formData.ownerName} onChange={(v: string) => updateField('ownerName', v)} />
                <Input label="Contact Number" placeholder=" +91 7969223344" value={formData.contactNumber} onChange={(v: string) => updateField('contactNumber', v)} />
                <Input label="Email Address" type="email" placeholder="owner@restaurant.com" value={formData.email} onChange={(v: string) => updateField('email', v)} />
              </div>
            </StepCard>
          </div>

          {/* Step 02: Outlet Selection */}
          <div id="step-02">
            <StepCard 
              step="02" 
              title="Outlet Selection" 
              icon={UtensilsCrossed} 
              color="blue"
              isComplete={isStep2Complete}
            >
              <p className="text-stone-500 mb-6 -mt-6">Single outlet or multiple locations</p>
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {['Single Outlet', 'Multiple Outlets'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('outletType', type)}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${
                        formData.outletType === type
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md'
                        : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-stone-200'
                      }`}
                    >
                      <span className="text-xl">{type === 'Single Outlet' ? '🏠' : '🏢'}</span>
                      {type}
                    </button>
                  ))}
                </div>

                {formData.outletType === 'Multiple Outlets' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {formData.outlets.map((outlet: string, i: number) => (
                      <div key={i} className="relative">
                        <Input 
                          label={`Outlet ${i + 1}`} 
                          placeholder={`Outlet ${i + 1} Name`} 
                          value={outlet} 
                          onChange={(v: string) => updateOutlet(i, v)} 
                        />
                        {formData.outlets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOutlet(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-xs font-black hover:bg-red-100 hover:text-red-700 transition-colors"
                            aria-label={`Remove outlet ${i + 1}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {formData.outletType === 'Multiple Outlets' && (
                  <button
                    type="button"
                    onClick={addOutlet}
                    className="px-6 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-700 font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all"
                  >
                    + Add Outlet
                  </button>
                )}
              </div>
            </StepCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <div id="step-03">
                <StepCard 
                  step="03" 
                  title="Platform Selection" 
                  icon={Smartphone} 
                  color="red"
                  isComplete={isStep3Complete}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Dine-In', 'Swiggy', 'Zomato', 'Other'].map((p, index) => (
                      <PlatformOption 
                        key={p} 
                        index={index}
                        name={p} 
                        selected={formData.platforms.includes(p)}
                        onToggle={() => togglePlatform(p)}
                        otherValue={formData.otherPlatform}
                        onOtherChange={(v: string) => updateField('otherPlatform', v)}
                      />
                    ))}
                  </div>
                  {formData.platforms.includes('Other') && !formData.otherPlatform?.trim() && (
                    <p className="mt-4 text-sm font-black text-red-600">
                      Other select kiya hai to remark mandatory hai.
                    </p>
                  )}
                </StepCard>
              </div>

              <div id="step-05">
                <StepCard 
                  step="05" 
                  title="Upload Menu File" 
                  icon={Upload} 
                  color="emerald"
                  isComplete={isStep5Complete}
                >
                  <FileUploadBox 
                    fileName={formData.fileName}
                    onFileChange={(name: string) => updateField('fileName', name)}
                  />
                  <p className="mt-4 text-sm font-bold text-stone-600 leading-relaxed">
                    The clearer and more properly formatted your menu file is, the easier it will be to process and understand. Please share a proper file.
                  </p>
                </StepCard>
              </div>
            </div>

            <div className="space-y-6">
              <div id="step-04">
                <StepCard 
                  step="04" 
                  title="Update Type" 
                  icon={Zap} 
                  color="amber"
                  isComplete={isStep4Complete}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Price Update', 'Item Addition', 'Item Removal', 'Full Menu Update'].map((t) => (
                        <RadioOption 
                          key={t} 
                          label={t} 
                          name="update-type" 
                          selected={formData.updateType === t}
                          onSelect={() => updateField('updateType', t)}
                        />
                      ))}
                    </div>
                  </div>
                </StepCard>
              </div>

              <div id="step-06">
                <StepCard 
                  step="06" 
                  title="Write a Mail" 
                  icon={Info} 
                  color="red"
                  isComplete={isStep6Complete}
                >
                  <div className="space-y-5">
                    <p className="text-stone-500 font-black text-sm uppercase tracking-widest">Compose your mail message</p>
                    <textarea 
                      value={formData.remarks}
                      onChange={(e) => updateField('remarks', e.target.value)}
                      placeholder="Dear Petpooja Team,&#10;Please update my menu with the above details..." 
                      rows={4}
                      className={`w-full border rounded-2xl px-6 py-4 text-base font-black text-stone-950 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/30 transition-all placeholder:text-stone-300 resize-none ${
                        formData.remarks?.length > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-stone-50 border-stone-200'
                      }`} 
                    />
                  </div>
                </StepCard>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmitClick}
            className={`w-full sm:w-auto px-8 sm:px-20 py-4 sm:py-7 rounded-[24px] font-black text-lg sm:text-2xl transition-all ${
              canSubmit
                ? 'bg-stone-950 text-white shadow-2xl hover:bg-stone-800 cursor-pointer'
                : 'bg-stone-300 text-stone-700 hover:bg-stone-400 cursor-pointer'
            }`}
          >
            Submit Request
          </motion.button>
        </div>
        {!canSubmit && (
          <p className="text-center text-sm font-black text-red-600">
            Step pending hai. Submit par first incomplete step open ho jayega.
          </p>
        )}
      </div>
    );
  }

  function StepCard({ step, title, icon: Icon, color, children, isComplete }: any) {
    const colors: any = {
      red: "text-[#D85A46]",
      blue: "text-blue-600",
      amber: "text-amber-600",
      emerald: "text-emerald-600",
    };

    return (
      <TiltCard interactive={false}>
        <div className={`rounded-[24px] md:rounded-[32px] p-5 sm:p-8 md:p-12 border h-full min-h-[16rem] md:min-h-[21rem] shadow-[0_14px_28px_rgba(26,8,6,0.08)] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(26,8,6,0.14)] ${
          isComplete 
          ? 'bg-emerald-50/50 border-emerald-200 shadow-emerald-900/10' 
          : 'bg-white border-[#F6C9BF] hover:border-[#ECA597]'
        }`}>
          <motion.div
            aria-hidden="true"
            animate={{ x: [0, 20, 0], y: [0, -12, 0], opacity: [0.18, 0.3, 0.18] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#FFD5CC]/50 to-transparent blur-2xl"
          />
          <div className="flex items-center gap-3 sm:gap-5 mb-6 md:mb-8 relative z-10">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-inner border transition-all duration-500 ${
              isComplete 
              ? 'bg-emerald-500 text-white border-emerald-400 scale-110' 
              : `bg-stone-50 ${colors[color]} border-stone-100 group-hover:scale-110`
            }`}>
              {isComplete ? <CheckCircle2 size={22} className="sm:w-8 sm:h-8" /> : <Icon size={22} className="sm:w-8 sm:h-8" />}
            </div>
            <div>
              <p className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                isComplete ? 'text-emerald-600' : colors[color]
              }`}>Step {step}</p>
              <h3 className="font-black text-xl sm:text-2xl text-stone-950">{title}</h3>
            </div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </TiltCard>
    );
  }

  function Input({ label, placeholder, type = "text", value = "", onChange }: any) {
    const hasValue = value?.length > 0;

    return (
      <div className="space-y-2">
        <label className="text-[12px] font-black text-stone-950 uppercase tracking-widest px-1">{label}</label>
        {type === "textarea" ? (
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} 
            rows={4}
            className={`w-full border rounded-2xl px-6 py-4 text-base font-black text-stone-950 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/30 transition-all placeholder:text-stone-300 resize-none ${
              hasValue ? 'bg-emerald-50 border-emerald-300' : 'bg-stone-50 border-stone-200'
            }`} 
          />
        ) : (
          <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} 
            className={`w-full border rounded-2xl px-6 py-4 text-base font-black text-stone-950 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500/30 transition-all placeholder:text-stone-300 ${
              hasValue ? 'bg-emerald-50 border-emerald-300' : 'bg-stone-50 border-stone-200'
            }`} 
          />
        )}
      </div>
    );
  }

  function FileUploadBox({ fileName, onFileChange }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasFile = !!fileName;

    const openPicker = () => fileInputRef.current?.click();

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      onFileChange(file ? file.name : "");
    };

    const clearSelectedFile = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onFileChange("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={openPicker}
          className={`w-full border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden ${
            hasFile 
            ? 'border-emerald-500 bg-emerald-50 shadow-inner' 
            : 'border-stone-200 hover:border-emerald-500/50 hover:bg-emerald-50/30'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner ${
            hasFile ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500'
          }`}>
            {hasFile ? <CheckCircle2 size={24} /> : <Upload size={24} />}
          </div>
          <p className={`text-lg font-black mb-1 ${hasFile ? 'text-emerald-700' : 'text-stone-950'}`}>
            {hasFile ? fileName : 'Drop your menu here'}
          </p>
          <p className={`text-[12px] font-black uppercase tracking-widest ${hasFile ? 'text-emerald-600' : 'text-stone-500'}`}>
            {hasFile ? 'Click to change file' : 'Image, PDF, Excel, Word, Text'}
          </p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.txt,.rtf,image/*"
          onChange={handleFileSelection}
          className="hidden"
        />

        {hasFile && (
          <button
            type="button"
            onClick={clearSelectedFile}
            className="text-sm font-black text-red-600 hover:text-red-700 transition-colors"
          >
            Remove selected file
          </button>
        )}
      </div>
    );
  }

  function PlatformOption({ name, selected, onToggle, otherValue, onOtherChange, index = 0 }: any) {
    const renderPlatformIcon = () => {
      switch (name) {
        case 'Dine-In':
          return (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="dineGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <path d="M5 3v7M8 3v7M5 7h3M6.5 10v11M14 3v6a2 2 0 0 0 2 2h1V3M17 11v10" stroke="url(#dineGrad)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        case 'Swiggy':
          return (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="swiggyGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <path d="M12 3c-3.2 0-5.8 2.6-5.8 5.8 0 2.3 1.2 4 3.1 5.9 1.1 1.2 2 2.4 2.7 3.5.7-1.1 1.6-2.3 2.7-3.5 1.9-1.9 3.1-3.6 3.1-5.9C17.8 5.6 15.2 3 12 3Z" stroke="url(#swiggyGrad)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.3 8.6h3.6M9.8 11h4.4" stroke="#9a3412" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          );
        case 'Zomato':
          return (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="zomatoGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <path d="M5 6h14L5 18h14" stroke="url(#zomatoGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        default:
          return (
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="otherGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="9" stroke="url(#otherGrad)" strokeWidth="1.9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#1e3a8a" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          );
      }
    };

    return (
      <div className="space-y-3">
        <motion.button
          type="button"
          onClick={onToggle}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 p-3 transition-all cursor-pointer group ${
            selected
              ? 'bg-[#FFEDE9] border-[#F28D7B] shadow-[0_12px_28px_rgba(242,141,123,0.32)]'
              : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-[0_8px_18px_rgba(120,113,108,0.12)]'
          }`}
        >
          <span className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-0.5 ${
            selected
              ? 'bg-gradient-to-br from-[#FF9C8A] via-[#F9735B] to-[#DB4D36] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_20px_rgba(239,102,74,0.5)]'
              : 'bg-gradient-to-br from-white via-stone-100 to-stone-200 text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_16px_rgba(120,113,108,0.2)]'
          }`}>
            {renderPlatformIcon()}
          </span>
          <span className={`text-[12px] font-black uppercase tracking-widest ${selected ? 'text-[#BE3B27]' : 'text-stone-900'}`}>{name}</span>
        </motion.button>
        {selected && name === 'Other' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Other Platform Remark</label>
            <input
              type="text"
              value={otherValue || ""}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Platform Name / Remark..."
              className={`w-full border rounded-xl px-4 py-3 text-sm font-black text-stone-950 focus:outline-none transition-all ${
                otherValue?.length > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-stone-50 border-stone-200'
              }`}
            />
          </motion.div>
        )}
      </div>
    );
  }
  function RadioOption({ label, name, selected, onSelect }: any) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`px-5 py-5 rounded-2xl border text-sm font-black transition-all text-center uppercase tracking-widest cursor-pointer ${
          selected 
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' 
          : 'border-stone-200 bg-stone-50 text-stone-950 hover:border-stone-300'
        }`}
      >
        {label}
      </button>
    );
  }

  // Guide Components
  function PriceUpdateGuideLegacy({ onProceed, onSubmit, formData, setFormData }: { onProceed: () => void, onSubmit: (data: any) => void, formData: any, setFormData: any }) {
    return (
      <div className="space-y-10">
        <GuideHeader 
          title="Price Update" 
          hindiTitle="प्राइस अपडेट" 
          description="Master the art of pricing."
          icon={Tag}
          color="text-blue-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GuideStep number="01" title="Open Menu" hindi="मेनू खोलें" content="Access your current digital menu file." />
          <GuideStep number="02" title="Mark Changes" hindi="बदलाव चिन्हित करें" content="Highlight items needing price adjustments." />
          <GuideStep number="03" title="New Prices" hindi="नई कीमतें" content="Clearly state the updated values." />
          <GuideStep number="04" title="Submit" hindi="सबमिट करें" content="Upload and relax, we'll handle the rest." />
        </div>
        <div className="pt-16 border-t border-stone-200">
          <div className="mb-10 text-center">
            <h3 className="text-4xl font-black text-stone-950 mb-4">Submit Price Update Request</h3>
            <p className="text-stone-500 font-bold text-xl">Fill the details below to proceed with your price changes.</p>
          </div>
          <MenuUpdateForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} />
        </div>
      </div>
    );
  }

  function PriceUpdateGuide() {
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const pdfUrl = encodeURI('/Price Update Guide/(1) Learn how to Price update in the menu (4).pdf');
    const content = {
      en: {
        title: 'How to Update Menu Prices',
        subtitle: 'A Step-by-Step Guide for PetPooja POS Users',
        notesTitle: 'Important Notes',
        footer: 'PetPooja POS Help Guide',
        steps: [
          {
            title: 'Step 1: Open the Dashboard',
            body: 'Go to billing.petpooja.com and log in to your account. After login, you will see the Dashboard page. From the dashboard, you can access all menu management features.',
          },
          {
            title: 'Step 2: Open the Menu Section',
            body: 'In the left sidebar, click on Menu. Then select Menu & Discounts. This will open the menu management page where all menu items are stored.',
          },
          {
            title: 'Step 3: Open All-in-One Menu',
            body: 'Click All in One Menu and select Manage Menu. This section allows you to manage menu items and prices across all ordering platforms.',
          },
          {
            title: 'Step 4: Choose the Area for Price Update',
            body: 'You can update prices for different service areas. Click the area where you want to update prices:',
            bullets: ['Home Delivery', 'Dine-in', 'Pickup', 'Swiggy', 'Zomato'],
            note: 'Example: Click Swiggy if you want to update Swiggy menu prices.',
          },
          {
            title: 'Step 5: Open Quick Actions',
            body: 'Click Quick Actions and select Update Area Price & Status. This option allows you to update menu prices in bulk using an Excel sheet.',
          },
          {
            title: 'Step 6: Download the Menu Item List',
            body: 'Click Download Item(s) List. Select the categories you want to update and click Download. A menu Excel file will be downloaded to your computer.',
          },
          {
            title: 'Step 7: Edit the Excel File',
            body: 'Open the downloaded Excel file. Update the required fields such as:',
            bullets: ['Online Display Name', 'Price', 'Description', 'Availability (Yes / No)'],
            note: 'You can change the item name or price directly in the Excel file.',
          },
          {
            title: 'Step 8: Save the File in CSV Format',
            body: 'After editing the file, click Save As. Choose CSV (Comma Delimited) format. Save the file on your computer. You can also rename the file before saving.',
          },
          {
            title: 'Step 9: Upload the Updated File',
            body: 'Go back to the menu management page. Click Quick Actions -> Update Area Price & Status again. Click Choose File, select the updated CSV file, and click Open.',
          },
          {
            title: 'Step 10: Upload and Apply Changes',
            body: 'After selecting the file, click Upload. A confirmation message will appear: "Menu uploaded successfully." This means your menu prices have been updated successfully.',
          },
        ],
        notes: [
          'To update Dine-in prices, download the Dine-in file and repeat the same process.',
          'For Swiggy and Zomato, you may need to trigger the menu after updating.',
          'If needed, you can send the CSV file to support@petpooja.com for assistance.',
        ],
      },
      hi: {
        title: 'मेनू प्राइस कैसे अपडेट करें',
        subtitle: 'PetPooja POS यूजर्स के लिए स्टेप-बाय-स्टेप गाइड',
        notesTitle: 'महत्वपूर्ण नोट्स',
        footer: 'PetPooja POS Help Guide',
        steps: [
          {
            title: 'स्टेप 1: डैशबोर्ड खोलें',
            body: 'billing.petpooja.com पर जाएं और अपने अकाउंट में लॉगिन करें। लॉगिन करने के बाद, आपको डैशबोर्ड पेज दिखाई देगा। डैशबोर्ड से, आप सभी मेनू मैनेजमेंट फीचर्स को एक्सेस कर सकते हैं।',
          },
          {
            title: 'स्टेप 2: मेनू सेक्शन खोलें',
            body: 'बाएं साइडबार में Menu पर क्लिक करें। फिर Menu & Discounts चुनें। इससे मेनू मैनेजमेंट पेज खुलेगा जहां सभी मेनू आइटम्स स्टोर होते हैं।',
          },
          {
            title: 'स्टेप 3: All-in-One Menu खोलें',
            body: 'All in One Menu पर क्लिक करें और Manage Menu चुनें। यह सेक्शन आपको सभी ऑर्डरिंग प्लेटफॉर्म पर मेनू आइटम्स और कीमतों को मैनेज करने की अनुमति देता है।',
          },
          {
            title: 'स्टेप 4: प्राइस अपडेट के लिए एरिया चुनें',
            body: 'आप विभिन्न सर्विस एरिया के लिए कीमतें अपडेट कर सकते हैं। जिस एरिया की कीमतें अपडेट करनी हैं, उस पर क्लिक करें:',
            bullets: ['होम डिलीवरी', 'डाइन-इन', 'पिकअप', 'स्विगी (Swiggy)', 'जोमाटो (Zomato)'],
            note: 'उदाहरण: अगर आप Swiggy की मेनू प्राइस अपडेट करना चाहते हैं तो Swiggy पर क्लिक करें।',
          },
          {
            title: 'स्टेप 5: क्विक एक्शन्स खोलें',
            body: 'Quick Actions पर क्लिक करें और Update Area Price & Status चुनें। यह विकल्प आपको एक्सेल शीट का उपयोग करके थोक में मेनू प्राइस अपडेट करने की अनुमति देता है।',
          },
          {
            title: 'स्टेप 6: मेनू आइटम लिस्ट डाउनलोड करें',
            body: 'Download Item(s) List पर क्लिक करें। आप जिस कैटेगरी को अपडेट करना चाहते हैं उसे सेलेक्ट करें और Download पर क्लिक करें। आपके कंप्यूटर पर एक मेनू एक्सेल फाइल डाउनलोड हो जाएगी।',
          },
          {
            title: 'स्टेप 7: एक्सेल फाइल में बदलाव करें',
            body: 'डाउनलोड की गई एक्सेल फाइल खोलें। आवश्यक फील्ड्स अपडेट करें जैसे:',
            bullets: ['Online Display Name', 'Price', 'Description', 'Availability (Yes / No)'],
            note: 'आप एक्सेल फाइल में सीधे आइटम का नाम या कीमत बदल सकते हैं।',
          },
          {
            title: 'स्टेप 8: फाइल को CSV फॉर्मेट में सेव करें',
            body: 'फाइल में बदलाव करने के बाद, Save As पर क्लिक करें। CSV (Comma Delimited) फॉर्मेट चुनें। फाइल को अपने कंप्यूटर पर सेव करें। आप सेव करने से पहले फाइल का नाम भी बदल सकते हैं।',
          },
          {
            title: 'स्टेप 9: अपडेट की गई फाइल अपलोड करें',
            body: 'वापस मेनू मैनेजमेंट पेज पर जाएं। Quick Actions -> Update Area Price & Status पर फिर से क्लिक करें। Choose File पर क्लिक करें, अपडेट की गई CSV फाइल सेलेक्ट करें, और Open पर क्लिक करें।',
          },
          {
            title: 'स्टेप 10: अपलोड करें और बदलाव लागू करें',
            body: 'फाइल सेलेक्ट करने के बाद, Upload पर क्लिक करें। एक कन्फर्मेशन मैसेज दिखाई देगा: "Menu uploaded successfully." इसका मतलब आपकी मेनू कीमतें सफलतापूर्वक अपडेट हो गई हैं।',
          },
        ],
        notes: [
          'Dine-in की कीमतें अपडेट करने के लिए, Dine-in फाइल डाउनलोड करें और वही प्रोसेस दोहराएं।',
          'Swiggy और Zomato के लिए, अपडेट करने के बाद आपको मेनू ट्रिगर करने की आवश्यकता हो सकती है।',
          'अगर जरूरत हो, तो आप सहायता के लिए CSV फाइल support@petpooja.com पर भेज सकते हैं।',
        ],
      },
    }[lang];

    return (
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-24 h-24 rounded-full bg-cyan-400/20 animate-pulse" />
          <div className="absolute top-[50%] left-[82%] w-32 h-32 rounded-full bg-blue-500/20 animate-pulse" />
          <div className="absolute top-[78%] left-[18%] w-16 h-16 rounded-full bg-cyan-300/20 animate-pulse" />
          <div className="absolute top-[28%] left-[60%] w-36 h-36 rounded-full border border-blue-300/35" />
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className="mb-8 rounded-2xl border border-cyan-300/35 bg-black/25 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-bold text-cyan-200">
                {lang === 'en' ? 'Quick PDF Guide' : 'PDF Guide'}
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs md:text-sm font-black text-cyan-200 hover:text-cyan-100 underline"
              >
                {lang === 'en' ? 'Open in New Tab' : 'New Tab mein kholo'}
              </a>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/20 bg-black/30">
              <iframe
                title="Price Update Guide PDF"
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-[760px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-full border text-sm font-black transition-all ${
                lang === 'en'
                  ? 'bg-cyan-500 border-cyan-500 text-white'
                  : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-4 py-2 rounded-full border text-sm font-black transition-all ${
                lang === 'hi'
                  ? 'bg-cyan-500 border-cyan-500 text-white'
                  : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
              }`}
            >
              Hindi
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-10 md:px-10 md:py-14 text-center shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
            <h2 className="text-3xl md:text-5xl font-black text-cyan-300">{content.title}</h2>
            <p className="mt-3 text-base md:text-lg font-bold text-stone-200">{content.subtitle}</p>
          </div>

          <div className="mt-8 space-y-6">
            {content.steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-6 transition-transform hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              >
                <h3 className="text-xl font-black text-cyan-300">{step.title}</h3>
                <p className="mt-3 text-stone-200 font-bold leading-relaxed">{step.body}</p>
                {step.bullets && (
                  <ul className="mt-3 list-disc pl-6 text-stone-200 font-bold leading-relaxed space-y-1">
                    {step.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                {step.note && <p className="mt-3 text-sm italic text-cyan-200 font-bold">{step.note}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-amber-300 bg-amber-200/10 p-6">
            <h3 className="text-xl font-black text-amber-200">{content.notesTitle}</h3>
            <ul className="mt-3 list-disc pl-6 text-amber-50 font-bold leading-relaxed space-y-2">
              {content.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-center text-stone-300 font-bold">{content.footer}</p>
        </div>
      </div>
    );
  }

  function ItemAdditionGuide() {
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const pdfUrl = encodeURI('/Item Addition Guide/(3) How To Item Additon in Menu (4).pdf');
    const content = {
      en: {
        title: 'How to Add a Menu Item in PetPooja POS',
        subtitle: 'Step-by-Step Guide for Restaurant Owners',
        tipLabel: 'Tip:',
        tip: 'Always verify price and category before saving.',
        footer: 'PetPooja Menu Help Guide',
        steps: [
          { title: 'Step 1: Login to Your Account', body: 'Open billing.petpooja.com and login using your credentials.' },
          { title: 'Step 2: Click on Menu', body: 'From the left sidebar click Menu to open menu management.' },
          { title: 'Step 3: Select Menu & Discounts', body: 'Inside Menu click Menu & Discounts to manage menu settings.' },
          { title: 'Step 4: Click All In One Menu', body: 'Locate All In One Menu and click Manage Menu.' },
          { title: 'Step 5: Select Required Area', body: 'Inside All In One Menu, select the section where you want to add items (example: Dine-in, Swiggy, Zomato).' },
          { title: 'Step 6: Click Add Items', body: 'Press the Add Items button on the top right.' },
          { title: 'Step 7: Open Item Form', body: 'Click on the grid row to open the item form.' },
          { title: 'Step 8: Fill Required Details', body: 'Name, Short Code, Category and Price are required for each item.' },
          { title: 'Step 9: Add Variations', body: 'Add sizes like Small, Medium, Large.' },
          { title: 'Step 10: Add Addons', body: 'Enable addons for extra toppings.' },
          { title: 'Step 11: Save the Item', body: 'Click Save & Exit.' },
          { title: 'Step 12: Activate and Sync', body: 'Activate item and sync menu for Swiggy and Zomato.' },
        ],
      },
      hi: {
        title: 'PetPooja POS में Menu Item कैसे जोड़ें',
        subtitle: 'रेस्टोरेंट मालिकों के लिए स्टेप-बाय-स्टेप गाइड',
        tipLabel: 'Tip:',
        tip: 'Save करने से पहले price और category जरूर check करें।',
        footer: 'PetPooja Menu Help Guide',
        steps: [
          { title: 'स्टेप 1: अपने अकाउंट में लॉगिन करें', body: 'billing.petpooja.com खोलें और अपने क्रेडेंशियल्स से लॉगिन करें।' },
          { title: 'स्टेप 2: Menu पर क्लिक करें', body: 'लेफ्ट साइडबार से Menu पर क्लिक करें ताकि menu management खुल सके।' },
          { title: 'स्टेप 3: Menu & Discounts चुनें', body: 'Menu के अंदर Menu & Discounts पर क्लिक करें ताकि menu settings manage कर सकें।' },
          { title: 'स्टेप 4: All In One Menu पर क्लिक करें', body: 'All In One Menu कार्ड में Manage Menu पर क्लिक करें।' },
          { title: 'स्टेप 5: जरूरी एरिया चुनें', body: 'All In One Menu के अंदर जिस section में item addition करनी है उसे select करें (उदाहरण: Dine-in, Swiggy, Zomato)।' },
          { title: 'स्टेप 6: Add Items पर क्लिक करें', body: 'ऊपर दाईं तरफ Add Items बटन दबाएं।' },
          { title: 'स्टेप 7: Item Form खोलें', body: 'Item form खोलने के लिए grid row पर क्लिक करें।' },
          { title: 'स्टेप 8: जरूरी जानकारी भरें', body: 'Name, Short Code, Category और Price जैसी जरूरी जानकारी भरें।' },
          { title: 'स्टेप 9: Variations जोड़ें', body: 'Small, Medium, Large जैसे size जोड़ें।' },
          { title: 'स्टेप 10: Addons जोड़ें', body: 'Extra toppings के लिए addons enable करें।' },
          { title: 'स्टेप 11: Item सेव करें', body: 'Save & Exit पर क्लिक करें।' },
          { title: 'स्टेप 12: Activate और Sync करें', body: 'Item activate करें और menu sync करें ताकि Swiggy और Zomato पर दिखे।' },
        ],
      },
    }[lang];

    return (
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1e1e2f] to-[#2d2d44] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-20 h-20 rounded-full bg-pink-500/25 animate-pulse" />
          <div className="absolute top-[50%] left-[82%] w-24 h-24 rounded-full bg-orange-500/20 animate-pulse" />
          <div className="absolute top-[78%] left-[18%] w-16 h-16 rounded-full bg-blue-400/20 animate-pulse" />
          <div className="absolute top-[28%] left-[60%] w-32 h-32 rounded-full border border-pink-400/40" />
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className="mb-8 rounded-2xl border border-pink-300/35 bg-black/25 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-bold text-pink-200">
                {lang === 'en' ? 'Quick PDF Guide' : 'PDF Guide'}
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs md:text-sm font-black text-pink-200 hover:text-pink-100 underline"
              >
                {lang === 'en' ? 'Open in New Tab' : 'New Tab mein kholo'}
              </a>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/20 bg-black/30">
              <iframe
                title="Item Addition Guide PDF"
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-[760px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-full border text-sm font-black transition-all ${
                lang === 'en'
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-4 py-2 rounded-full border text-sm font-black transition-all ${
                lang === 'hi'
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
              }`}
            >
              Hindi
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-10 md:px-10 md:py-14 text-center shadow-[0_14px_40px_rgba(0,0,0,0.32)]">
            <h2 className="text-3xl md:text-5xl font-black text-pink-300">{content.title}</h2>
            <p className="mt-3 text-base md:text-lg font-bold text-stone-200">{content.subtitle}</p>
          </div>

          <div className="mt-8 space-y-6">
            {content.steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-6 transition-transform hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              >
                <h3 className="text-xl font-black text-pink-300">{step.title}</h3>
                <p className="mt-3 text-stone-200 font-bold leading-relaxed">{step.body}</p>
                {index === content.steps.length - 1 && (
                  <div className="mt-5 rounded-xl border-l-4 border-amber-300 bg-amber-200/10 px-4 py-3 text-amber-100">
                    <span className="font-black">{content.tipLabel} </span>
                    <span className="font-bold">{content.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-stone-300 font-bold">{content.footer}</p>
        </div>
      </div>
    );
  }

  function MenuFormatGuideLegacy({ onProceed, onSubmit, formData, setFormData }: { onProceed: () => void, onSubmit: (data: any) => void, formData: any, setFormData: any }) {
    return (
      <div className="space-y-10">
        <GuideHeader 
          title="Menu Format" 
          hindiTitle="मेनू फ़ॉर्मेट" 
          description="Crafting the perfect menu file."
          icon={FileText}
          color="text-amber-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GuideStep number="01" title="Excel Power" hindi="एक्सेल का उपयोग" content="Use XLSX or CSV for maximum efficiency." />
          <GuideStep number="02" title="Columns" hindi="कॉलम" content="Category, Name, Price, Description, Tax." />
          <GuideStep number="03" title="Text Only" hindi="केवल टेक्स्ट" content="Avoid photos; text files process 2x faster." />
          <GuideStep number="04" title="Review" hindi="समीक्षा" content="Double check every detail before sending." />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-[32px] p-12 flex gap-10 items-start relative overflow-hidden shadow-sm"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full" />
          <div className="w-20 h-20 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/20 relative z-10">
            <Info size={40} />
          </div>
          <div className="relative z-10">
            <h4 className="text-amber-600 font-black text-2xl mb-6 uppercase tracking-widest">Remark / विशेष टिप्पणी:</h4>
            <p className="text-stone-950 font-black text-2xl leading-relaxed mb-6 italic">
              "Menu jitna easy aur acche se banaya hoga, utna menu update me aur samajhne me aasan hoga."
            </p>
            <p className="text-stone-600 font-black text-xl leading-relaxed">
              "मेनू जितना आसान और अच्छे से बनाया होगा, उतना ही मेनू अपडेट करने और समझने में आसानी होगी।"
            </p>
          </div>
        </motion.div>

        <div className="pt-16 border-t border-stone-200">
          <div className="mb-10 text-center">
            <h3 className="text-4xl font-black text-stone-950 mb-4">Submit Menu Update Request</h3>
            <p className="text-stone-500 font-bold text-xl">Ready with your file? Submit it here.</p>
          </div>
          <MenuUpdateForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} />
        </div>
      </div>
    );
  }

  function MenuFormatGuide() {
    const imageRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const excelRef = useRef<HTMLDivElement>(null);
    const excelSampleFile = '/Excel%20menu-samples/(2)%20New%20file%20template%20(3).xlsx';
    const pdfSamples = [
      '/pdf%20menu-samples/1.pdf',
      '/pdf%20menu-samples/2.pdf',
      '/pdf%20menu-samples/3.pdf',
      '/pdf%20menu-samples/4.pdf',
      '/pdf%20menu-samples/5.pdf',
      '/pdf%20menu-samples/6.pdf',
      '/pdf%20menu-samples/8.pdf',
      '/pdf%20menu-samples/9.pdf',
      '/pdf%20menu-samples/10.pdf',
    ];
    const [pdfUrl, setPdfUrl] = useState(pdfSamples[0]);

    const scrollToSection = (type: 'image' | 'pdf' | 'excel') => {
      const target = type === 'image' ? imageRef.current : type === 'pdf' ? pdfRef.current : excelRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const imageSamples = [
      '/menu-samples/01.jpg.jpg',
      '/menu-samples/02.jpg.jpg',
      '/menu-samples/03.jpg.jpg',
      '/menu-samples/04.jpg.jpg',
      '/menu-samples/05.jpg.jpg',
      '/menu-samples/06.jpg.jpg',
      '/menu-samples/07.jpg.jpg',
      '/menu-samples/08.jpg.jpg',
      '/menu-samples/09.jpg.jpg',
      '/menu-samples/10.jpg.jpg',
      '/menu-samples/11.jpg.jpg',
      '/menu-samples/12.jpg.jpg',
      '/menu-samples/13.jpg.jpg',
      '/menu-samples/14.jpg.jpg',
      '/menu-samples/15.jpg.jpg',
      '/menu-samples/16.jpg.jpg',
      '/menu-samples/17.jpg.jpg',
      '/menu-samples/18.jpg.jpg',
    ];

    const excelRows = [
      ['Category', 'Item Name', 'Price', 'Description', 'Tax'],
      ['Starters', 'Paneer Tikka', '220', 'Smoky grilled paneer cubes', '5'],
      ['Main Course', 'Paneer Butter Masala', '280', 'Rich creamy tomato gravy', '5'],
      ['Beverages', 'Masala Chaas', '60', 'Spiced buttermilk', '0'],
    ];

    return (
      <div className="space-y-10">
        <GuideHeader
          title="Menu Format"
          hindiTitle="Sample Format"
          description="Pick Excel, Image, or PDF and jump to sample below."
          icon={FileText}
          color="text-amber-500"
        />

        <div className="bg-white rounded-[28px] p-6 border border-stone-200 shadow-sm">
          <p className="text-stone-700 font-black text-lg mb-4">Select format to jump to sample:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button type="button" onClick={() => scrollToSection('excel')} className="px-6 py-4 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-colors">Excel</button>
            <button type="button" onClick={() => scrollToSection('image')} className="px-6 py-4 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-colors">Image</button>
            <button type="button" onClick={() => scrollToSection('pdf')} className="px-6 py-4 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-colors">PDF</button>
          </div>
        </div>

        <div ref={excelRef} className="bg-white rounded-[28px] p-8 border border-stone-200 shadow-sm overflow-x-auto">
          <h4 className="text-2xl font-black text-stone-950 mb-5">Excel Sample</h4>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <a
              href={excelSampleFile}
              download
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-colors"
            >
              Download Excel Sample
            </a>
            <a
              href={excelSampleFile}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 font-black hover:bg-emerald-100 transition-colors"
            >
              Open Excel File
            </a>
            <p className="text-sm font-bold text-stone-600 bg-red-500">
              *For better management, we recommend preparing the menu in an Excel file. This makes it easier to create, understand, and update the menu whenever needed.
            </p>
          </div>
          <table className="w-full min-w-[760px] border-collapse">
            <tbody>
              {excelRows.map((row, rowIndex) => (
                <tr key={row.join('-')} className={rowIndex === 0 ? 'bg-amber-100' : rowIndex % 2 ? 'bg-white' : 'bg-stone-50'}>
                  {row.map((cell) => (
                    <td key={cell} className="border border-stone-200 px-4 py-3 text-sm font-bold text-stone-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={imageRef} className="bg-white rounded-[28px] p-8 border border-stone-200 shadow-sm">
          <h4 className="text-2xl font-black text-stone-950 mb-5">Image Sample</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageSamples.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Menu sample image ${index + 1}`}
                className="w-full rounded-xl border border-stone-200 object-cover bg-stone-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div ref={pdfRef} className="bg-white rounded-[28px] p-8 border border-stone-200 shadow-sm">
          <h4 className="text-2xl font-black text-stone-950 mb-5">PDF Sample</h4>
          <div className="flex flex-wrap gap-3 mb-5">
            {pdfSamples.map((pdf) => {
              const label = pdf.match(/(\d+)\.pdf$/)?.[1] || '';
              return (
                <button
                  key={pdf}
                  type="button"
                  onClick={() => setPdfUrl(pdf)}
                  className={`px-5 py-3 rounded-xl text-xl font-black border transition-colors ${
                    pdfUrl === pdf ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  PDF {label}
                </button>
              );
            })}
          </div>
          {pdfUrl ? (
            <iframe title="Menu PDF sample" src={pdfUrl} className="w-full h-[520px] md:h-[760px] rounded-xl border border-stone-200 bg-stone-50" />
          ) : (
            <p className="text-stone-500 font-bold">Loading PDF sample...</p>
          )}
        </div>
      </div>
    );
  }

  function GuideHeader({ title, hindiTitle, description, icon: Icon, color }: any) {
    return (
      <div className="bg-white rounded-[24px] md:rounded-[40px] p-5 sm:p-8 md:p-12 border border-red-50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-3xl rounded-full -mr-48 -mt-48 group-hover:bg-red-500/10 transition-colors duration-700" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 md:gap-10">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[24px] md:rounded-[32px] bg-stone-50 ${color} flex items-center justify-center shadow-inner border border-stone-100`}
          >
            <Icon size={30} className="sm:w-10 sm:h-10 md:w-12 md:h-12" />
          </motion.div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-2 sm:mb-3">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-stone-950 tracking-tight">{title}</h2>
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-stone-200">/</span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-stone-600">{hindiTitle}</h2>
            </div>
            <p className="text-stone-600 text-base sm:text-xl md:text-2xl font-black">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  function GuideStep({ number, title, hindi, content }: any) {
    return (
      <TiltCard>
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-8 md:p-10 border border-red-50 h-full shadow-sm hover:border-red-100 transition-all group relative overflow-hidden">
          <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-red-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-8 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-50 text-stone-950 flex items-center justify-center text-base sm:text-xl font-black shadow-inner border border-stone-100 group-hover:bg-red-500 group-hover:text-white transition-all group-hover:scale-110">
              {number}
            </div>
            <div>
              <h4 className="font-black text-stone-950 text-base sm:text-xl uppercase tracking-widest">{title}</h4>
              <p className="text-[12px] font-black text-stone-500 uppercase tracking-[0.2em]">{hindi}</p>
            </div>
          </div>
          <p className="text-stone-600 font-black text-base sm:text-lg leading-relaxed relative z-10">{content}</p>
        </div>
      </TiltCard>
    );
  }
