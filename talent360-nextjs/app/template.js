// template.js (as opposed to layout.js) remounts its subtree on every navigation.
// That's exactly what we want for a page-transition effect: the .page-transition
// div gets freshly inserted on each route change, so its CSS animation replays
// automatically — no extra JS state needed to detect "did the route change."
export default function Template({ children }) {
  return <div className="page-transition">{children}</div>;
}
