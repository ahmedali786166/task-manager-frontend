import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Flag, Loader2, Sparkles, Wand2, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Turn goals into plans" },
      { name: "description", content: "Describe any project and get an AI-generated summary, priority, time estimate and step-by-step plan." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Turn any goal into an AI-generated step-by-step plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const API_URL = "https://api-task.bonto.run/";

type Plan = { summary: string; priority: string; estimatedHours: number; steps: string[] };

const priorityStyles: Record<string, string> = {
  high: "text-rose border-rose/40 bg-rose/10",
  medium: "text-amber border-amber/40 bg-amber/10",
  low: "text-emerald border-emerald/40 bg-emerald/10",
};

function Index() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data?.plan) {
        throw new Error(data?.message || data?.error || `The server responded with status ${res.status}.`);
      }
      setPlan(data.plan);
    } catch (err) {
      const msg = err instanceof TypeError
        ? "Can't reach the planning server at api-task.banto.run . Make sure your backend is running and allows CORS."
        : err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const pKey = plan?.priority?.toLowerCase() ?? "medium";

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12">
      {/* Ambient glows */}
      <motion.div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-glow/30 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="pointer-events-none absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-glow-2/25 blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, -50, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-10 flex flex-col items-center text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glow-shadow bg-brand mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-gradient text-4xl font-bold tracking-tight sm:text-5xl">AI Task Planner</motion.h1>
          <p className="mt-3 text-muted-foreground">Describe your goal. Get a plan in seconds.</p>
        </header>

        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-5">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5}
            placeholder="e.g. Launch a personal portfolio website with a blog and contact form…"
            className="w-full resize-none rounded-2xl border border-input bg-background/40 p-4 text-foreground placeholder:text-muted-foreground/70 outline-none transition focus:border-ring focus:shadow-[0_0_30px_-6px_var(--glow)]" />
          <div className="mt-4 flex justify-end">
            <motion.button type="submit" disabled={loading || !input.trim()} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="bg-brand glow-shadow relative inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">
              {loading && <span className="absolute inset-0 animate-ping rounded-xl border-2 border-ring/60" />}
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {loading ? "Planning…" : "Generate Plan"}
            </motion.button>
          </div>
        </motion.form>

        <AnimatePresence>
          {error && (
            <motion.div key="err" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
              className="glass mt-6 flex items-start gap-3 rounded-2xl border-destructive/40 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="flex-1 text-sm">{error}</p>
              <button onClick={() => setError(null)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {plan && (
            <motion.section key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
                <h2 className="text-gradient mb-3 text-xl font-semibold">Executive Summary</h2>
                <p className="leading-relaxed text-foreground/90">{plan.summary}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium capitalize ${priorityStyles[pKey] ?? priorityStyles["medium"]}`}>
                    <Flag className="h-4 w-4" /> {plan.priority} priority
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm font-medium">
                    <Clock className="h-4 w-4 text-primary" /> {plan.estimatedHours} hrs estimated
                  </span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl p-6">
                <h2 className="text-gradient mb-6 text-xl font-semibold">Action Steps</h2>
                <div className="relative pl-10">
                  <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4 + plan.steps.length * 0.15, ease: "easeOut" }}
                    className="bg-brand glow-shadow absolute left-[15px] top-2 bottom-2 w-0.5 origin-top rounded-full" />
                  <motion.ol initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }} className="space-y-4">
                    {plan.steps.map((step, i) => (
                      <Step key={i} index={i} text={step} />
                    ))}
                  </motion.ol>
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Step({ index, text }: { index: number; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <motion.li variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0 } }} className="relative">
      <button onClick={() => setDone(!done)}
        className={`absolute -left-10 top-2 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${done ? "bg-brand border-transparent text-primary-foreground glow-shadow" : "border-ring/50 bg-background text-primary"}`}
        aria-label={done ? "Mark step incomplete" : "Mark step complete"}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
      </button>
      <div onClick={() => setDone(!done)}
        className={`cursor-pointer rounded-2xl border border-border bg-background/30 p-4 transition hover:border-ring/50 ${done ? "text-muted-foreground line-through" : ""}`}>
        {text}
      </div>
    </motion.li>
  );
}
