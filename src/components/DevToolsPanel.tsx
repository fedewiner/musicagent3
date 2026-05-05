export function DevToolsPanel({
  onSimulateNewRelease,
  onSimulateReleaseGap,
  onSimulateFollowerVerification,
}: {
  onSimulateNewRelease: () => void;
  onSimulateReleaseGap: () => void;
  onSimulateFollowerVerification: () => void;
}) {
  return (
    <div className="fixed bottom-3 right-3 z-50 w-64 border border-black/20 bg-white/95 p-3 text-[11px] shadow-sm backdrop-blur-sm max-sm:right-2 max-sm:w-[calc(100vw-1rem)]">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Dev Tools</div>
      <div className="grid gap-2">
        <button className="rounded-none border border-black/20 px-2 py-2 text-left leading-snug hover:bg-gray-50" onClick={onSimulateNewRelease}>
          Simulate: API finds new Spotify Release
        </button>
        <button className="rounded-none border border-black/20 px-2 py-2 text-left leading-snug hover:bg-gray-50" onClick={onSimulateReleaseGap}>
          Simulate: API detects 6-week release gap
        </button>
        <button className="rounded-none border border-black/20 px-2 py-2 text-left leading-snug hover:bg-gray-50" onClick={onSimulateFollowerVerification}>
          Simulate: API verifies 100 followers
        </button>
      </div>
    </div>
  );
}