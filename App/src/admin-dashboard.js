import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Mail, Plus, AlertCircle, CheckCircle } from 'lucide-react';

const AdminCreateUserPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [status, setStatus] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [revokeEmail, setRevokeEmail] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [revokeSuccess, setRevokeSuccess] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  
  // Check if user is authenticated and is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const onBackToDashboard = () => {
    navigate('/login');
  };

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
      setError('Please enter an email');
      return;
    }
    
    if (!password) {
      setError('Please enter a password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          email: email,
          role: selectedRole,
          password: password,
          status: status ? "True" : "False"
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`User ${email} created successfully!`);
        // Clear form
        setEmail('');
        setPassword('');
        setSelectedRole('');
        setStatus(true);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    
    if (!revokeEmail) {
      setRevokeError('Please enter an email');
      return;
    }
    
    try {
      setRevokeLoading(true);
      setRevokeError('');
      setRevokeSuccess('');
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/update-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          email: revokeEmail,
          status: "False"
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRevokeSuccess(`Access revoked for user ${revokeEmail}`);
        setRevokeEmail('');
      } else {
        setRevokeError(data.message || 'Failed to revoke access');
      }
    } catch (err) {
      setRevokeError('Server connection error. Please try again.');
      console.error('Revoke access error:', err);
    } finally {
      setRevokeLoading(false);
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
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onBackToDashboard}>
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">
            Hash<span className="text-blue-400">Proof</span>
          </span>
        </div>
        <div className="text-sm text-gray-300">
          Admin Panel
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
                  <Plus className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6">Create New User</h2>
              
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
              
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit}>
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
                      placeholder="user@example.com"
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div className="mb-4">
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
                
                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Select Role</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'admin', label: 'Admin' },
                      { id: 'examiner', label: 'Forensic Examiner' },
                      { id: 'officer', label: 'Officer' },
                      { id: 'head-investigator', label: 'Head Investigator' } 
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
                
                {/* Status */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={status}
                      onChange={(e) => setStatus(e.target.checked)}
                      className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-gray-900"
                    />
                    <span className="ml-2 text-sm text-gray-300">Account Active</span>
                  </label>
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
                      Creating User...
                    </>
                  ) : 'Create User'}
                </motion.button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-xl font-bold text-center mb-6">Revoke User Access</h3>
                
                {revokeError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center text-sm"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{revokeError}</span>
                  </motion.div>
                )}
                
                {revokeSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{revokeSuccess}</span>
                  </motion.div>
                )}
                
                <form onSubmit={handleRevoke}>
                  <div className="mb-4">
                    <label htmlFor="revokeEmail" className="block text-gray-300 mb-2 text-sm font-medium">
                      User Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="revokeEmail"
                        type="email"
                        value={revokeEmail}
                        onChange={(e) => setRevokeEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-red-500 focus:ring focus:ring-red-500/20 focus:outline-none text-white"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={revokeLoading}
                    className={`w-full py-3 ${revokeLoading ? 'bg-red-700' : 'bg-red-500'} rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center`}
                  >
                    {revokeLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Revoking Access...
                      </>
                    ) : 'Revoke Access'}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            variants={itemVariants}
            onClick={onBackToDashboard}
            className="w-full mt-8 text-gray-400 text-sm flex items-center justify-center hover:text-blue-400 transition-colors"
          >
            ← Back to admin dashboard
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

export default AdminCreateUserPage;