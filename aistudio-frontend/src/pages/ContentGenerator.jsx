import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, FileText, ImagePlus, Sparkles, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { persistUserUpdate, refreshUserFromServer } from '../utils/userSync';

const initialArticleForm = {
  topic: '',
  targetAudience: '',
  tone: 'professional',
  wordCount: 700,
};

const initialBlogForm = {
  topic: '',
  keywords: '',
  tone: 'professional',
  includeSeoMetadata: true,
};

const initialImageForm = {
  prompt: '',
  size: '1024x1024',
};

export default function ContentGenerator() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('article');
  const [articleForm, setArticleForm] = useState(initialArticleForm);
  const [blogForm, setBlogForm] = useState(initialBlogForm);
  const [imageForm, setImageForm] = useState(initialImageForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get('tab');
    if (requestedTab && ['article', 'blog', 'image'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [location.search]);

  useEffect(() => {
    setResult('');
    setImageUrl('');
    setError('');
  }, [activeTab]);

  const updateArticleForm = (e) => {
    const { name, value } = e.target;
    setArticleForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateBlogForm = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const updateImageForm = (e) => {
    const { name, value } = e.target;
    setImageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateArticle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const payload = {
        ...articleForm,
        wordCount: Number(articleForm.wordCount),
      };
      const { data } = await api.post('/api/ai/generate-article', payload);
      setResult(data.content || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to generate article');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlog = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setImageUrl('');

    try {
      const payload = {
        topic: blogForm.topic,
        tone: blogForm.tone.charAt(0).toUpperCase() + blogForm.tone.slice(1),
      };
      const { data } = await api.post('/api/ai/generate-blog', payload);
      setResult(data.content || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to generate blog');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setImageUrl('');

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        prompt: imageForm.prompt,
        userId: Number(localStorage.getItem('userId') || 1),
        email: storedUser.email || '',
        size: imageForm.size,
      };
      const { data } = await api.post('/api/ai/generate-image', payload);
      setImageUrl(data.imageUrl || '');
      setResult(data.imageUrl ? 'Image generated successfully.' : '');

      if (data?.credits !== undefined || data?.currentPlan !== undefined) {
        persistUserUpdate({
          credits: data.credits ?? storedUser.credits ?? 0,
          currentPlan: data.currentPlan ?? storedUser.currentPlan ?? 'FREE',
        });
      } else {
        await refreshUserFromServer();
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Content engine</p>
            <h1 className="text-2xl font-bold text-white">AI Content Generator</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex rounded-2xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('article')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === 'article' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Article
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('blog')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === 'blog' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Image
            </button>
          </div>

          {activeTab === 'article' ? (
            <form onSubmit={handleGenerateArticle} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Topic</label>
                <input name="topic" value={articleForm.topic} onChange={updateArticleForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none ring-0 placeholder:text-slate-500" placeholder="AI workflow automation" required />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Target audience</label>
                <input name="targetAudience" value={articleForm.targetAudience} onChange={updateArticleForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Startup founders" required />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Tone</label>
                <select name="tone" value={articleForm.tone} onChange={updateArticleForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none">
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Word count</label>
                <input type="number" min="200" step="50" name="wordCount" value={articleForm.wordCount} onChange={updateArticleForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none" required />
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white disabled:opacity-60">
                {loading ? 'Generating...' : 'Generate article'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : activeTab === 'blog' ? (
            <form onSubmit={handleGenerateBlog} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Blog topic</label>
                <input name="topic" value={blogForm.topic} onChange={updateBlogForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-500" placeholder="AI content strategy" required />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Keywords</label>
                <input name="keywords" value={blogForm.keywords} onChange={updateBlogForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-500" placeholder="SEO, automation, marketing" required />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Tone</label>
                <select name="tone" value={blogForm.tone} onChange={updateBlogForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none">
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="thoughtful">Thoughtful</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200">
                <input type="checkbox" name="includeSeoMetadata" checked={blogForm.includeSeoMetadata} onChange={updateBlogForm} className="h-4 w-4 accent-indigo-500" />
                Include SEO metadata
              </label>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white disabled:opacity-60">
                {loading ? 'Generating...' : 'Generate blog'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleGenerateImage} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Image prompt</label>
                <textarea name="prompt" value={imageForm.prompt} onChange={updateImageForm} rows="5" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-500" placeholder="A futuristic city at sunset, cinematic lighting" required />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Size</label>
                <select name="size" value={imageForm.size} onChange={updateImageForm} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none">
                  <option value="1024x1024">1024x1024</option>
                  <option value="512x512">512x512</option>
                  <option value="1536x1024">1536x1024</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white disabled:opacity-60">
                {loading ? 'Generating...' : 'Generate image'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Generated output</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex-1 min-h-[380px] rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm leading-7 text-slate-200 flex flex-col justify-center">
            {activeTab === 'image' && imageUrl ? (
              <div className="flex h-full w-full flex-col gap-4 items-center justify-center">
                <img src={imageUrl} alt="Generated AI artwork" className="w-full rounded-2xl border border-slate-800 object-contain max-h-[500px]" />
                <p className="text-slate-400">{result}</p>
              </div>
            ) : result ? (
              <div className="w-full h-full text-left text-slate-300 overflow-y-auto pr-2">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mt-6 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-5 mb-2" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="text-slate-300 leading-relaxed" {...props} />,
                    hr: ({ node, ...props }) => <hr className="border-slate-700 my-6" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    a: ({ node, ...props }) => <a className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-slate-500 flex h-full items-center justify-center">
                Select a generation mode and provide your inputs to produce AI content here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}