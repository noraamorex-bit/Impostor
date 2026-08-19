/**
 * The atmosphere behind everything: soft coloured light that gives the glass
 * panels something to refract. The orbs read the `--accent` variable, which the
 * shell rebinds per phase, so the room warms up as the game gets tense.
 * Purely decorative, never interactive.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(125% 85% at 50% -12%, #1d1850 0%, #0d0e2e 46%, #05061a 100%)",
      }}
    >
      {/* Primary accent light, top-left. */}
      <div
        className="orb animate-float-slow"
        style={{
          top: "-16%",
          left: "-20%",
          width: "72vmax",
          height: "72vmax",
          background:
            "radial-gradient(circle at 36% 36%, rgb(var(--accent) / 0.5), rgb(var(--accent) / 0) 62%)",
          transition: "background 0.8s ease",
        }}
      />
      {/* Counter-light, bottom-right, always a touch warmer than the accent. */}
      <div
        className="orb animate-float-slower"
        style={{
          bottom: "-24%",
          right: "-22%",
          width: "66vmax",
          height: "66vmax",
          background:
            "radial-gradient(circle at 60% 40%, rgb(var(--accent-soft) / 0.3), rgb(var(--accent-soft) / 0) 62%)",
          transition: "background 0.8s ease",
        }}
      />
      {/* A stage light behind the content column. Without something bright in
          the middle of the screen the panels have nothing to refract and the
          glass collapses into flat grey rectangles. */}
      <div
        className="orb"
        style={{
          top: "18%",
          left: "50%",
          width: "min(120vw, 720px)",
          height: "min(120vw, 720px)",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle at 50% 45%, rgb(var(--accent) / 0.28), rgb(var(--accent) / 0) 66%)",
          transition: "background 0.8s ease",
        }}
      />
      {/* A cool third light keeps the palette from going monochrome. */}
      <div
        className="orb animate-float-slow"
        style={{
          top: "34%",
          right: "-10%",
          width: "44vmax",
          height: "44vmax",
          animationDelay: "-8s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(84, 214, 255, 0.16), rgba(84, 214, 255, 0) 65%)",
        }}
      />
      {/* A faint horizon line under the content, so panels have an edge to sit on. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,6,26,0) 34%, rgba(5,6,26,0.42) 72%, rgba(5,6,26,0.86) 100%)",
        }}
      />
    </div>
  );
}
