import React, { useState } from 'react';
import { feedbackAPI } from '../api';
import { Star, X, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

export const FeedbackModal = ({ session, event, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Detect if this is event-level feedback (session._id === event._id)
  const isEventFeedback = session?._id === event?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await feedbackAPI.create({
        event: event._id,
        session: session._id,
        rating,
        comment,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess(res.data.item);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>Thank You!</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Your feedback has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Star size={22} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0 }}>{isEventFeedback ? 'Rate This Event' : 'Session Feedback'}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
            {isEventFeedback ? 'Event' : 'Session'}
          </div>
          <div style={{ fontWeight: 700, color: '#1e293b' }}>
            {isEventFeedback ? (event?.name || 'Event') : session?.title}
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label style={{ fontWeight: 600 }}>Your Rating</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val} type="button"
                  onMouseEnter={() => setHoverRating(val)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(val)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                >
                  <Star
                    size={36}
                    fill={(hoverRating || rating) >= val ? '#f59e0b' : 'none'}
                    stroke={(hoverRating || rating) >= val ? '#f59e0b' : '#cbd5e1'}
                    style={{ transition: 'all 0.15s' }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#f59e0b' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600 }}>
              {isEventFeedback ? 'What did you think of the event?' : 'Comments (optional)'}
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder={isEventFeedback
                ? 'Share what you loved, what could be improved, or any suggestions…'
                : 'Share your thoughts about this session…'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle size={16} /> {loading ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
