import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../api/axios';

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [registerStep, setRegisterStep] = useState(1);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', otp: '', password: '' });

  const updateLogin = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateRegister = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/login', loginData);
      const data = response.data || {};
      const token = data.token;
      const user = {
        email: data.email || loginData.email,
        id: data.userId,
        credits: data.credits,
        currentPlan: data.currentPlan,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', data.userId || user.id || '');
      window.dispatchEvent(new Event('auth:changed'));

      setMessage(data.message || 'Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error?.response?.data?.error || error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/api/auth/register/send-otp', { email: registerData.email });
      setRegisterStep(2);
      setMessage('OTP sent to your email');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/register/verify', {
        email: registerData.email,
        otp: registerData.otp,
        password: registerData.password,
      });
      const data = response.data || {};
      const token = data.token;
      const user = {
        email: data.email || registerData.email,
        id: data.userId,
        credits: data.credits ?? 10,
        currentPlan: data.currentPlan ?? 'FREE',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', data.userId || user.id || '');
      window.dispatchEvent(new Event('auth:changed'));

      setMessage(data.message || 'Registration successful');
      setRegisterData({ email: '', otp: '', password: '' });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-indigo-100" />
                </div>
                <div>
                  <div className="text-xl font-bold">NeuroCraft-AI</div>
                  <div className="text-sm text-indigo-100/80">Build smarter</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                Design, generate, and automate your creative work.
              </h1>
              <p className="max-w-md text-base text-indigo-100/80">
                Turn ideas into polished content, enhance media, and unlock AI-powered workflows from one dashboard.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-indigo-100/80">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <ShieldCheck className="h-4 w-4 text-indigo-200" />
                Secure JWT authentication
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <Sparkles className="h-4 w-4 text-indigo-200" />
                AI generation tools and file processing
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-7 flex rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setMessage('');
                }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  tab === 'login' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-300 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setMessage('');
                }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  tab === 'register' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-300 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
                {message}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Email</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={updateLogin}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="user@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={updateLogin}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Please wait...' : 'Login'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            ) : registerStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Email</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={updateRegister}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="user@gmail.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Email</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={updateRegister}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">OTP</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="otp"
                      value={registerData.otp}
                      onChange={updateRegister}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">Password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={updateRegister}
                      className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                      placeholder="password123"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
