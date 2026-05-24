// Studio page is just a redirect — all routing happens inside StudioShell via the store.
// The shell reads settings.mode + activeShared/activeProfileId and renders the right surface.
export default function StudioPage() {
  // Shell handles everything; this component only exists to satisfy Next.js file-based routing.
  return null;
}