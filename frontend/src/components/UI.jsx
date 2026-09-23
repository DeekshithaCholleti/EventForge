import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color = '#4f46e5', sub }) => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</p>
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
  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
    <div style={{
      width: '40px', height: '40px', border: '4px solid #e2e8f0',
      borderTopColor: '#4f46e5', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto 1rem',
    }} />
    <p>Loading...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', description = '', icon: Icon }) => (
  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
    {Icon && <Icon size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#cbd5e1' }} />}
    <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
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
