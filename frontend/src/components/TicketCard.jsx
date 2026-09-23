import React from 'react';
import { QrCode } from 'lucide-react';

export const TicketCard = ({ ticket, registration, event, ticketType }) => {
  const code = ticket?.uniqueTicketCode || 'TKT-XXXXXXXX';
  const qrData = ticket?.qrCodeData || '';
  const eventName = event?.name || registration?.event?.name || 'Event';
  const typeName = ticketType?.name || registration?.ticketType?.name || 'Ticket';
  const status = ticket?.status || 'ACTIVE';

  return (
    <div className="qr-box">
      <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {typeName}
      </div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{eventName}</div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="qr-matrix">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <QrCode size={72} style={{ color: '#312e81' }} />
            <span style={{ fontSize: '0.85rem', letterSpacing: '1px', color: '#312e81', fontFamily: 'monospace', fontWeight: 700 }}>{code}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.75, marginTop: '0.5rem' }}>
        <span>Status: <strong style={{ color: status === 'ACTIVE' ? '#a7f3d0' : '#fca5a5' }}>{status}</strong></span>
        <span>Issued: {ticket?.issuedAt ? new Date(ticket.issuedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};
