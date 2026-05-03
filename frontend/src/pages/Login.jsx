import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to login');
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
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">Sign in to Workspace</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link></p>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-sm mb-lg">
              <button type="button" className="flex items-center justify-center gap-xs py-sm px-md rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-label-md text-label-md">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-xs py-sm px-md rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.152-1.11-1.459-1.11-1.459-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                </svg>
                <span className="font-label-md text-label-md">GitHub</span>
              </button>
            </div>

            <div className="relative mb-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-status">
                <span className="bg-surface-container-lowest px-sm text-on-surface-variant uppercase">Or with email</span>
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
                <input id="terms" type="checkbox" className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor="terms" className="font-label-md text-status text-on-surface-variant">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-sm px-md bg-primary text-on-primary font-h3 text-body-md rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150 tonal-elevation disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="mt-4 text-center">
                <span className="text-xs text-on-surface-variant">Test Accounts: alice@test.com (Admin) / bob@test.com (Member) - password: password</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
