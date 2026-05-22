import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { 
  Bell, 
  BookOpen, 
  Headphones, 
  MessageCircle, 
  Wind, 
  Home, 
  Compass, 
  User,
  Heart,
  Calendar,
  Play,
  Activity,
  HeartHandshake,
  PhoneCall,
  X,
  AlertTriangle,
  Stethoscope,
  PenTool,
  MoreHorizontal,
  Send,
  Bookmark,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Plus
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'depression' | 'journal' | 'proHelp' | 'addAgenda' | 'aiChat'>('none');
  
  // States for Depression Detection
  const [depressionStep, setDepressionStep] = useState(0);
  const [isCalling, setIsCalling] = useState(false);

  // States for Journal
  const [journalText, setJournalText] = useState("");

  // States for AI Chatbot
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Halo Nabil 👋 Aku asisten AI Calm.in. Ada cerita apa yang ingin kamu bagikan hari ini?' }
  ]);
  const [chatInput, setChatInput] = useState("");

  // States for IG-like Timeline
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // States for Schedule (Calendar View)
  const [selectedDate, setSelectedDate] = useState(14);
  const [agendas, setAgendas] = useState([
    { id: 1, title: 'Sesi Dr. Amanda L.', time: '14:00', type: 'session', date: 20 },
    { id: 2, title: 'Meditasi Pernapasan', time: '19:30', type: 'personal', date: 20 },
    { id: 3, title: 'Jurnal Malam', time: '21:00', type: 'personal', date: 20 },
    { id: 4, title: 'Jalan Pagi', time: '06:30', type: 'personal', date: 21 },
    { id: 5, title: 'Sesi Dr. Budi S.', time: '10:00', type: 'session', date: 22 },
  ]);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('12:00');

  const toggleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const handleAddAgenda = () => {
    if(newAgendaTitle.trim() === '') return;
    setAgendas([...agendas, {
      id: Date.now(),
      title: newAgendaTitle,
      time: newAgendaTime,
      type: 'personal',
      date: selectedDate
    }]);
    setActiveModal('none');
    setNewAgendaTitle('');
    toast.success('Agenda berhasil ditambahkan!');
  };

  // FUNGSI CHATBOT DENGAN INTEGRASI GROQ API (UPDATE MODEL)
  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    
    // 1. Tambahkan pesan user ke UI chat
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput("");
    
    // 2. Beri indikasi bahwa AI sedang memproses respons
    setChatMessages(prev => [...prev, { sender: 'ai', text: 'Malie sedang berpikir...' }]);
    
    try {
      // 3. Melakukan HTTP Request ke API Groq
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Model yang baru dan aktif
          messages: [
            {
              role: "system",
              content: "Kamu adalah Malie, seorang psikolog virtual sekaligus asisten pintar dari aplikasi kesehatan mental Calm.in. Jadilah pendengar yang penuh empati, validasi perasaan pengguna, gunakan bahasa Indonesia yang santun namun bersahabat, ramah, dan berikan dukungan emosional yang menenangkan. Pengguna aplikasi ini bernama Nabil."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Detail Error dari Groq Server:", errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const aiReply = data.choices[0].message.content;
        
        // 4. Perbarui teks indikasi loading dengan balasan nyata
        setChatMessages(prev => [
          ...prev.slice(0, -1),
          { sender: 'ai', text: aiReply }
        ]);
      } else {
        throw new Error("Struktur respons JSON tidak sesuai ekspektasi.");
      }

    } catch (error) {
      console.error("Gagal mendapatkan respon dari Groq AI:", error);
      // Jika error, hapus teks loading dan tampilkan pesan kesalahan
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'ai', text: 'Koneksiku ke server sedang terganggu. Bisa tolong kirim kembali pesanmu?' }
      ]);
    }
  };

  const moods = [
    { id: 'sad', emoji: '😞', label: 'Sedih' },
    { id: 'anxious', emoji: '😰', label: 'Cemas' },
    { id: 'neutral', emoji: '😐', label: 'Biasa' },
    { id: 'good', emoji: '🙂', label: 'Baik' },
    { id: 'great', emoji: '🥰', label: 'Luar Biasa' },
  ];

  const features = [
    { id: 'detect', icon: Activity, title: 'Deteksi Depresi', desc: 'Cek kondisimu', action: () => { setActiveModal('depression'); setDepressionStep(0); } },
    { id: 'journal', icon: BookOpen, title: 'Jurnal', desc: 'Ceritakan harimu disini', action: () => setActiveModal('journal') },
    { id: 'proHelp', icon: HeartHandshake, title: 'Psikolog', desc: 'Bantuan profesional', action: () => setActiveModal('proHelp') },
    { id: 'meditate', icon: Wind, title: 'Meditasi', desc: 'Relaksasi pikiran', action: () => toast('Memulai sesi Meditasi...', { icon: '🧘' }) },
  ];

  const proDoctors = [
    { name: "Dr. Amanda L.", spec: "Psikolog Klinis", rating: "4.9", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop" },
    { name: "Dr. Budi S.", spec: "Psikiater", rating: "4.8", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop" }
  ];

  const exploreStories = [
    { id: 1, user: 'Nafisa', avatar: "https://i.imgur.com/Q7j28cY.jpeg", seen: false },
    { id: 2, user: 'Calm.in', avatar: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=100&auto=format&fit=crop", seen: false },
    { id: 3, user: 'Ryan', avatar: "https://i.imgur.com/pnbJFwk.png", seen: true },
    { id: 4, user: 'Cerita Ment..', avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", seen: true },
    { id: 5, user: 'Zen', avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=100&auto=format&fit=crop", seen: true },
  ];

  const explorePosts = [
    {
      id: 1,
      user: "Dr. Amanda",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100&auto=format&fit=crop",
      time: "2 jam yang lalu",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=600&auto=format&fit=crop",
      likes: 342,
      caption: "Berjalan di alam bebas adalah salah satu cara terbaik untuk menjernihkan pikiran. Sempatkan waktu minimal 15 menit hari ini untuk menghirup udara segar dan fokus pada pernapasanmu. 🌿 #MentalHealth #SelfCare"
    },
    {
      id: 2,
      user: "Calm.in",
      avatar: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=100&auto=format&fit=crop",
      time: "5 jam yang lalu",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=600&auto=format&fit=crop",
      likes: 892,
      caption: "Menulis jurnal bukan tentang menyusun kalimat yang sempurna, tapi tentang membebaskan beban yang ada di kepalamu. Mulai tulis satu kalimat hari ini. 📖✨ #Journaling #Mindfulness"
    },
    {
      id: 3,
      user: "Cerita Mentalitas",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
      time: "1 hari yang lalu",
      image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=600&auto=format&fit=crop",
      likes: 1205,
      caption: "Tidak apa-apa jika hari ini kamu hanya bisa bertahan. Itu sudah pencapaian yang hebat. Teruslah melangkah, sekecil apapun itu. 💙 #YouAreEnough"
    }
  ];

  const navItems = [
    { id: 'home', icon: Home, label: 'Beranda' },
    { id: 'explore', icon: Compass, label: 'Eksplorasi' },
    { id: 'schedule', icon: Calendar, label: 'Jadwal' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    if (moodId === 'sad' || moodId === 'anxious') {
      setTimeout(() => {
        setActiveModal('depression');
        setDepressionStep(0);
      }, 500);
    }
  };

  const handleDetectionAnswer = (isDepressed: boolean) => {
    if (isDepressed) {
      setDepressionStep(1); // Detected!
      setTimeout(() => {
        setIsCalling(true); // Auto call
      }, 1500);
    } else {
      setActiveModal('none'); // Close if fine
    }
  };

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <Toaster position="top-center" richColors />

      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-sans p-4 sm:p-8 overflow-auto">
        
        <div className="w-[370px] h-[700px] shrink-0 rounded-[3rem] bg-background relative shadow-2xl overflow-hidden flex flex-col ring-8 ring-slate-800/90 dark:ring-slate-950">
          
          {/* Dynamic Header */}
          {currentTab !== 'home' && (
            <header className="px-6 pt-6 pb-3 flex justify-between items-center bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
              {currentTab === 'explore' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-center">
                  <h1 className="text-lg font-bold text-foreground tracking-tight">Eksplorasi</h1>
                </motion.div>
              )}

              {currentTab === 'schedule' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 text-center">
                  <h1 className="text-lg font-bold text-foreground tracking-tight">Jadwal</h1>
                </motion.div>
              )}

              {currentTab === 'weekly-detail' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full items-center">
                  <button onClick={() => setCurrentTab('home')} className="p-1.5 bg-secondary text-primary rounded-full hover:bg-primary hover:text-white transition-colors mr-3">
                    <ChevronLeft size={18} />
                  </button>
                  <h1 className="text-lg font-bold text-foreground tracking-tight flex-1 text-center pr-8">Detail Evaluasi</h1>
                </motion.div>
              )}

              {currentTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-between items-center">
                  <h1 className="text-lg font-bold text-foreground tracking-tight">Profilku</h1>
                  <button onClick={() => toast('Membuka pengaturan aplikasi...')} className="p-1.5 bg-secondary text-primary rounded-full"><Settings size={18} /></button>
                </motion.div>
              )}
            </header>
          )}

          {/* Scrollable Main Content area */}
          <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
            <AnimatePresence mode="wait">
              
              {/* --- HOME TAB --- */}
              {currentTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <div className="bg-background">
                    <div className="flex justify-between items-center px-6 pt-12 pb-4 border-b border-border/50">
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-[26px] font-extrabold text-foreground tracking-tight flex items-center gap-2">
                          Halo, Nabil <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-[15px] text-muted-foreground mt-0.5">Semoga harimu menyenangkan</p>
                      </motion.div>
                      <motion.button 
                        onClick={() => toast('Tidak ada notifikasi baru.')}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative p-3 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-900 dark:text-blue-100 hover:bg-blue-100 transition-colors self-start mt-1"
                      >
                        <Bell size={24} strokeWidth={2.5} />
                        <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-50 dark:border-slate-800"></span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="px-6 pt-6 space-y-8">
                  {/* Mood Tracker */}
                  <section>
                    <h2 className="text-lg font-bold text-foreground mb-4">Bagaimana perasaanmu hari ini?</h2>
                    <div className="flex justify-between items-center gap-2">
                      {moods.map((mood) => (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          key={mood.id}
                          onClick={() => handleMoodSelect(mood.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl w-[64px] h-[80px] transition-all duration-300 ${
                            selectedMood === mood.id 
                              ? 'bg-primary text-white shadow-xl shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' 
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          <span className="text-2xl mb-1.5">{mood.emoji}</span>
                          <span className={`text-[9px] font-bold text-center leading-tight ${selectedMood === mood.id ? 'text-white' : 'text-primary'}`}>
                            {mood.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </section>

                  {/* HRV (Heart Rate Variability) Status Card */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-lg font-bold text-foreground">Metrik Stres (HRV)</h2>
                      <span className="text-[10px] font-bold text-primary bg-secondary px-2 py-1 rounded-lg flex items-center gap-1">
                        <Activity size={12} /> Smartwatch Terhubung
                      </span>
                    </div>
                    
                    <div className="bg-card p-5 rounded-3xl border border-border shadow-sm flex flex-col gap-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
                          <Heart size={24} className="fill-current" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-foreground">Variabilitas Detak Jantung</h3>
                          <div className="flex items-end gap-1 mt-0.5">
                            <span className="text-2xl font-extrabold text-foreground leading-none">42</span>
                            <span className="text-xs font-bold text-muted-foreground mb-0.5">ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Indikator Skala */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
                          <span>Stres Tinggi</span>
                          <span>Rileks</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-orange-400 to-green-500 w-full opacity-20"></div>
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '42%' }} 
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-orange-500 h-full rounded-full relative z-10 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                          />
                        </div>
                      </div>
                      
                      {/* Konteks Psikologis */}
                      <div className="bg-orange-50 dark:bg-orange-900/10 p-3.5 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                          <span className="font-bold text-orange-600 dark:text-orange-400">Peringatan Sistem:</span> Skor HRV kamu saat ini lebih rendah dari rata-rata normal (65 ms). Ini adalah indikasi kuat bahwa sistem saraf simpatikmu sedang aktif (tubuh dalam kondisi stres, cemas, atau kelelahan).
                        </p>
                        <button 
                          onClick={() => toast('Memulai sesi relaksasi pernapasan...')} 
                          className="mt-2.5 w-full py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Mulai Sesi Grounding (2 Menit)
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Evaluasi Emosi Mingguan */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-lg font-bold text-foreground">Evaluasi Mingguan</h2>
                     <button onClick={() => setCurrentTab('weekly-detail')} className="text-[10px] font-bold text-primary bg-secondary px-2 py-1 rounded-lg hover:bg-primary hover:text-white transition-colors">
                        Lihat Detail
                      </button>
                    </div>
                    
                    <div className="bg-card p-5 rounded-3xl border border-border shadow-sm hover:border-primary/30 transition-colors">
                      <p className="text-sm font-medium text-foreground mb-4">
                        Dominan <span className="text-primary font-bold">Biasa (Neutral)</span> minggu ini.
                      </p>
                      
                      <div className="flex justify-between items-end h-24 gap-2 mb-2">
                        {[
                          { day: 'Sen', val: 40, color: 'bg-slate-300 dark:bg-slate-600' },
                          { day: 'Sel', val: 70, color: 'bg-primary/70' },
                          { day: 'Rab', val: 30, color: 'bg-red-400' },
                          { day: 'Kam', val: 60, color: 'bg-slate-300 dark:bg-slate-600' },
                          { day: 'Jum', val: 80, color: 'bg-green-400' },
                          { day: 'Sab', val: 90, color: 'bg-green-400' },
                          { day: 'Min', val: 50, color: 'bg-slate-300 dark:bg-slate-600' },
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
                            <div className="w-full flex items-end justify-center h-20 bg-slate-100 dark:bg-slate-800/50 rounded-md overflow-hidden relative">
                              <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: `${item.val}%` }} 
                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                className={`w-full rounded-md ${item.color}`} 
                              />
                            </div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.day}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 bg-secondary/40 dark:bg-secondary/10 p-3.5 rounded-xl border border-border flex gap-2 items-start">
                        <span className="text-base leading-none mt-0.5">💡</span>
                        <p className="text-[11px] text-foreground font-medium leading-relaxed">
                          Ada sedikit penurunan mood di hari Rabu. Pastikan kamu mendapat istirahat yang cukup akhir pekan ini ya!
                        </p>
                      </div>
                    </div>
                  </section>
                    
                  {/* Daily Affirmation Card */}
                  <section>
                    <div className="bg-primary text-primary-foreground rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-primary/20">
                      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-secondary/20 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[11px] font-semibold tracking-wide uppercase mb-4 backdrop-blur-md">Kutipan Hari Ini</span>
                        <p className="text-[17px] font-medium leading-relaxed mb-6">"Tidak apa-apa untuk beristirahat. Kesejahteraan pikiranmu jauh lebih penting daripada produktivitasmu."</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/70 font-medium">~ Pengingat Harian</span>
                          <motion.button onClick={() => toast.success('Kutipan disimpan ke favorit!')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white hover:text-primary transition-colors backdrop-blur-md">
                            <Heart size={18} className="fill-current" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Quick Actions Grid */}
                  <section>
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-lg font-bold text-foreground">Aktivitas Cepat</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {features.map((feature) => (
                        <motion.div 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          key={feature.id}
                          onClick={feature.action}
                          className="bg-card p-4 rounded-3xl shadow-sm border border-border flex flex-col cursor-pointer group hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          <div className="w-12 h-12 bg-secondary text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <feature.icon size={22} strokeWidth={2.5} />
                          </div>
                          <h3 className="font-bold text-foreground">{feature.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{feature.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                  </div>
                </motion.div>
              )}

              {/* --- WEEKLY DETAIL PAGE --- */}
              {currentTab === 'weekly-detail' && (
                <motion.div
                  key="weekly-detail"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                  className="px-6 pt-6 space-y-6 flex flex-col"
                >
                  <div className="bg-gradient-to-br from-primary to-blue-950 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                      <Activity size={120} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">Periode: 16 - 22 Mei 2026</span>
                    <h2 className="text-xl font-extrabold mt-2">Kondisi Mental Stabil</h2>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">Secara keseluruhan, kestabilan emosimu minggu ini berada di tingkat yang baik dengan dominasi emosi Biasa (Neutral) dan Baik (Good).</p>
                  </div>

                  {/* Distribusi Emosi */}
                  <section className="bg-card p-5 rounded-3xl border border-border shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">📊 Distribusi Emosi</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Biasa (Neutral)', percentage: 45, count: '3 Hari', color: 'bg-primary' },
                        { label: 'Baik & Luar Besar', percentage: 35, count: '2 Hari', color: 'bg-green-400' },
                        { label: 'Sedih & Cemas', percentage: 20, count: '2 Hari', color: 'bg-red-400' },
                      ].map((mood, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium text-foreground">
                            <span>{mood.label}</span>
                            <span className="text-muted-foreground font-bold">{mood.count} ({mood.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${mood.percentage}%` }} 
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full rounded-full ${mood.color}`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Korelasi Data Fisiologis */}
                  <section className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-3xl border border-border shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Rata-rata HRV</span>
                      </div>
                      <div className="text-xl font-extrabold text-foreground">48 <span className="text-xs font-bold text-muted-foreground">ms</span></div>
                      <p className="text-[10px] text-orange-600 font-medium mt-1 leading-tight">Mencapai titik terendah pada hari Rabu (Indikasi Stres).</p>
                    </div>

                    <div className="bg-card p-4 rounded-3xl border border-border shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-blue-500" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Detak Jantung</span>
                      </div>
                      <div className="text-xl font-extrabold text-foreground">74 <span className="text-xs font-bold text-muted-foreground">BPM</span></div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Rentang detak jantung istirahat stabil dan normal.</p>
                    </div>
                  </section>

                  <section className="bg-card p-5 rounded-3xl border border-border shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-foreground">🔍 Analisis Pemicu & Gejala</h3>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 text-xs">
                        <div className="font-bold text-red-700 dark:text-red-400 mb-0.5">Rabu, 20 Mei — Fluktuasi Emosi Tinggi</div>
                        <p className="text-muted-foreground leading-relaxed">Penurunan HRV tajam terdeteksi selaras dengan isi jurnal harian Anda yang mengindikasikan tekanan beban kerja berlebih.</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs">
                        <div className="font-bold text-green-700 dark:text-green-400 mb-0.5">Kamis - Jumat — Pemulihan Berhasil</div>
                        <p className="text-muted-foreground leading-relaxed">Stabilitas emosi kembali naik dipicu oleh aktivitas latihan pernapasan/meditasi malam yang Anda terapkan secara teratur.</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-card p-5 rounded-3xl border border-border shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-foreground">🎯 Rekomendasi Langkah Selanjutnya</h3>
                    <ul className="space-y-2 text-xs text-muted-foreground pl-1">
                      <li className="flex items-start gap-2 leading-relaxed">
                        <span className="text-primary font-bold">•</span>
                        <span>Lanjutkan rutinitas meditasi pernapasan malam sebelum jam 21:00 untuk menjaga kesiapan kualitas istirahat.</span>
                      </li>
                      <li className="flex items-start gap-2 leading-relaxed">
                        <span className="text-primary font-bold">•</span>
                        <span>Jika mendapati kecemasan berulang di tengah minggu, manfaatkan tombol latihan pernapasan kilat untuk menstabilkan kondisi fisik segera.</span>
                      </li>
                    </ul>
                  </section>
                </motion.div>
              )}
              
              {/* --- EXPLORE TAB --- */}
              {currentTab === 'explore' && (
                <motion.div 
                  key="explore"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  className="flex flex-col bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="flex gap-4 px-4 py-4 overflow-x-auto hide-scrollbar bg-background border-b border-border">
                    {exploreStories.map(story => (
                      <div 
                        key={story.id} 
                        onClick={() => toast(`Membuka cerita dari ${story.user}...`)} 
                        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <div className={`p-0.5 rounded-full ${story.seen ? 'bg-border' : 'bg-gradient-to-tr from-primary to-blue-400'}`}>
                          <img src={story.avatar} alt={story.user} className="w-[60px] h-[60px] rounded-full border-[3px] border-background object-cover" />
                        </div>
                        <span className="text-[10px] font-semibold text-foreground truncate w-[64px] text-center">{story.user}</span>
                      </div>
                    ))}
                  </div>

                  {explorePosts.map((post) => {
                    const isLiked = likedPosts.includes(post.id);
                    return (
                      <div key={post.id} className="mb-4 bg-background border-b border-border shadow-sm pb-4">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover ring-2 ring-secondary ring-offset-1" />
                            <div>
                              <div className="font-bold text-sm text-foreground">{post.user}</div>
                              <div className="text-xs text-muted-foreground">{post.time}</div>
                            </div>
                          </div>
                          <button onClick={() => toast('Opsi post dibuka')} className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={20} /></button>
                        </div>
                        <img src={post.image} alt="Post content" className="w-full aspect-[4/5] object-cover" />
                        <div className="p-4 pb-2 flex justify-between items-center">
                          <div className="flex gap-4">
                            <button onClick={() => toggleLike(post.id)} className={`transition-transform active:scale-75 ${isLiked ? 'text-red-500' : 'text-foreground'}`}>
                              <Heart size={26} className={isLiked ? "fill-current" : ""} />
                            </button>
                            <button onClick={() => toast('Fitur komentar akan segera hadir')} className="text-foreground hover:text-primary"><MessageCircle size={26} /></button>
                            <button onClick={() => toast.success('Postingan berhasil dibagikan!')} className="text-foreground hover:text-primary"><Send size={26} /></button>
                          </div>
                          <button onClick={() => toast.success('Disimpan ke koleksimu')} className="text-foreground hover:text-primary"><Bookmark size={26} /></button>
                        </div>
                        <div className="px-4">
                          <div className="font-bold text-sm mb-1">{isLiked ? post.likes + 1 : post.likes} suka</div>
                          <div className="text-sm text-foreground leading-relaxed">
                            <span className="font-bold mr-2">{post.user}</span>
                            {post.caption}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* --- SCHEDULE TAB --- */}
              {currentTab === 'schedule' && (
                <motion.div 
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  className="flex flex-col h-[calc(100vh-140px)] sm:h-[700px] bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="bg-background px-6 py-4 border-b border-border shadow-sm sticky top-0 z-40">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-bold text-foreground text-lg">May 2026</h2>
                      <button onClick={() => setActiveModal('addAgenda')} className="py-2 px-4 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 flex items-center gap-1.5 text-xs font-bold transition-all">
                        <Plus size={16} /> Tambah Agenda
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                       {[{d: 18, day: 'Sen'}, {d: 19, day: 'Sel'}, {d: 20, day: 'Rab'}, {d: 21, day: 'Kam'}, {d: 22, day: 'Jum'}, {d: 23, day: 'Sab'}, {d: 24, day: 'Min'}].map(item => (
                         <button 
                           key={item.d}
                           onClick={() => setSelectedDate(item.d)}
                           className={`flex flex-col items-center p-2.5 rounded-2xl w-[45px] transition-colors ${selectedDate === item.d ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-secondary'}`}
                         >
                           <span className="text-[10px] font-bold mb-1 uppercase">{item.day}</span>
                           <span className="text-sm font-extrabold">{item.d}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="px-6 py-6 flex-1 overflow-y-auto">
                    {agendas.filter(a => a.date === selectedDate).length === 0 ? (
                      <div className="text-center mt-12 text-muted-foreground">
                        <div className="w-16 h-16 bg-secondary text-primary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar size={28} />
                        </div>
                        <p className="text-sm font-bold text-foreground">Tidak ada agenda.</p>
                        <p className="text-xs mt-1">Tambahkan aktivitas untuk menjaga rutinitasmu.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {agendas.filter(a => a.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time)).map((agenda, i, arr) => (
                          <div key={agenda.id} className="flex gap-4 relative">
                            {i !== arr.length - 1 && (
                              <div className="absolute top-[28px] bottom-[-28px] left-[59px] w-[2px] bg-border z-0"></div>
                            )}

                            <div className="w-10 text-right text-[11px] font-extrabold text-muted-foreground pt-1.5">
                              {agenda.time}
                            </div>
                            
                            <div className="relative flex flex-col items-center pt-2 z-10">
                              <div className={`w-3 h-3 rounded-full outline outline-4 outline-background ${agenda.type === 'session' ? 'bg-primary' : 'bg-blue-400'}`}></div>
                            </div>

                            <div className={`flex-1 p-4 mb-4 rounded-3xl border ${agenda.type === 'session' ? 'bg-secondary border-primary/20 text-primary shadow-sm' : 'bg-card border-border shadow-sm text-foreground hover:border-primary/30'} transition-colors`}>
                              <h4 className="font-bold text-sm mb-1">{agenda.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${agenda.type === 'session' ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {agenda.type === 'session' ? 'Konsultasi Ahli' : 'Aktivitas Pribadi'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* --- PROFILE TAB --- */}
              {currentTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  className="px-6 pt-6 space-y-8 flex flex-col items-center"
                >
                  <div className="relative">
                    <img 
                      src="https://i.imgur.com/6zWSqjF.jpeg" 
                      alt="Profile" 
                      className="w-28 h-28 rounded-full border-4 border-background shadow-xl object-cover ring-4 ring-secondary" 
                    />
                    <button onClick={() => toast('Membuka pengaturan foto profil')} className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                      <PenTool size={14} />
                    </button>
                  </div>
                  
                  <div className="text-center w-full">
                    <h2 className="text-2xl font-bold text-foreground">Nabil Albar Lukman Ali</h2>
                    <p className="text-sm text-muted-foreground mt-1">nabilalbarlukmanali@mail.ugm.ac.id</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full">
                    <div className="bg-card p-4 rounded-3xl text-center border border-border shadow-sm">
                      <div className="text-xl font-bold text-primary">12</div>
                      <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Jurnal</div>
                    </div>
                    <div className="bg-card p-4 rounded-3xl text-center border border-border shadow-sm">
                      <div className="text-xl font-bold text-primary">5j</div>
                      <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Meditasi</div>
                    </div>
                    <div className="bg-card p-4 rounded-3xl text-center border border-border shadow-sm">
                      <div className="text-xl font-bold text-primary">3</div>
                      <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Sesi</div>
                    </div>
                  </div>

                  <div className="w-full bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    {[
                      { icon: User, label: "Detail Akun" },
                      { icon: Activity, label: "Laporan Mental" },
                      { icon: Bookmark, label: "Post Disimpan" },
                      { icon: MessageCircle, label: "Bantuan & Dukungan" },
                    ].map((item, i) => (
                      <button key={i} onClick={() => toast(`Membuka ${item.label}...`)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-border last:border-0">
                        <div className="flex items-center gap-3 text-foreground">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary">
                            <item.icon size={16} />
                          </div>
                          <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => toast('Berhasil keluar akun. Sampai jumpa!')} className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors">
                    <LogOut size={18} /> Keluar Akun
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* Bottom Navigation */}
          <nav className="absolute bottom-0 w-full bg-background/90 backdrop-blur-2xl border-t border-border/50 z-20 pt-3 pb-4 sm:pb-2 px-6">
            <div className="flex justify-between items-center relative w-full">
              {navItems.map((item, index) => {
                const isActive = currentTab === item.id || (item.id === 'home' && currentTab === 'weekly-detail');
                
                return (
                  <React.Fragment key={item.id}>
                    {index === 2 && (
                      <div className="relative flex items-center justify-center -mt-10 px-2 z-30">
                        <button 
                          onClick={() => setActiveModal('aiChat')}
                          className="w-[60px] h-[60px] bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all border-[5px] border-background"
                        >
                          <MessageCircle size={28} />
                        </button>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setCurrentTab(item.id)}
                      className="flex flex-col items-center justify-center p-2 group"
                    >
                      <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-110' : 'text-muted-foreground group-hover:bg-secondary group-hover:text-primary'}`}>
                        <item.icon size={isActive ? 24 : 22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-[360px] bg-background rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {(!isCalling || activeModal !== 'depression') && (
                <button onClick={() => { setActiveModal('none'); setIsCalling(false); }} className="absolute top-4 right-4 p-2 bg-muted text-muted-foreground rounded-full hover:bg-slate-200 transition-colors z-10">
                  <X size={18} />
                </button>
              )}

              {/* 1. Add Agenda Flow */}
              {activeModal === 'addAgenda' && (
                <div className="p-6 pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                    <div><h3 className="text-lg font-bold text-foreground leading-tight">Tambah Agenda</h3><p className="text-xs text-muted-foreground">Jadwalkan aktivitasmu hari ini</p></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nama Agenda</label>
                      <input 
                        type="text" value={newAgendaTitle} onChange={e => setNewAgendaTitle(e.target.value)} 
                        placeholder="Contoh: Meditasi Malam" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Waktu</label>
                      <input 
                        type="time" value={newAgendaTime} onChange={e => setNewAgendaTime(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium" 
                      />
                    </div>
                    
                    <button onClick={handleAddAgenda} className="w-full py-4 mt-2 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
                      <Plus size={18} /> Simpan Agenda
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Depression Detection Flow */}
              {activeModal === 'depression' && (
                <div className="p-6 pt-10 flex flex-col items-center text-center">
                  {!isCalling ? (
                    <>
                      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} /></div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{depressionStep === 0 ? "Cek Kondisi Mentalmu" : "Indikasi Terdeteksi"}</h3>
                      <p className="text-sm text-muted-foreground mb-8">
                        {depressionStep === 0 ? "Apakah dalam 2 minggu terakhir kamu sering merasa putus asa, sangat sedih, atau berpikir menyakiti diri sendiri?" : "Sistem mendeteksi adanya indikasi depresi berat. Kami akan segera menghubungkanmu dengan bantuan profesional."}
                      </p>
                      {depressionStep === 0 ? (
                        <div className="w-full space-y-3">
                          <button onClick={() => handleDetectionAnswer(true)} className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-colors">Ya, Saya Merasakannya</button>
                          <button onClick={() => handleDetectionAnswer(false)} className="w-full py-3.5 bg-secondary text-primary font-bold rounded-2xl hover:bg-secondary/80 transition-colors">Tidak, Saya Cukup Baik</button>
                        </div>
                      ) : (
                        <div className="w-full"><div className="animate-pulse flex items-center justify-center gap-2 text-primary font-bold"><Activity className="animate-spin" size={20} />Menyiapkan Panggilan...</div></div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 flex flex-col items-center w-full">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-red-500/40"><PhoneCall size={40} className="text-white animate-pulse" /></div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">119</h3>
                      <p className="text-red-500 font-bold text-sm mb-8 uppercase tracking-widest">Memanggil Layanan Darurat</p>
                      <button onClick={() => { setActiveModal('none'); setIsCalling(false); toast('Panggilan darurat dibatalkan.'); }} className="px-8 py-3 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-colors flex items-center gap-2"><X size={18} /> Batalkan</button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Journal Flow */}
              {activeModal === 'journal' && (
                <div className="p-6 pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center"><BookOpen size={20} /></div>
                    <div><h3 className="text-lg font-bold text-foreground leading-tight">Jurnal</h3><p className="text-xs text-muted-foreground">Apa yang kamu pikirkan saat ini?</p></div>
                  </div>
                  <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Ceritakan harimu dengan jujur di sini..." className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
                  <button onClick={() => { setActiveModal('none'); setJournalText(''); toast.success('Jurnal berhasil disimpan! Kamu hebat.'); }} className="w-full py-3.5 mt-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 flex items-center justify-center gap-2"><PenTool size={18} /> Simpan Jurnal</button>
                </div>
              )}

              {/* 4. Professional Help Flow */}
              {activeModal === 'proHelp' && (
                <div className="p-6 pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center"><Stethoscope size={20} /></div>
                    <div><h3 className="text-lg font-bold text-foreground leading-tight">Bantuan Psikolog</h3><p className="text-xs text-muted-foreground">Konsultasi dengan ahli kami</p></div>
                  </div>
                  <div className="space-y-4">
                    {proDoctors.map((doc, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border border-border rounded-2xl bg-card">
                        <img src={doc.image} alt={doc.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{doc.name}</h4>
                          <p className="text-xs text-primary font-medium">{doc.spec}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><span className="text-orange-400">★</span> {doc.rating}</div>
                        </div>
                        <button onClick={() => toast(`Memulai obrolan dengan ${doc.name}...`)} className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><MessageCircle size={18} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AI Chatbot Flow */}
              {activeModal === 'aiChat' && (
                <div className="flex flex-col h-[550px] w-full bg-background rounded-3xl overflow-hidden relative">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-secondary/20 shrink-0">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">Malie</h3>
                      <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white dark:bg-slate-800 border border-border text-foreground rounded-2xl rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input Area */}
                  <div className="p-4 bg-background border-t border-border flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Ketik ceritamu di sini..."
                      className="flex-1 bg-secondary/30 dark:bg-slate-800 border border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground font-medium"
                    />
                    <button 
                      onClick={handleSendChatMessage} 
                      className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 shrink-0 shadow-md transition-transform active:scale-95"
                    >
                      <Send size={18} className="-ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}