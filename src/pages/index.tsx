import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { hasCompletedOnboarding } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Loading…</div>
    </main>
  );
}
