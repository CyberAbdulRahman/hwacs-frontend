import { Navbar } from "./Navbar";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">About HWACS</h1>

        <p className="text-muted-foreground leading-relaxed">
          HWACS (HoneyPot Web Attack Capture System) is a security-focused
          platform designed to detect, analyze, and visualize cyber attacks
          using intelligent honeypots and AI-driven analytics.
        </p>

        <p className="mt-4 text-muted-foreground">
          Our mission is to help organizations proactively identify threats
          before they cause real damage.
        </p>
      </div>
    </div>
  );
}

