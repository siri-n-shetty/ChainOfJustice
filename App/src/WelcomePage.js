import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Link, FileDigit, Database, Lock, Fingerprint, RefreshCcw, Activity } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity }
  };

  const handleLogin = () => {
    navigate('/login');
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
      {/* Blockchain-inspired background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full grid grid-cols-12 grid-rows-6">
          {Array(72).fill().map((_, i) => (
            <div key={i} className="border border-white/10"></div>
          ))}
        </div>
      </div>
      
      {/* Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-blue-500/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">
            Hash<span className="text-blue-400">Proof</span>
          </span>
        </div>
        <nav>
          <ul className="flex space-x-8">
            <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
            <li><a href="#get-started" className="hover:text-blue-400 transition-colors">Get Started</a></li>
          </ul>
        </nav>
      </header>
      
      {/* Hero section */}
      <section className="relative pt-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Blockchain-based Digital Evidence
              <span className="block text-blue-400">Chain-of-Custody Tracker</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Secure, transparent, and immutable system designed to enhance 
              the integrity of digital evidence throughout its lifecycle.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button 
                onClick={handleLogin}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-blue-500 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Log in
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="relative lg:h-96"
          >
            <motion.div 
              animate={pulseAnimation}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Blockchain visualization */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-48 md:h-48 bg-blue-500/20 rounded-lg border border-blue-500/40 backdrop-blur-sm flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 360], 
                    borderColor: ['rgba(59, 130, 246, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(59, 130, 246, 0.4)']
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Fingerprint className="w-16 h-16 text-blue-400" />
                </motion.div>
                
                {/* Orbiting blocks 
                {[0, 60, 120, 180, 240, 300].map((degree, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-12 h-12 bg-gray-800 rounded-md border border-blue-500/30 flex items-center justify-center shadow-lg"
                    style={{ 
                      transformOrigin: 'center center',
                      transform: `rotate(${degree}deg) translateX(140px) rotate(-${degree}deg)`
                    }}
                    animate={{ 
                      rotate: [degree, degree + 360],
                    }}
                    transition={{ 
                      duration: 30, 
                      repeat: Infinity, 
                      ease: "linear",
                      delay: i * -1.5
                    }}
                  >
                    {[<FileDigit />, <Database />, <Link />, <Lock />, <RefreshCcw />, <Activity />][i % 6]}
                  </motion.div>
                ))}
                */}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Leveraging blockchain technology to ensure that every step in the digital evidence lifecycle is securely recorded.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <FileDigit classNaetme="h-8 w-8 text-blue-400" />, 
              title: "Evidence Registration", 
              description: "Secure digital evidence with cryptographic hashing and metadata for permanent verification."
            },
            { 
              icon: <Link className="h-8 w-8 text-blue-400" />, 
              title: "Chain-of-Custody", 
              description: "Track every transfer and access with immutable blockchain records and timestamps."
            },
            { 
              icon: <Database className="h-8 w-8 text-blue-400" />, 
              title: "Forensic Examination", 
              description: "Log all forensic procedures and findings with secure hashing and verification."
            },
            { 
              icon: <Activity className="h-8 w-8 text-blue-400" />, 
              title: "Interactive Reporting", 
              description: "Generate comprehensive, tamper-proof reports with real-time auditing capabilities."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-gray-800/50 backdrop-blur-sm border border-blue-900/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all"
            >
              <div className="mb-4 inline-block p-3 bg-blue-900/30 rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* How it works section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">How HashProof Works</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our blockchain solution provides unparalleled security and transparency for digital evidence management.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-500/30 transform -translate-x-1/2 hidden md:block"></div>
          
          <div className="space-y-16">
            {[
              { 
                title: "Secure Evidence Registration", 
                description: "Digital evidence is registered with cryptographic hashing, creating a unique fingerprint that verifies its authenticity and prevents tampering."
              },
              { 
                title: "Role-Based Access Control", 
                description: "Only authorized personnel can access or transfer evidence, with all actions recorded on the blockchain for complete accountability."
              },
              { 
                title: "Immutable Audit Trail", 
                description: "Every access, transfer, and analysis step is recorded with cryptographic proof, creating a transparent and tamper-proof history."
              },
              { 
                title: "Optimized Storage Architecture", 
                description: "Metadata and cryptographic proofs are stored on the blockchain while large digital files remain securely off-chain for maximum efficiency."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8`}
              >
                <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                
                <div className="relative flex items-center justify-center md:w-24 my-4 md:my-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center z-10 backdrop-blur-sm">
                    <span className="font-bold">{i + 1}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  {/* Visualization area - kept simple here */}
                  <div className="h-32 bg-gradient-to-r from-blue-900/30 to-gray-800/30 rounded-lg border border-blue-900/50 flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {[<FileDigit />, <Lock />, <Link />, <Database />][i % 4]}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section id="get-started" className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Digital Evidence Chain?</h2>
          <p className="text-gray-300 mb-8">
            Join law enforcement agencies and forensic investigators who trust HashProof to maintain the integrity of their digital evidence.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-blue-500 rounded-md font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-blue-500/20 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">
                Hash<span className="text-blue-400">Proof</span>
              </span>
            </div>
            <p className="text-gray-400">
              Blockchain-based digital evidence chain-of-custody tracker.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Webinars</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-center text-gray-500">
          <p>© 2025 HashProof. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;