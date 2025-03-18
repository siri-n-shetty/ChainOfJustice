import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onBackToWelcome = () => {
    navigate('/');
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          email: email,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user info in localStorage or context
        localStorage.setItem('user', JSON.stringify({
          email: email,
          role: selectedRole,
          token: data.token
        }));
        
        // Redirect based on role
        navigate(`/${selectedRole}-dashboard`);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col">
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
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onBackToWelcome}>
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">
            Hash<span className="text-blue-400">Proof</span>
          </span>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <Lock className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6">Login to HashProof</h2>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center text-sm"
                >
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Select Your Role</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'admin', label: 'Admin' },
                      { id: 'examiner', label: 'Forensic Examiner' },
                      { id: 'officer', label: 'Officer' },
                      { id: 'head-investigator', label: 'Head Investigator' } // New role added here
                    ].map((role) => (
                      <motion.button
                        key={role.id}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
                          selectedRole === role.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <User className="h-5 w-5 mb-1" />
                        <span className="text-xs">{role.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-300 mb-2 text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-300 mb-2 text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className={`w-full py-3 ${loading ? 'bg-blue-700' : 'bg-blue-500'} rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Log In'}
                </motion.button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-400">
                <p>Forgot your password? Contact your administrator.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            variants={itemVariants}
            onClick={onBackToWelcome}
            className="w-full mt-8 text-gray-400 text-sm flex items-center justify-center hover:text-blue-400 transition-colors"
          >
            ← Back to welcome page
          </motion.button>
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-blue-500/20 py-4 px-6 text-center text-gray-500 text-sm">
        <p>© 2025 HashProof. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;