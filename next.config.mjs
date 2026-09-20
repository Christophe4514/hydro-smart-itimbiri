/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // react-leaflet v4's MapContainer does not tolerate React Strict Mode's
  // double-invoked mount/unmount in dev (throws "Map container is already
  // initialized"). Disabled app-wide rather than working around it locally.
  reactStrictMode: false,
};

export default nextConfig;
