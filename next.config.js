/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  images: {
    // 👇 Add your Supabase project domain here
    domains: ['zzcjcxqkmvrfkwhgapgo.supabase.co'],
  },
};

module.exports = nextConfig;
