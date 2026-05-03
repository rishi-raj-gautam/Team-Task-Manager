import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-sm md:p-lg bg-background font-body-md text-on-surface antialiased">
      <div className="w-full max-w-[72rem] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden tonal-elevation">
        {/* Branding & Visual Side */}
        <div className="hidden md:flex flex-col justify-between p-xl bg-surface-container relative overflow-hidden">
          {/* Abstract Decorative Element */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-xs mb-lg">
              <span className="text-xl font-extrabold text-[#E1716F]">Workspace</span>
            </div>
            <h1 className="font-h1 text-h1 text-on-surface mb-md">Build better habits, <br /><span className="text-primary">together.</span></h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[28rem]">
              Join 20,000+ teams who have traded dashboard fatigue for intentional, calm productivity.
            </p>
          </div>
          <div className="relative z-10 mt-xl">
            <div className="bg-white/60 backdrop-blur-sm p-md rounded-xl border border-white/40 tonal-elevation">
              <div className="flex items-center gap-xs mb-xs">
                <div className="flex text-[#E1716F]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface italic mb-md">
                "Workspace shifted our culture from 'constant urgency' to 'calm execution'. It's the most human project tool we've ever used."
              </p>
              <div className="flex items-center gap-sm">
                <img alt="Sarah Jenkins" className="w-12 h-12 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT1EhGdzG2u7vIXa1VHir6qStFXkPL3xzXtSmFq-WLokUE7a9cdYTvFKXVcAtuzw6JEvFOU3DfGKDF1gGxqzc5-LZKbdY6uTtXjMau-om7MFcq0fzWozEqCZjM--ZcqGWThL_f5znLNRIAq6jjynoHWbPUUl-_Do5zpd5mu3sPt8CHqapsYkiTXhzLG0RlNOEHI2sdBoOstOA_Mppp-3OmpUj1YV7rPQFOiuJ9b0wTNwPTWdmm4gGR-N1dmkK4R_CsknLcjWrE05A" />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Sarah Jenkins</p>
                  <p className="text-status text-on-surface-variant">Director of Operations, Humanly HQ</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-lg">
            <img alt="Team Collaboration" className="w-full h-48 rounded-lg object-cover tonal-elevation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC539R9gHhfBU8peIq-cDK4U6yZFA1vv0QHuVn2yV4bvb0jB4AvKJ3QQxdD9VUVFA7txXI-yYlNndPtOCF-nRo8VAw_A8p9rRaUqTRvLNkWHVN11hS0h8GkojrwPuB3lj172uRouLA3mGAA6iYk4Fi45OFqdqyl23sK9DsRG_oscL8GAPyjhhmngwjzQ7HICFc-9T-Ac3trB2vTIzercVhqduNtk3gGPTIZ633WRwYE2Bx7XliCMPUKmz2ZvPBTOHM_4E0ZABTqIhc" />
          </div>
        </div>

        {/* Signup Form Side */}
        <div className="flex flex-col p-md md:p-xl justify-center">
          <div className="w-full max-w-[24rem] mx-auto">
            <div className="mb-lg">
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">Create your account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link></p>
            </div>

            {/* Role Selector */}
            <div className="mb-lg">
              <label className="block font-label-md text-label-md text-on-surface mb-sm">I'm signing up as</label>
              <div className="grid grid-cols-2 gap-sm">
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`flex flex-col items-center gap-xs py-md px-sm rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    role === 'Admin'
                      ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                      : 'border-outline-variant bg-surface hover:bg-surface-container hover:border-outline'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === 'Admin' ? 'text-primary' : 'text-on-surface-variant'}`}>admin_panel_settings</span>
                  <span className={`font-label-md text-label-md ${role === 'Admin' ? 'text-primary font-bold' : 'text-on-surface'}`}>Admin</span>
                  <span className="text-[11px] text-on-surface-variant text-center leading-tight">Create & manage workspaces</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Member')}
                  className={`flex flex-col items-center gap-xs py-md px-sm rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    role === 'Member'
                      ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                      : 'border-outline-variant bg-surface hover:bg-surface-container hover:border-outline'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${role === 'Member' ? 'text-primary' : 'text-on-surface-variant'}`}>person</span>
                  <span className={`font-label-md text-label-md ${role === 'Member' ? 'text-primary font-bold' : 'text-on-surface'}`}>Member</span>
                  <span className="text-[11px] text-on-surface-variant text-center leading-tight">Join & collaborate on tasks</span>
                </button>
              </div>
            </div>

            <div className="relative mb-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-status">
                <span className="bg-surface-container-lowest px-sm text-on-surface-variant uppercase">Sign up with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-md" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">Work Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
              <div className="flex items-start gap-xs py-xs">
                <input id="terms" type="checkbox" required className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor="terms" className="font-label-md text-status text-on-surface-variant">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-sm px-md bg-primary text-on-primary font-h3 text-body-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 tonal-elevation disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : `Sign Up as ${role}`}
              </button>
            </form>
            <p className="mt-lg text-center text-status text-on-surface-variant">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

