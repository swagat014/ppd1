import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Shield, 
  Target, 
  Zap, 
  ChevronRight, 
  Globe, 
  Cpu, 
  Layers,
  CheckCircle2,
  Users,
  BarChart3
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#050914] text-white font-inter selection:bg-primary selection:text-white overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent-cyan/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-space bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ZestPrep
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-2.5 rounded-full bg-transparent border border-white/20 hover:border-primary/50 transition-all duration-500 overflow-hidden"
          >
            {/* Animated Glow Ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent-cyan rounded-full opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500 animate-spin-slow" />
            
            {/* Inner Background */}
            <div className="absolute inset-0 bg-[#050914] rounded-full" />
            
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <span className="relative z-10 font-bold flex items-center gap-2 group-hover:text-primary-light transition-colors duration-300">
              Login
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </span>
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            <motion.div variants={itemVariants}>
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold tracking-wide uppercase">
                Revolutionizing Placements
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl lg:text-7xl font-bold font-space leading-[1.1]">
              Elevate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent-cyan">
                Career Journey
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-xl leading-relaxed">
              ZestPrep is the ultimate ecosystem for students, TPOs, and companies. 
              Seamlessly manage placements, track performance, and achieve excellence with AI-driven insights.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-10 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 flex items-center gap-3 group"
              >
                Get Started Now
                <Zap className="w-5 h-5 fill-white group-hover:animate-pulse" />
              </button>
              
              <button className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg transition-all flex items-center gap-3">
                Watch Demo
                <Globe className="w-5 h-5 text-gray-400" />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050914] bg-gray-800 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-[#050914] bg-primary flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
              <div className="text-sm">
                <p className="font-bold">Trusted by 2000+ Students</p>
                <p className="text-gray-500">Joining from top universities</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" as any }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-[40px] blur-[60px] animate-pulse" />
            <div className="relative glass-card border-white/10 p-8 overflow-hidden group">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white/5 rounded-2xl flex flex-col items-center justify-center p-6 border border-white/5 hover:border-primary/50 transition-colors">
                  <BarChart3 className="w-12 h-12 text-primary mb-4" />
                  <span className="text-2xl font-bold">85%</span>
                  <span className="text-xs text-gray-400 text-center">Placement Rate</span>
                </div>
                <div className="aspect-square bg-white/5 rounded-2xl flex flex-col items-center justify-center p-6 border border-white/5 hover:border-secondary/50 transition-colors">
                  <Users className="w-12 h-12 text-secondary mb-4" />
                  <span className="text-2xl font-bold">50+</span>
                  <span className="text-xs text-gray-400 text-center">Top Recruiters</span>
                </div>
                <div className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">Success Progress</span>
                    <span className="text-primary-light text-xs font-bold">+12% from last year</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ delay: 1, duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" as any }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-accent-green/20 backdrop-blur-xl rounded-full border border-accent-green/30 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-accent-green" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold font-space mb-4">Powerful Features for Everyone</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to manage the placement lifecycle from start to finish with ease and transparency.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Rocket, label: 'Fast Setup', desc: 'Get your portal running in minutes with easy bulk uploads.', color: 'primary' },
            { icon: Shield, label: 'Secure Data', desc: 'Enterprise-grade security for student and recruiter information.', color: 'secondary' },
            { icon: Target, label: 'Smart Matching', desc: 'AI-powered student profiles to match the right company.', color: 'accent-cyan' },
            { icon: Layers, label: 'Analytics', desc: 'Comprehensive dashboards for TPOs and Admins to track progress.', color: 'accent-green' }
          ].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${f.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-8 h-8 text-${f.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map(brand => (
              <span key={brand} className="text-3xl font-black font-space tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold font-space">ZestPrep</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 ZestPrep Ecosystem. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
