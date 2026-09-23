import React from 'react';
import { Calendar } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem 1.5rem', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700 }}>
          <Calendar size={20} style={{ color: '#4f46e5' }} />
          <span>EventForge</span>
        </div>
        <p style={{ fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} EventForge Corporate Event & Conference Management Platform.
        </p>
      </div>
    </footer>
  );
};
