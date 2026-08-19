/**
 * The atmosphere behind everything: soft coloured light that gives the glass
 * panels something to refract. Purely decorative, never interactive.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #1b1745 0%, #0c0d2a 45%, #05061a 100%)",
      }}
    >
      <div
        className="orb animate-float-slow"
        style={{
          top: "-14%",
          left: "-18%",
          width: "68vmax",
          height: "68vmax",
          background:
            "radial-gradient(circle at 35% 35%, rgba(139,124,255,0.42), rgba(139,124,255,0) 62%)",
        }}
      />
      <div
        className="orb animate-float-slower"
        style={{
          bottom: "-22%",
          right: "-20%",
          width: "62vmax",
          height: "62vmax",
          background:
            "radial-gradient(circle at 60% 40%, rgba(255,138,107,0.26), rgba(255,138,107,0) 62%)",
        }}
      />
      <div
        className="orb animate-float-slow"
        style={{
          top: "38%",
          right: "-8%",
          width: "40vmax",
          height: "40vmax",
          animationDelay: "-8s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(79,227,176,0.14), rgba(79,227,176,0) 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,6,26,0) 40%, rgba(5,6,26,0.55) 78%, rgba(5,6,26,0.85) 100%)",
        }}
      />
    </div>
  );
}
