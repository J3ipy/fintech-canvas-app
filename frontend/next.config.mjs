const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'p2.trrsf.com', // <-- Adicionamos o domínio que deu erro
        port: '',
        pathname: '/**',
      },
      // Adicione aqui outros domínios que você queira permitir no futuro
      // Exemplo:
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      // },
    ],
  },
};

export default nextConfig;