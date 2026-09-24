import React, { useRef } from 'react';

export const MagneticButton = ({ children, className = 'btn btn-primary', ...props }) => {
  const buttonRef = useRef(null);

  const handlePointerMove = (event) => {
    const button = buttonRef.current;
    if (!button || button.disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = button.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
    button.style.transform = `translate(${x}px, ${y}px)`;
  };

  const resetPosition = () => {
    if (buttonRef.current) buttonRef.current.style.transform = '';
  };

  return (
    <button
      ref={buttonRef}
      className={`${className} magnetic`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      {...props}
    >
      {children}
    </button>
  );
};

export const StatCard = ({ label, value, icon: Icon, color = '#4A628A', sub }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d819b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: color }}>{value}</div>
        {sub && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>{sub}</p>}
      </div>
      {Icon && (
        <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '10px' }}>
          <Icon size={24} style={{ color }} />
        </div>
      )}
    </div>
  </div>
);

export const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '3rem', color: '#6d819b' }}>
    <div style={{
      width: '40px', height: '40px', border: '4px solid #DFF2EB',
      borderTopColor: '#4A628A', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto 1rem',
    }} />
    <p>Loading...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', description = '', icon: Icon }) => (
  <div style={{ textAlign: 'center', padding: '3rem', color: '#6d819b' }}>
    {Icon && <Icon size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#7AB2D3' }} />}
    <h3 style={{ color: '#4A628A', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
    {description && <p style={{ fontSize: '0.9rem' }}>{description}</p>}
  </div>
);

export const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    success: { cls: 'alert-success', icon: '✓' },
    danger: { cls: 'alert-danger', icon: '✕' },
    warning: { cls: 'alert-warning', icon: '⚠' },
  };
  const t = types[type] || types.success;
  return (
    <div className={`alert ${t.cls}`} style={{ justifyContent: 'space-between' }}>
      <span>{t.icon} {message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>}
    </div>
  );
};
