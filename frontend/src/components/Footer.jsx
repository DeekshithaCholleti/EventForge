import React from 'react';
import { Calendar } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#1f2933', color: '#DFF2EB', padding: '2rem 1.5rem', marginTop: 'auto', borderTop: '3px solid #7AB2D3' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700 }}>
          <Calendar size={20} style={{ color: '#B9E5E8' }} />
          <span>EventForge</span>
        </div>
        <p style={{ fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} EventForge Corporate Event & Conference Management Platform.
        </p>
      </div>
    </footer>
  );
};
