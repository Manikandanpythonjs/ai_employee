import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // StrictMode is intentionally left ON. It used to be disabled because
  // @react-three/fiber plus drei's <Html> created a nested React root per label,
  // so every effect pass tore down and rebuilt 17 extra roots. Those nested roots
  // are gone, so the double-mount checks are valuable again: they are what catch
  // a leaked listener or an uncancelled animation frame.
  reactStrictMode: true,
};

export default nextConfig;
