// Conteúdo para /frontend/src/app/layout.tsx

import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'FinanCanvas',
  description: 'Seu gerenciador financeiro pessoal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // A correção está aqui, adicionando suppressHydrationWarning
    <html lang="pt" suppressHydrationWarning={true}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}