import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, cn } from '../components/ui/core';
import {
  User,
  Stethoscope,
  ArrowRight,
  Activity,
  Phone,
  ShieldCheck,
  Mail,
  Globe,
  Search,
  ChevronRight,
  Building2,
  Video,
  BookOpen,
  HeartPulse,
  Hospital,
  Sparkles,
  Star,
  Clock3,
  MapPin,
  TabletSmartphone,
  BadgeCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../lib/firebase';
import { showToast } from '../lib/toast';

function createIllustration(title: string, subtitle: string, accent: string, glow: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fbff" />
          <stop offset="100%" stop-color="#e8f1ff" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${accent}" />
          <stop offset="100%" stop-color="#${glow}" />
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="26" /></filter>
      </defs>
      <rect width="1200" height="800" rx="48" fill="url(#bg)" />
      <circle cx="970" cy="120" r="130" fill="#dbeafe" opacity="0.65" filter="url(#blur)" />
      <circle cx="220" cy="650" r="160" fill="#c7d2fe" opacity="0.55" filter="url(#blur)" />
      <rect x="90" y="110" width="360" height="580" rx="36" fill="#ffffff" opacity="0.72" />
      <rect x="490" y="110" width="620" height="580" rx="36" fill="#ffffff" opacity="0.86" />
      <rect x="540" y="160" width="220" height="24" rx="12" fill="#93c5fd" opacity="0.7" />
      <rect x="540" y="210" width="350" height="18" rx="9" fill="#cbd5e1" />
      <rect x="540" y="245" width="300" height="18" rx="9" fill="#cbd5e1" />
      <rect x="540" y="310" width="470" height="220" rx="28" fill="url(#accent)" opacity="0.9" />
      <circle cx="703" cy="420" r="82" fill="#ffffff" opacity="0.92" />
      <path d="M700 378c20 0 36 16 36 36s-16 36-36 36-36-16-36-36 16-36 36-36zm0 16a20 20 0 1 0 0 40 20 20 0 0 0 0-40zm-72 116c0-40 32-72 72-72s72 32 72 72" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" />
      <rect x="150" y="180" width="220" height="320" rx="30" fill="url(#accent)" opacity="0.95" />
      <circle cx="260" cy="300" r="66" fill="#ffffff" opacity="0.92" />
      <path d="M238 300h44M260 278v44" stroke="#2563eb" stroke-width="20" stroke-linecap="round" />
      <rect x="190" y="390" width="140" height="18" rx="9" fill="#ffffff" opacity="0.8" />
      <rect x="190" y="425" width="110" height="18" rx="9" fill="#ffffff" opacity="0.65" />
      <text x="540" y="610" fill="#0f172a" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800">${title}</text>
      <text x="540" y="660" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="600">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const featuredSpecialties = [
  {
    label: 'Dermatologist',
    image: createIllustration('Skin Care', 'Dermatology consult', '60a5fa', '818cf8'),
    description: 'Skin, acne, and cosmetic care',
  },
  {
    label: 'Gynecologist',
    image: createIllustration('Women’s Health', 'Gynecology clinic', '22c55e', '14b8a6'),
    description: 'Women’s health and maternity care',
  },
  {
    label: 'General Physician',
    image: createIllustration('Primary Care', 'General physician', '0f172a', '2563eb'),
    description: 'Fever, flu, and first consultation',
  },
  {
    label: 'Child Specialist',
    image: createIllustration('Pediatric Care', 'Child specialist', 'f59e0b', 'fb7185'),
    description: 'Pediatric care for children',
  },
];

const heroSlides = [
  createIllustration('Doctor consultation', 'Trusted online & clinic visits', '2563eb', '7c3aed'),
  createIllustration('Telemedicine', 'Secure video consultations', '06b6d4', '3b82f6'),
  createIllustration('Clinic visits', 'Top hospitals nearby', '34d399', '10b981'),
];

function HeroSlider({ slides, interval = 4500 }: { slides: string[]; interval?: number }) {
  const [active, setActive] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const t = setInterval(() => {
      setActive((s) => (s + 1) % slides.length);
    }, interval);
    return () => {
      mounted.current = false;
      clearInterval(t);
    };
  }, [slides.length, interval]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          aria-hidden={i !== active}
          onClick={() => setActive(i)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-900 ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          alt={i === active ? `Slide ${i + 1}` : ''}
        />
      ))}

      <div className="absolute left-6 top-6">
        <motion.div animate={{ rotate: [0, 6, 0] }} transition={{ duration: 8, repeat: Infinity }} className="h-6 w-6 rounded-full bg-white/30" />
      </div>

      <div className="absolute right-6 bottom-6 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-8 rounded-full transition-all ${i === active ? 'bg-white' : 'bg-white/40 opacity-60'}`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
    </div>
  );
}

const serviceCards = [
  {
    title: 'Consult Online Now',
    subtitle: 'Fast video or chat consultation',
    icon: Video,
    accent: 'from-blue-600 to-indigo-600',
    action: 'Find online doctors',
  },
  {
    title: 'In-Clinic Appointments',
    subtitle: 'Visit top hospitals near you',
    icon: Building2,
    accent: 'from-slate-900 to-slate-700',
    action: 'Browse hospitals',
  },
  {
    title: 'Lab Tests',
    subtitle: 'Book diagnostics from home',
    icon: TabletSmartphone,
    accent: 'from-emerald-500 to-teal-500',
    action: 'Explore labs',
  },
  {
    title: 'Medicines',
    subtitle: 'Search medicines and pharmacy options',
    icon: BookOpen,
    accent: 'from-amber-500 to-orange-500',
    action: 'Learn more',
  },
];

const conditionCards = [
  { label: 'Fever', icon: HeartPulse, helper: 'Quick medical help' },
  { label: 'Pregnancy', icon: Sparkles, helper: 'Women’s health' },
  { label: 'Skin', icon: BadgeCheck, helper: 'Dermatology' },
  { label: 'ENT', icon: Hospital, helper: 'Ear, nose, throat' },
  { label: 'Dentist', icon: Stethoscope, helper: 'Oral care' },
  { label: 'Heart', icon: Star, helper: 'Cardiology' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Doctor slider data
  const doctorSlides = [
    { name: 'Dr. Ayesha Khan', specialty: 'Dermatologist', rating: '4.9', patients: '2.3K' },
    { name: 'Dr. Hassan Ali', specialty: 'General Physician', rating: '4.8', patients: '1.8K' },
    { name: 'Dr. Fatima Malik', specialty: 'Gynecologist', rating: '4.95', patients: '3.1K' },
    { name: 'Dr. Ahmed Hussain', specialty: 'Cardiologist', rating: '4.9', patients: '2.5K' },
  ];

  // Auto-rotate slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % doctorSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 transition-colors duration-500 dark:bg-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">HealthReserve</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Modern care, redefined</p>
            </div>
          </button>

          <nav className="hidden items-center gap-6 lg:flex">
            <button onClick={() => navigate('/about')} className="text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400">About</button>
            <button onClick={() => navigate('/faq')} className="text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400">FAQ</button>
            <button onClick={() => navigate('/contact')} className="text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400">Contact</button>
            <button onClick={() => navigate('/login?role=doctor')} className="text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400">For Doctors</button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.3em] text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Log In
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:py-12 space-y-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-slate-900/70 dark:text-blue-300"
            >
              <ShieldCheck size={14} />
              Trusted healthcare marketplace
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl dark:text-slate-50"
              >
                Trusted doctors in Karachi — compare fees, ratings and availability
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300"
              >
                Search by specialty, hospital or symptom. See consultation fees up front, view verified profiles, and book video or in-clinic appointments—no account required to browse.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 p-8 md:p-10 shadow-[0_30px_80px_rgba(15,23,42,0.15)]"
            >
              <div className="relative z-10 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
                {/* Left Side - Search & Info */}
                <div className="space-y-6">
                  {/* Stats Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600/20 px-4 py-2 border border-green-500/30"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <p className="text-sm font-bold text-green-100">9M+ tele-consultations</p>
                  </motion.div>

                  {/* Main Heading */}
                  <div className="space-y-3">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="text-3xl md:text-4xl font-black text-white leading-tight"
                    >
                      Find and Book the
                      <br />
                      <span className="text-yellow-400">Best Doctors</span> near you
                    </motion.h2>
                  </div>

                  {/* Search Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Location Selector */}
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/20">
                      <MapPin className="text-red-400" size={20} />
                      <select className="bg-transparent text-white font-bold outline-none cursor-pointer flex-1 text-sm" defaultValue="Karachi">
                        <option value="Karachi" className="bg-slate-900">Karachi</option>
                        <option value="Islamabad" className="bg-slate-900">Islamabad</option>
                        <option value="Lahore" className="bg-slate-900">Lahore</option>
                        <option value="Rawalpindi" className="bg-slate-900">Rawalpindi</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 focus-within:ring-2 focus-within:ring-yellow-400 transition">
                      <Search className="text-slate-400" size={20} />
                      <input
                        placeholder="Doctors, Hospital, Conditions"
                        className="w-full bg-transparent text-base font-medium text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* Search Button */}
                    <Button
                      size="lg"
                      className="w-full md:w-auto bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-black text-base rounded-2xl justify-center"
                      onClick={() => navigate('/login?role=patient')}
                    >
                      Search
                    </Button>
                  </motion.div>
                </div>

                {/* Right Side - Doctor Photo Slider */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative h-80 md:h-96 rounded-3xl overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-6"
                    >
                      {/* Doctor Avatar Placeholder */}
                      <div className="flex items-center justify-center w-40 h-40 bg-white/20 rounded-2xl backdrop-blur border border-white/30 mb-6">
                        <User size={64} className="text-white opacity-50" />
                      </div>
                      
                      {/* Stats Below Photo */}
                      <div className="text-center text-white">
                        <p className="text-lg font-bold mb-2">{doctorSlides[currentSlide].name}</p>
                        <div className="space-y-2">
                          <p className="text-sm flex items-center justify-center gap-2">
                            <Star size={16} className="fill-yellow-300 text-yellow-300" />
                            {doctorSlides[currentSlide].rating} | {doctorSlides[currentSlide].patients} patients
                          </p>
                          <p className="text-xs text-white/80">{doctorSlides[currentSlide].specialty}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Slider Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {doctorSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition ${index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/40 w-2'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Background Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400/5 rounded-full blur-3xl" />
            </motion.div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Doctors</p>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">25K+</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consultations</p>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">9M+</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Patients served</p>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">50M+</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900">
              <div className="relative h-[420px]">
                <HeroSlider slides={heroSlides} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur">
                    <Star className="fill-current" size={12} />
                    Premium discovery
                  </div>
                  <p className="mt-3 max-w-sm text-2xl font-black leading-tight">
                    Search-first design with visible prices, trust signals, and quick actions.
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-200">
                    <Clock3 size={16} />
                    Book instantly after login
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -left-4 top-8 hidden rounded-3xl border border-white/70 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  <Video size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Consult online</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Fast video visits</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-4 -right-4 hidden rounded-3xl border border-white/70 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">In clinic</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">Hospital visits</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Explore services</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Consult online, in clinic, and beyond</h2>
            </div>
            <button onClick={() => navigate('/login')} className="hidden items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 md:inline-flex dark:text-blue-400">
              Start now <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map(card => (
              <button
                key={card.title}
                onClick={() => navigate('/login?role=patient')}
                className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                  <card.icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-slate-100">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.subtitle}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-blue-600 transition group-hover:translate-x-0.5 dark:text-blue-400">
                  {card.action} <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5" id="specialties">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Specialties</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Popular doctors people search for first</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredSpecialties.map(specialty => (
              <button
                key={specialty.label}
                onClick={() => navigate('/login?role=patient')}
                className="group overflow-hidden rounded-[30px] border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={specialty.image} alt={specialty.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
                    Top choice
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{specialty.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{specialty.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
                    Explore <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Common conditions</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Search by what you feel</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {conditionCards.map(condition => (
              <button
                key={condition.label}
                onClick={() => navigate('/login?role=patient')}
                className="flex items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-200">
                  <condition.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100">{condition.label}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{condition.helper}</p>
                </div>
                <ChevronRight className="text-slate-300" size={18} />
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Smart search</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Start with price, city, and specialty</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {['Budget', 'Nearby', 'Top rated'].map(item => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['PKR 1k - 2k', 'PKR 2k - 5k', 'Video visit', 'Clinic visit', 'Verified only'].map(tag => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          <Card className="border-slate-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/20 dark:border-slate-800 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-blue-100/80">Ready to go deeper?</p>
            <h3 className="mt-3 text-3xl font-black tracking-tight">Sign in to book, save records, and chat with AI.</h3>
            <p className="mt-3 text-sm leading-7 text-blue-100/90">
              The public page helps you explore. Login unlocks the full patient dashboard, appointments, medical records, and the floating assistant.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="secondary" className="justify-center bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate('/login?role=patient')}>
                Continue as patient
              </Button>
              <button onClick={() => navigate('/login?role=doctor')} className="text-xs font-black uppercase tracking-[0.32em] text-blue-100 transition hover:text-white">
                Are you a doctor? Join the platform
              </button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}

export function LoginPage() {
  const { signIn, signInWithEmailAuth, signUpWithEmailAuth, sendPasswordReset, signInWithPhone } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = (params.get('role') as UserRole) || 'patient';

  const [method, setMethod] = useState<'google' | 'email' | 'phone'>('google');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const countries = [
    { code: '+92', name: 'Pakistan', flag: '????' },
    { code: '+1', name: 'USA', flag: '????' },
    { code: '+44', name: 'UK', flag: '????' },
    { code: '+971', name: 'UAE', flag: '????' },
  ];

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn(role);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast({
        title: 'Google login failed',
        message: error instanceof Error ? error.message : 'Google login failed. Check Firebase Auth setup.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password || (emailMode === 'signup' && !fullName.trim())) {
      showToast({
        title: 'Missing fields',
        message: emailMode === 'signup' ? 'Name, email, and password are required.' : 'Email and password are required.',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (emailMode === 'signup') {
        await signUpWithEmailAuth(fullName.trim(), email.trim(), password, role);
        showToast({ title: 'Account created', message: 'Your account was created successfully.', variant: 'success' });
      } else {
        await signInWithEmailAuth(email.trim(), password, role);
      }
      navigate('/dashboard');
    } catch (error) {
      showToast({
        title: emailMode === 'signup' ? 'Sign up failed' : 'Sign in failed',
        message: error instanceof Error ? error.message : 'Please check your credentials and Firebase Email/Password settings.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showToast({ title: 'Email required', message: 'Enter your email first, then click Forgot Password.', variant: 'error' });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordReset(email.trim());
      showToast({ title: 'Reset email sent', message: 'Please check your inbox for password reset instructions.', variant: 'success' });
    } catch (error) {
      showToast({
        title: 'Reset failed',
        message: error instanceof Error ? error.message : 'Could not send reset email.',
        variant: 'error',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const fullNumber = countryCode + phoneNumber;
      const result = await signInWithPhoneNumber(auth, fullNumber, verifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (error) {
      console.error('Phone Sign In Error:', error);
      showToast({
        title: 'OTP not sent',
        message: error instanceof Error ? error.message : 'Failed to send OTP. Ensure Phone Auth is enabled in Firebase Console.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      await signInWithPhone(userCredential.user, role);
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP Verification Error:', error);
      showToast({
        title: 'OTP verification failed',
        message: error instanceof Error ? error.message : 'Invalid OTP code.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 transition-colors duration-500 overflow-y-auto py-10">
      <div id="recaptcha-container"></div>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl dark:bg-blue-500/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] dark:bg-indigo-500/10"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl dark:bg-blue-500/10"></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg">
        <Card className="p-10 md:p-12 shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto shadow-xl shadow-blue-600/30">
              H
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight dark:text-slate-100">Portal Access</h2>
            <p className="text-slate-500 font-medium dark:text-slate-400">Secure entrance for {role} accounts</p>
          </div>

          <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setMethod('google')}
              className={cn(
                'py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all gap-2 flex items-center justify-center',
                method === 'google' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              )}
            >
              <Globe size={14} /> Google
            </button>
            <button
              onClick={() => setMethod('email')}
              className={cn(
                'py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all gap-2 flex items-center justify-center',
                method === 'email' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              )}
            >
              <Mail size={14} /> Email
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={cn(
                'py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all gap-2 flex items-center justify-center',
                method === 'phone' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              )}
            >
              <Phone size={14} /> Phone
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === 'google' ? (
              <motion.div key="google" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <Button
                  onClick={handleGoogleLogin}
                  loading={loading}
                  className="w-full py-6 text-lg font-bold"
                  size="lg"
                  icon={() => (
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                >
                  Continue with Google
                </Button>
                <p className="mt-3 text-xs text-slate-500 text-center dark:text-slate-400">Account picker is forced so you can choose another Gmail each time.</p>
              </motion.div>
            ) : method === 'email' ? (
              <motion.div key="email" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setEmailMode('signin')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
                      emailMode === 'signin' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setEmailMode('signup')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
                      emailMode === 'signup' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400'
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                {emailMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                  />
                )}

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                />

                <Button onClick={handleEmailAuth} loading={loading} className="w-full py-4 text-base">
                  {emailMode === 'signup' ? 'Continue with Email (Create Account)' : 'Continue with Email'}
                </Button>

                {emailMode === 'signin' && (
                  <button
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="w-full text-center text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending reset email...' : 'Forgot Password'}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                {step === 'input' ? (
                  <>
                    <div className="flex gap-3">
                      <div className="relative shrink-0">
                        <select
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          className="appearance-none bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-4 pr-10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all h-full"
                        >
                          {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <Button className="w-full py-4 text-base" onClick={handleSendOtp} loading={loading} disabled={!phoneNumber}>
                      Authenticate Securely
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest">Verification code sent to {countryCode}{phoneNumber}</p>
                      <input
                        type="text"
                        placeholder="6-digit OTP Code"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-5 px-5 text-center text-2xl font-black text-slate-900 dark:text-white outline-none tracking-[0.5em] focus:border-blue-500 transition-all"
                      />
                      <Button className="w-full py-4 text-base" onClick={handleVerifyOtp} loading={loading}>
                        Verify & Access
                      </Button>
                      <button
                        onClick={() => setStep('input')}
                        className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
                      >
                        Change Number
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center dark:border-slate-800">
            <div className="flex gap-4 mb-4">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full dark:bg-slate-700"></div>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full dark:bg-slate-700"></div>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              By continuing, you agree to our<br />
              <span className="text-slate-600 dark:text-slate-300">Privacy Protocols</span> and <span className="text-slate-600 dark:text-slate-300">Terms of Service</span>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
