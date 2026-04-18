export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-950 to-gray-950 -z-10" />
      
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Modern Web App
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl">
          Scaffolded project structure with Next.js frontend, NestJS backend, and Tailwind CSS 4.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-white/20">
            <h2 className="mb-3 text-2xl font-semibold text-blue-400">
              Frontend <span>-&gt;</span>
            </h2>
            <p className="m-0 text-sm text-gray-300">
              Next.js 14+ App Router, integrated with Tailwind CSS 4.
            </p>
          </div>

          <div className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-white/20">
            <h2 className="mb-3 text-2xl font-semibold text-emerald-400">
              Backend <span>-&gt;</span>
            </h2>
            <p className="m-0 text-sm text-gray-300">
              NestJS providing scalable architecture with TypeScript.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
