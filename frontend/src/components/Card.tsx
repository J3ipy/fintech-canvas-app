import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-gray-950/70 border border-gray-800 rounded-2xl p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);