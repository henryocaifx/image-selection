"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * VantaBackground Component
 * Renders a high-performance 3D "Waves" background using Vanta.js and Three.js.
 */
export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    // Dynamically load scripts if they are not already present
    const loadScript = (id: string, src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Vanta Waves requires Three.js r134 specifically as per user request
        await loadScript("three-js", "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("vanta-waves", "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js");

        // @ts-ignore - VANTA is globally attached to window by the scripts
        if (!vantaEffect && window.VANTA && vantaRef.current) {
          // @ts-ignore
          const effect = window.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x0a0a0c, // Deep dark base
            shininess: 35.0,
            waveHeight: 12.0,
            waveSpeed: 0.4,
            zoom: 0.75,
          });
          setVantaEffect(effect);
        }
      } catch (err) {
        console.error("Vanta initialization failed:", err);
      }
    };

    initVanta();

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
      id="vanta-background"
    />
  );
}
