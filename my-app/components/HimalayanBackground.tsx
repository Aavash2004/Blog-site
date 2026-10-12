import React from "react";

export function HimalayanBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ zIndex: 0 }}
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
    >
      {/* --- Ambient Warm Glowing Sun Orbs --- */}
      {/* Left Sun Orb */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(251, 146, 60, 0.18) 45%, transparent 75%)",
          filter: "blur(50px)",
        }}
        className="absolute -left-28 top-[15%] h-[550px] w-[550px] rounded-full"
      />

      {/* Right Peach/Amber Glow behind Mountain Peak */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(251, 146, 60, 0.32) 0%, rgba(253, 186, 116, 0.18) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
        className="absolute -right-20 top-[5%] h-[700px] w-[700px] rounded-full"
      />

      {/* Center Subtle Warm Sun Glow */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 75%)",
          filter: "blur(70px)",
        }}
        className="absolute left-1/2 top-[25%] -translate-x-1/2 h-[600px] w-[600px] rounded-full"
      />

      {/* Bottom Right Warm Ambient Glow */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(254, 215, 170, 0.12) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
        className="absolute right-[5%] bottom-[5%] h-[480px] w-[480px] rounded-full"
      />

      {/* --- Himalayan Mountain Graphic from /mount.svg --- */}
      {/* Primary Peak on Top Right */}
      <div className="absolute right-0 top-[5%] w-[580px] sm:w-[750px] lg:w-[920px] xl:w-[1080px] opacity-75 dark:opacity-40 transition-opacity">
        <img
          src="/mount.svg"
          alt="Himalayan Mountain Background"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Secondary Mountain Ridge Silhouettes across bottom left */}
      <div className="absolute -left-20 bottom-[-5%] w-[620px] sm:w-[850px] opacity-35 dark:opacity-20 transition-opacity pointer-events-none">
        <img
          src="/mount.svg"
          alt=""
          className="w-full h-auto object-contain transform scale-x-[-1]"
        />
      </div>
    </div>
  );
}
