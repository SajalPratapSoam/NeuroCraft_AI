import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, FileImage, FileText, ImageUp, LoaderCircle, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { persistUserUpdate, refreshUserFromServer } from '../utils/userSync';

export default function FileTools() {
  const location = useLocation();
  const [activeView, setActiveView] = useState('background');
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [backgroundResult, setBackgroundResult] = useState('');
  const [resumeResult, setResumeResult] = useState('');
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle URL parameters for initial tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedView = params.get('tab');
    if (requestedView === 'resume') {
      setActiveView('resume');
    } else {
      setActiveView('background');
    }
  }, [location.search]);

  // Clear errors when switching tabs
  useEffect(() => {
    setError('');
  }, [activeView]);

  const handleBackgroundUpload = async (e) => {
    e.preventDefault();
    if (!backgroundFile) return;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const formData = new FormData();
    formData.append('file', backgroundFile);
    formData.append('email', storedUser.email || '');

    setBackgroundLoading(true);
    setError('');
    setBackgroundResult('');

    try {
      const { data } = await api.post('/api/ai/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBackgroundResult(data.imageUrl || '');

      persistUserUpdate({
        credits: data.credits ?? storedUser.credits ?? 0,
        currentPlan: data.currentPlan ?? storedUser.currentPlan ?? 'FREE',
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Background removal failed');
    } finally {
      setBackgroundLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('email', storedUser.email || '');

    setResumeLoading(true);
    setError('');
    setResumeResult('');

    try {
      const { data } = await api.post('/api/ai/review-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeResult(data.review || '');

      persistUserUpdate({
        credits: data.credits ?? storedUser.credits ?? 0,
        currentPlan: data.currentPlan ?? storedUser.currentPlan ?? 'FREE',
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Resume analysis failed');
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <FileImage className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">File workflows</p>
            <h1 className="text-2xl font-bold text-white">AI File Tools</h1>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT CONTAINER */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
        
        {/* LEFT COLUMN: Controls & Input */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex rounded-2xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setActiveView('background')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeView === 'background' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Remove Background
            </button>
            <button
              type="button"
              onClick={() => setActiveView('resume')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeView === 'resume' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Resume Review
            </button>
          </div>

          {activeView === 'background' ? (
            <form onSubmit={handleBackgroundUpload} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <ImageUp className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-white">Upload Image</h2>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 px-3 py-6 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-white hover:file:bg-cyan-700 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={backgroundLoading || !backgroundFile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60 transition"
              >
                {backgroundLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Remove background
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-white">Upload Resume</h2>
              </div>

              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-dashed border-slate-700 bg-slate-950 px-3 py-6 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-2 file:text-white hover:file:bg-violet-700 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resumeLoading || !resumeFile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-3 font-medium text-white disabled:opacity-60 transition"
              >
                {resumeLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  <>
                    Review resume
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Output display */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Generated output</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex-1 min-h-[380px] rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm leading-7 text-slate-200 flex flex-col items-center justify-center">
            {activeView === 'background' ? (
              backgroundResult ? (
                <div className="flex h-full w-full flex-col gap-4 items-center justify-center">
                  <img
                    src={backgroundResult}
                    alt="Background removed output"
                    className="w-full rounded-xl object-contain max-h-[500px]"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  Upload an image and click remove background to see your generated file here.
                </div>
              )
            ) : resumeResult ? (
              <div className="w-full h-full text-left text-slate-300 overflow-y-auto pr-2">
                <ReactMarkdown
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="text-slate-300 leading-relaxed" {...props} />,
                    hr: ({ node, ...props }) => <hr className="border-slate-700 my-6" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  }}
                >
                  {resumeResult}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                Upload your PDF resume and click review to receive AI-powered feedback here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          Secure processing with JWT-authenticated file uploads
        </div>
      </div>
    </div>
  );
}