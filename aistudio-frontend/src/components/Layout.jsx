import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, FileImage, CreditCard, LogOut, Bot, Settings2 } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Generators', to: '/content-gen', icon: Sparkles },
  { label: 'File Tools', to: '/file-tools', icon: FileImage },
  { label: 'Pricing', to: '/pricing', icon: CreditCard },
];

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });
  const email = user.email || 'user@ai-studio.com';
  const credits = Number(user?.credits ?? 0);

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch {
        setUser({});
      }
    };

    syncUser();
    window.addEventListener('auth:changed', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth:changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="flex min-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
          <aside className="hidden w-72 border-r border-slate-800 bg-slate-950/90 p-5 lg:block">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">NeuroCraft-AI</div>
                <div className="text-xs text-slate-400">Creative suite</div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white ring-1 ring-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Settings2 className="h-4 w-4 text-indigo-300" />
                Workspace status
              </div>
              <div className="text-2xl font-bold text-white">Active</div>
              <p className="mt-1 text-xs text-slate-400">All AI tools are ready to use.</p>
            </div>
          </aside>

          <div className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-4 backdrop-blur-sm sm:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Dashboard</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                  {credits} credits
                </div>
                <div className="hidden rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 sm:block">
                  {email}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
