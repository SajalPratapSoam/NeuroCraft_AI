import { useEffect, useState } from 'react';
import { ArrowRight, FileImage, FileText, ImagePlus, Sparkles, Wand2, CreditCard, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Article Generator',
    description: 'Create polished long-form articles tailored to your audience and tone.',
    icon: FileText,
    to: '/content-gen?tab=article',
    accent: 'from-indigo-500 to-purple-600',
  },
  {
    title: 'Blog Generator',
    description: 'Generate SEO-friendly blog posts with custom keywords and metadata.',
    icon: PenTool,
    to: '/content-gen?tab=blog',
    accent: 'from-fuchsia-500 to-violet-600',
  },
  {
    title: 'Image Generator',
    description: 'Create fresh visuals and image prompts directly from your ideas.',
    icon: ImagePlus,
    to: '/content-gen?tab=image',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Remove Background',
    description: 'Upload an image and remove the background in a single step.',
    icon: FileImage,
    to: '/file-tools?tab=background',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Resume Review',
    description: 'Upload a resume and get AI-powered feedback instantly.',
    icon: FileText,
    to: '/file-tools?tab=resume',
    accent: 'from-violet-500 to-fuchsia-600',
  },
  {
    title: 'Pricing',
    description: 'Choose a plan and unlock premium access to all NeuroCraft-AI tools.',
    icon: CreditCard,
    to: '/pricing',
    accent: 'from-violet-500 to-fuchsia-600',
  },
];

export default function Dashboard() {
  const [credits, setCredits] = useState(() => {
    try {
      return Number(JSON.parse(localStorage.getItem('user') || '{}')?.credits ?? 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const syncCredits = () => {
      try {
        setCredits(Number(JSON.parse(localStorage.getItem('user') || '{}')?.credits ?? 0));
      } catch {
        setCredits(0);
      }
    };

    syncCredits();
    window.addEventListener('auth:changed', syncCredits);
    window.addEventListener('storage', syncCredits);
    return () => {
      window.removeEventListener('auth:changed', syncCredits);
      window.removeEventListener('storage', syncCredits);
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 shadow-2xl shadow-indigo-950/20 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              NeuroCraft-AI Workspace
            </div>
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What will you create today?
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
              Generate content, process files, and launch your next idea with premium AI workflows built for speed.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-200/80">Available</div>
            <div className="mt-2 text-3xl font-bold">{credits}</div>
            <div className="text-indigo-200/80">credits remaining</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, to, accent }) => (
          <Link
            key={title}
            to={to}
            className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-indigo-500/10"
          >
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${accent}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-300">
              Open tool
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
