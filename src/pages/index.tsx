import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="max-w-xl border border-black p-4">
        <h1 className="text-4xl font-semibold">Musicsteps</h1>
        <p className="mt-4 text-sm">A minimal MVP for tracking artist progress with local mock data.</p>
        <p className="mt-2 text-xs uppercase tracking-[0.15em]">Prototype / local data only</p>
        <Link className="mt-6 inline-block border border-black px-3 py-2 text-sm" href="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
