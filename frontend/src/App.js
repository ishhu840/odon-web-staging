import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ContactPage from './ContactPage';
import TeamPage from './TeamPage';
import EditTeamMemberModal from './EditTeamMemberModal';
import PageLayout from './PageLayout';

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = ({ pages, isAdmin, user, onLogin, onLogout, onOpenAdminPanel }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginForm);
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      onLogin(token);
      setIsLoginOpen(false);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  const publishedPages = Object.values(pages)
    .filter(page => page.is_published)
    .sort((a, b) => (a.order || 9999) - (b.order || 9999));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">

              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {/* Molecular Structure Icon */}
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <g>
                      {/* Central molecule */}
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      {/* Surrounding molecules */}
                      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                      <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
                      {/* Bonds */}
                      <line x1="12" y1="12" x2="8" y2="8" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="8" y2="16" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="1"/>
                    </g>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
                  Odon Lab
                </h1>
                <p className="text-xs text-blue-300">Virology Research</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {publishedPages.map((page) => (
                <Link
                  key={page.page_name}
                  to={page.page_name === 'home' ? '/' : `/${page.page_name}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    (location.pathname === '/' && page.page_name === 'home') ||
                    location.pathname === `/${page.page_name}`
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
                  }`}
                >
                  {page.title}
                </Link>
              ))}

              
              {/* Admin Controls */}
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onOpenAdminPanel}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Admin Panel
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Admin Login
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-blue-500/20">
              <nav className="px-6 py-4 space-y-3">
                {publishedPages.map((page) => (
                  <Link
                    key={page.page_name}
                    to={page.page_name === 'home' ? '/' : `/${page.page_name}`}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      (location.pathname === '/' && page.page_name === 'home') ||
                      location.pathname === `/${page.page_name}`
                        ? 'bg-blue-500 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
                    }`}
                  >
                    {page.title}
                  </Link>
                ))}
                
                {isAdmin ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onOpenAdminPanel();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                    >
                      Admin Panel
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Admin Login
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/20 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};



// Home Page Component
const HomePage = ({ page, projects, isAdmin, onEditPage, onEditProject, onDeleteProject, onAddProject }) => {
  if (!page) return <PageLayout><div className="flex items-center justify-center min-h-screen"><div className="text-white text-xl">Page not found</div></div></PageLayout>;

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={page.content?.hero_image || "https://images.pexels.com/photos/8532850/pexels-photo-8532850.jpeg"} 
            alt="Laboratory Research"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-blue-100/80 to-blue-200/90"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-blue-600 mb-6 leading-tight">
                  {page.title || 'Welcome to'}
                </h1>
              <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed">
                {page.subtitle || 'Advancing virology and immunology research at the University of Strathclyde'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => onEditPage(page)}
                  className="mb-6 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Edit Home Page
                </button>
              )}
            </div>

            {/* Research Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {/* DNA/Molecular Icon */}
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <g>
                      {/* Central molecule */}
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                      {/* Surrounding molecules */}
                      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                      <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
                      {/* Bonds */}
                      <line x1="12" y1="12" x2="8" y2="8" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="8" y2="16" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1"/>
                      <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="1"/>
                    </g>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Our Research</h3>
                <p className="text-slate-700 leading-relaxed">
                  {page.content?.research_description || 'We focus on cutting-edge virology research, exploring virus-host interactions, immune responses, and developing innovative therapeutic approaches.'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 16l-5 2.72L7 16v-3.73L12 15l5-2.73V16z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Education & Training</h3>
                <p className="text-slate-700 leading-relaxed">
                  {page.content?.education_description || 'Training the next generation of researchers and healthcare professionals in immunology and virology.'}
                </p>
              </div>
            </div>

            {/* About Dr. Odon */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 mb-12 shadow-lg">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">About Dr. Valerie Odon</h2>
              <div className="text-left max-w-4xl mx-auto">
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  {page.content?.about_dr_odon || 'Dr. Valerie Odon is a distinguished virologist and lecturer in Immunology at the Strathclyde Institute of Pharmacy and Biomedical Sciences, University of Strathclyde.'}
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-4">Research Interests:</h4>
                    <ul className="space-y-2 text-slate-700">
                      {(page.content?.research_interests || [
                        'Virus-host cell interactions',
                        'Innate and adaptive immune responses',
                        'Viral pathogenesis mechanisms',
                        'Antiviral therapeutics development',
                        'Vaccine development and immunology'
                      ]).map((interest, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {interest}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-4">Affiliation:</h4>
                    <div className="text-slate-700 space-y-2">
                      <p><strong className="text-slate-800">University of Strathclyde</strong></p>
                      <p>Strathclyde Institute of Pharmacy and Biomedical Sciences</p>
                      <p>Department of Immunology</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Projects Preview */}
            {projects.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 shadow-lg">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Featured Research</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {projects.slice(0, 2).map((project) => (
                    <div key={project.id} className="bg-blue-50/80 rounded-xl p-6 border border-blue-300/40">
                      <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center">
                        <span className="text-2xl mr-3">{project.icon}</span>
                        {project.title}
                      </h3>
                      <p className="text-slate-700 text-sm">{project.description.substring(0, 150)}...</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link 
                    to="/projects" 
                    className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View All Projects
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

// Projects Page Component
const ProjectsPage = ({ page, projects, isAdmin, onEditPage, onEditProject, onDeleteProject, onAddProject }) => {
  if (!page) return <PageLayout><div className="flex items-center justify-center min-h-screen"><div className="text-slate-800 text-xl">Page not found</div></div></PageLayout>;

  return (
    <PageLayout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              {page.title}
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              {page.subtitle}
            </p>
            {isAdmin && (
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => onEditPage(page)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Page
                </button>
                <button
                  onClick={() => onAddProject()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Add New Project
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-8 max-w-6xl mx-auto">
            {projects.filter(p => p.is_published).map((project, index) => (
              <div key={project.id} className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6 flex-1">
                    <div className="text-4xl">{project.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">{project.title}</h3>
                      <p className="text-slate-700 mb-4 leading-relaxed">{project.description}</p>
                      <div className="bg-blue-50/80 rounded-lg p-4 border border-blue-300/40">
                        <strong className="text-slate-800">Key Areas:</strong>
                        <span className="text-slate-700 ml-2">{project.key_areas}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => onEditProject(project)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {projects.filter(p => p.is_published).length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No Projects Available</h3>
              <p className="text-slate-700">Projects will be displayed here once they are published.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 max-w-4xl mx-auto shadow-lg">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                <span className="text-3xl mr-3">🤝</span>
                Collaborations
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {page.content?.collaborations_text || 'We actively collaborate with leading research institutions, pharmaceutical companies, and healthcare organizations worldwide to advance our research goals and translate discoveries into clinical applications.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

// Generic Page Component (for OdonAI, Contact, and custom pages)
const GenericPage = ({ page, isAdmin, onEditPage }) => {
  if (!page) return <PageLayout><div className="flex items-center justify-center min-h-screen"><div className="text-slate-800 text-xl">Page not found</div></div></PageLayout>;

  return (
    <PageLayout>
      <section className="py-20 relative overflow-hidden">
        {page.content?.background_image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={page.content.background_image} 
              alt={page.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-blue-100/85 to-blue-200/90"></div>
          </div>
        )}
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              {page.title}
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto">
              {page.subtitle}
            </p>
            {isAdmin && (
              <button
                onClick={() => onEditPage(page)}
                className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Edit Page
              </button>
            )}
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Render page content dynamically */}
            {page.content && Object.keys(page.content).map((key) => {
              const content = page.content[key];
              
              if (key === 'background_image') return null; // Skip background image in content
              
              if (typeof content === 'string') {
                return (
                  <div key={key} className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 mb-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 capitalize">{key.replace(/_/g, ' ')}</h3>
                    <p className="text-slate-700 text-lg leading-relaxed">{content}</p>
                  </div>
                );
              }
              
              if (Array.isArray(content)) {
                if (key === 'members') {
                  return (
                    <div key={key} className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 mb-8 shadow-lg">
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 capitalize">{key.replace(/_/g, ' ')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                        {content.map((member, index) => (
                          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
                            <img className="w-48 h-48 rounded-full object-cover mx-auto mt-4" src={member.image} alt={member.name} />
                            <div className="p-6">
                              <h4 className="text-xl font-semibold text-slate-900 mb-1">{member.name}</h4>
                              <p className="text-blue-600 text-md mb-3">{member.role}</p>
                              <p className="text-slate-700 text-sm">{member.bio}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 mb-8 shadow-lg">
                      <h3 className="text-2xl font-bold text-slate-800 mb-4 capitalize">{key.replace(/_/g, ' ')}</h3>
                      <ul className="space-y-2 text-slate-700">
                        {content.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                            {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
              }
              
              if (typeof content === 'object') {
                return (
                  <div key={key} className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 mb-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 capitalize">{key.replace(/_/g, ' ')}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(content).map(([subkey, subcontent]) => (
                        <div key={subkey} className="bg-blue-50/80 rounded-xl p-6 border border-blue-300/40">
                          <h4 className="text-lg font-semibold text-slate-800 mb-3 capitalize">{subkey.replace(/_/g, ' ')}</h4>
                          <p className="text-slate-700 text-sm">{typeof subcontent === 'string' ? subcontent : JSON.stringify(subcontent)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              
              return null;
            })}
              


              {/* Default content if no content exists */}
              {/* Default content if no content exists */}
            {(!page.content || Object.keys(page.content).length === 0) && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-blue-300/30 text-center shadow-lg">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Page Content</h3>
                <p className="text-slate-700">This page is ready for content. Use the admin panel to add content.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

// Admin Panel Component
const AdminPanel = ({ pages, projects, isOpen, onClose, onEditPage, onEditProject, onAddProject, onDeleteProject, onCreatePage, onDeletePage, onTogglePageStatus, token }) => {
  const [activeTab, setActiveTab] = useState('pages');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true);
  const [teamMembersError, setTeamMembersError] = useState(null);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [currentTeamMember, setCurrentTeamMember] = useState(null);

  useEffect(() => {
    if (isOpen && activeTab === 'team') {
      fetchTeamMembers();
    }
  }, [isOpen, activeTab]);

  const fetchTeamMembers = async () => {
    setLoadingTeamMembers(true);
    setTeamMembersError(null);
    try {
      const response = await axios.get(`${API}/team_members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembersError(error);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const [newPageForm, setNewPageForm] = useState({
    page_name: '',
    title: '',
    subtitle: '',
    content: {},
    is_published: true
  });

  const resetNewPageForm = () => {
    setNewPageForm({
      page_name: '',
      title: '',
      subtitle: '',
      content: {},
      is_published: true
    });
  };

  const handleAddTeamMember = () => {
    setCurrentTeamMember(null);
    setIsTeamMemberModalOpen(true);
  };

  const handleEditTeamMember = (member) => {
    setCurrentTeamMember(member);
    setIsTeamMemberModalOpen(true);
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await axios.delete(`${API}/team_members/${memberId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Team member deleted successfully!');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleToggleTeamMemberStatus = async (memberId) => {
    try {
      await axios.patch(`${API}/team_members/${memberId}/toggle-status`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Team member status updated successfully!');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error toggling team member status:', error);
      alert('Failed to toggle team member status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      let contentToSend = {};
      try {
        contentToSend = JSON.parse(newPageForm.content);
      } catch (parseError) {
        alert('Invalid JSON in content field. Please ensure it is valid JSON.');
        console.error('JSON parse error:', parseError);
        return;
      }

      const pageData = {
        ...newPageForm,
        content: contentToSend,
      };

      await axios.post(`${API}/pages`, pageData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onCreatePage();
      resetNewPageForm();
      alert('Page created successfully!');
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Failed to create page: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-blue-500/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <EditTeamMemberModal
          isOpen={isTeamMemberModalOpen}
          onClose={() => setIsTeamMemberModalOpen(false)}
          onSave={fetchTeamMembers}
          member={currentTeamMember}
          token={token}
        />

        {/* Tabs */}
        <div className="flex border-b border-blue-500/20">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'pages'
                ? 'bg-blue-500 text-white'
                : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
            }`}
          >
            Pages Management
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-500 text-white'
                : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
            }`}
          >
            Projects Management
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-blue-500 text-white'
                : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-white'
                : 'text-blue-100 hover:text-white hover:bg-emerald-500/20'
            }`}
          >
            Create New Page
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Team Members Management Tab */}
          {activeTab === 'team' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Manage Team Members</h3>
                <button
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Add New Team Member
                </button>
              </div>
              {loadingTeamMembers ? (
                <div className="text-white">Loading team members...</div>
              ) : teamMembersError ? (
                <div className="text-red-500">Error loading team members: {teamMembersError.message}</div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">{member.name}</h4>
                        <p className="text-blue-100 text-sm">{member.role}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {member.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTeamMember(member)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTeamMember(member.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleToggleTeamMemberStatus(member.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pages Management Tab */}
          {activeTab === 'pages' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Manage Pages</h3>
              <div className="space-y-4">
                {Object.values(pages).map((page) => (
                  <div key={page.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{page.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            page.is_published
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {page.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-blue-100 text-sm">/{page.page_name}</p>
                        <p className="text-blue-300 text-sm mt-1">{page.subtitle}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditPage(page)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onTogglePageStatus(page.id, !page.is_published)}
                          className={`px-3 py-1 rounded transition-colors text-sm ${
                            page.is_published
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {page.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        {page.page_name !== 'home' && (
                          <button
                            onClick={() => onDeletePage(page.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Management Tab */}
          {activeTab === 'projects' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Manage Projects</h3>
                <button
                  onClick={onAddProject}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Add New Project
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl">{project.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{project.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              project.is_published
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {project.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-blue-100 text-sm mb-2">{project.description.substring(0, 150)}...</p>
                          <p className="text-blue-300 text-xs">Order: {project.order}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => onEditProject(project)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📋</div>
                    <h4 className="text-lg font-semibold text-white mb-2">No Projects</h4>
                    <p className="text-blue-100">Create your first project to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create New Page Tab */}
          {activeTab === 'create' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Create New Page</h3>
              <form onSubmit={handleCreatePage} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Page URL Name *</label>
                    <input
                      type="text"
                      value={newPageForm.page_name}
                      onChange={(e) => setNewPageForm({...newPageForm, page_name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
                      placeholder="e.g., about-us, research"
                      required
                    />
                    <p className="text-blue-300 text-xs mt-1">This will be the URL: /{newPageForm.page_name}</p>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Page Title *</label>
                    <input
                      type="text"
                      value={newPageForm.title}
                      onChange={(e) => setNewPageForm({...newPageForm, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
                      placeholder="e.g., About Us, Research"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Page Subtitle</label>
                  <input
                    type="text"
                    value={newPageForm.subtitle}
                    onChange={(e) => setNewPageForm({...newPageForm, subtitle: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
                    placeholder="Brief description of the page"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Initial Content (JSON)</label>
                  <textarea
                    value={typeof newPageForm.content === 'object' ? JSON.stringify(newPageForm.content, null, 2) : newPageForm.content}
                    onChange={(e) => setNewPageForm({...newPageForm, content: e.target.value})}
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all resize-none font-mono text-sm"
                    placeholder='{"description": "Page content goes here"}'
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      checked={newPageForm.is_published}
                      onChange={(e) => setNewPageForm({...newPageForm, is_published: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-white/5 border-blue-500/30 rounded focus:ring-blue-500"
                    />
                    <span>Publish immediately</span>
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Create Page
                  </button>
                  <button
                    type="button"
                    onClick={resetNewPageForm}
                    className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Page Modal Component
const EditPageModal = ({ page, isOpen, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: {},
    is_published: true
  });

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        subtitle: page.subtitle || '',
        content: page.content || {},
        is_published: page.is_published !== undefined ? page.is_published : true
      });
    }
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let contentToSend = {};
      try {
        contentToSend = typeof formData.content === 'string' ? JSON.parse(formData.content) : formData.content;
      } catch (parseError) {
        alert('Invalid JSON in content field. Please ensure it is valid JSON.');
        console.error('JSON parse error:', parseError);
        return;
      }

      const dataToSave = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: contentToSend,
        is_published: formData.is_published
      };

      console.log('is_published value before API call:', dataToSave.is_published);
      console.log('Token being used:', token);
      console.log('Request data:', dataToSave);
      console.log('Request URL:', `${API}/pages/${page.page_name}`);
      const response = await axios.put(`${API}/pages/${page.page_name}`, dataToSave, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response:', response.data);
      onSave(response.data);
      onClose();
      alert('Page updated successfully!');
    } catch (error) {
      console.error('Error updating page:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error request config:', error.config);
      alert('Failed to update page: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit {page.title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Content (JSON)</label>
            <textarea
              value={typeof formData.content === 'object' ? JSON.stringify(formData.content, null, 2) : formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={15}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all resize-none font-mono text-sm"
            />

          </div>
          <div>
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="w-4 h-4 text-blue-600 bg-white/5 border-blue-500/30 rounded focus:ring-blue-500"
              />
              <span>Published</span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Project Modal Component
const EditProjectModal = ({ project, isOpen, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    key_areas: '',
    icon: '🔬',
    order: 0,
    is_published: true
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        key_areas: project.key_areas || '',
        icon: project.icon || '🔬',
        order: project.order || 0,
        is_published: project.is_published !== undefined ? project.is_published : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        key_areas: '',
        icon: '🔬',
        order: 0,
        is_published: true
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (project?.id) {
        await axios.put(`${API}/projects/${project.id}`, formData);

      } else {
        await axios.post(`${API}/projects`, formData);

      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl border border-blue-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Key Areas</label>
            <input
              type="text"
              value={formData.key_areas}
              onChange={(e) => setFormData({...formData, key_areas: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
                placeholder="🔬"
                required
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 transition-all"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="w-4 h-4 text-blue-600 bg-white/5 border-blue-500/30 rounded focus:ring-blue-500"
              />
              <span>Published</span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadContent();
    if (token) {
      verifyToken();
    }
  }, [token]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      const [pagesResponse, projectsResponse] = await Promise.all([
        axios.get(`${API}/pages`),
        axios.get(`${API}/projects`)
      ]);

      const pagesData = {};
      pagesResponse.data.forEach(page => {
        pagesData[page.page_name] = page;
      });

      setPages(pagesData);

      setProjects(projectsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setIsAdmin(response.data.is_admin);
    } catch (error) {
      console.error('Token verification failed:', error);
      handleLogout();
    }
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    verifyToken();
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    setIsAdminPanelOpen(false);
  };

  const handleEditPage = (page) => {
    setEditingPage(page);
  };

  const handleEditProject = (project) => {
    setEditingProject(project || {});
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API}/projects/${projectId}`);
        await loadContent();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleDeletePage = async (pageId) => {
    const page = Object.values(pages).find(p => p.id === pageId);
    if (window.confirm(`Are you sure you want to delete the "${page?.title}" page?`)) {
      try {
        await axios.delete(`${API}/pages/${page.page_name}`);
        await loadContent();
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('Failed to delete page');
      }
    }
  };

  const handleTogglePageStatus = async (pageId, newStatus) => {
    try {
      const page = Object.values(pages).find(p => p.id === pageId);
      await axios.put(`${API}/pages/${page.page_name}`, { is_published: newStatus });
      await loadContent();
    } catch (error) {
      console.error('Error updating page status:', error);
      alert('Failed to update page status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            {/* Molecular Structure Icon */}
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <g>
                {/* Central molecule */}
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                {/* Surrounding molecules */}
                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
                <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="20" r="1.5" fill="currentColor"/>
                {/* Bonds */}
                <line x1="12" y1="12" x2="8" y2="8" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="16" y2="8" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="8" y2="16" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1"/>
                <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="1"/>
              </g>
            </svg>
          </div>
          <p className="text-slate-800 text-xl">Loading Odon Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navigation 
          pages={pages}
          isAdmin={isAdmin}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />

        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                page={pages.home}
                projects={projects}
                isAdmin={isAdmin}
                onEditPage={handleEditPage}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onAddProject={() => handleEditProject()}
              />
            } 
          />
          <Route path="/team" element={<TeamPage />} />
          <Route 
            path="/projects" 
            element={
              <ProjectsPage 
                page={pages.projects}
                projects={projects}
                isAdmin={isAdmin}
                onEditPage={handleEditPage}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onAddProject={() => handleEditProject()}
              />
            } 
          />
          {Object.entries(pages).map(([pageName, page]) => {
              if (pageName === 'home' || pageName === 'projects' || pageName === 'contact') return null;
            return (
              <Route 
                key={pageName}
                path={`/${pageName}`} 
                element={
                  <GenericPage 
                    page={page}
                    isAdmin={isAdmin}
                    onEditPage={handleEditPage}
                  />
                } 
              />
            );
          })}
          <Route path="/contact" element={<ContactPage />} />
  
          <Route 
            path="*" 
            element={
              <PageLayout>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">Page Not Found</h1>
                    <p className="text-slate-700 mb-8">The page you're looking for doesn't exist.</p>
                    <Link 
                      to="/" 
                      className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Go Home
                    </Link>
                  </div>
                </div>
              </PageLayout>
            } 
          />
        </Routes>

        {/* Admin Panel */}
        <AdminPanel
          pages={pages}
          projects={projects}
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          onEditPage={handleEditPage}
          onEditProject={handleEditProject}
          onAddProject={() => handleEditProject()}
          onDeleteProject={handleDeleteProject}
          onCreatePage={loadContent}
          onDeletePage={handleDeletePage}
          onTogglePageStatus={handleTogglePageStatus}
          token={token}
        />

        {/* Edit Page Modal */}
        <EditPageModal
          page={editingPage}
          isOpen={!!editingPage}
          onClose={() => setEditingPage(null)}
          onSave={loadContent}
          token={token}
        />

        {/* Edit Project Modal */}
        <EditProjectModal
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSave={loadContent}
          token={token}
        />
      </div>
    </Router>
  );
};

export default App;