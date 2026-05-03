import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreateProjectModal } from './CreateProjectModal';
import { InviteMemberModal } from './InviteMemberModal';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Projects', path: '/projects', icon: 'folder_open' },
    { 
      name: user.role === 'Admin' ? 'Workspace Members' : 'Your Team', 
      path: user.role === 'Admin' ? '/team' : '/your-team', 
      icon: 'group' 
    },
    { name: 'Schedule', path: '/schedule', icon: 'calendar_today' },
    { name: 'Settings', path: '#', icon: 'settings' },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 z-40 w-full h-16 flex justify-between items-center px-8 bg-[#fdfcfb] border-b border-stone-200/60 font-manrope antialiased tracking-tight">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden p-1.5 -ml-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-xl font-extrabold text-[#E1716F] hidden sm:block">Workspace</span>
          </div>
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
            <input className="pl-10 pr-4 py-2 bg-surface-container border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary-container" placeholder="Search projects..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user.role === 'Admin' && (
            <button 
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity"
            >
              Create Project
            </button>
          )}
          <div className="flex gap-2">
            <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button onClick={logout} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors" title="Logout">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
          <div className="w-8 h-8 rounded-full border border-stone-200 bg-primary flex items-center justify-center text-white font-bold text-xs">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-[calc(100vh-64px)] overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SideNavBar */}
        <aside className={`fixed md:absolute left-0 w-64 h-full bg-[#fdfcfb] md:bg-stone-50/50 border-r border-stone-200/60 flex flex-col py-6 space-y-2 font-manrope text-sm font-medium z-50 md:z-30 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>
          <div className="px-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">corporate_fare</span>
              </div>
              <div>
                <p className="text-lg font-bold text-stone-800">Humanly HQ</p>
                <p className="text-xs text-stone-500">{user.role} Workspace</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 py-3 px-4 transition-all duration-150 ${
                    isActive
                      ? 'text-[#E1716F] bg-[#E1716F]/5 border-l-4 border-[#E1716F] scale-95'
                      : 'text-stone-600 hover:bg-stone-100/80 border-l-4 border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-4 mt-auto">
            {user.role === 'Admin' && (
              <button 
                onClick={() => setIsInviteMemberOpen(true)}
                className="w-full py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Invite Member
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:ml-64 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background relative z-10 w-full min-w-0">
          <div className="max-w-[80rem] mx-auto space-y-8">
            <Outlet context={{ setIsInviteMemberOpen }} />
          </div>
        </main>
      </div>

      <CreateProjectModal 
        isOpen={isCreateProjectOpen} 
        onClose={() => setIsCreateProjectOpen(false)} 
        onSuccess={() => {
          if (location.pathname === '/projects') {
            window.location.reload();
          } else {
            navigate('/projects');
          }
        }} 
      />
      
      <InviteMemberModal 
        isOpen={isInviteMemberOpen} 
        onClose={() => setIsInviteMemberOpen(false)} 
      />
    </div>
  );
};
