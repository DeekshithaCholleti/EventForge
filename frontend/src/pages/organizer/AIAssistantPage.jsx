import React, { useState } from 'react';
import { aiAPI } from '../../api';
import { Sparkles, Copy, CheckCircle, FileText, User, Megaphone, Clock } from 'lucide-react';
import { LoadingSpinner } from '../../components/UI';

const AIAssistantPage = () => {
  const [activeTab, setActiveTab] = useState('event');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [eventData, setEventData] = useState({ name: '', theme: '', targetAudience: '', keyTopics: '' });
  const [speakerData, setSpeakerData] = useState({ name: '', background: '', expertise: '' });
  const [announcementData, setAnnouncementData] = useState({ eventName: '', type: 'REMINDER', details: '' });

  const tabs = [
    { id: 'event', label: 'Event Description', icon: FileText },
    { id: 'speaker', label: 'Speaker Bio', icon: User },
    { id: 'announcement', label: 'Announcement', icon: Megaphone },
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);
    
    try {
      let res;
      if (activeTab === 'event') {
        res = await aiAPI.eventDescription(eventData);
      } else if (activeTab === 'speaker') {
        res = await aiAPI.speakerBio(speakerData);
      } else if (activeTab === 'announcement') {
        res = await aiAPI.announcement(announcementData);
      }
      
      const payload = res?.data?.result || res?.data;
      const text = payload?.content || payload || 'Generated content will appear here.';
      setResult(text);
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError(typeof err === 'string' ? err : err.message || 'AI generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Sparkles size={28} style={{ color: '#ec4899' }} />
        <h1 style={{ margin: 0 }}>AI Assistant</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Generate compelling copy for your events, speakers, and announcements using AI.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(''); setError(''); }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #ec4899' : '2px solid transparent',
              color: activeTab === tab.id ? '#ec4899' : '#64748b',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Form Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Input Details</h3>
          
          <form onSubmit={handleGenerate}>
            {activeTab === 'event' && (
              <>
                <div className="form-group">
                  <label>Event Name</label>
                  <input className="form-control" value={eventData.name} onChange={e => setEventData({...eventData, name: e.target.value})} placeholder="e.g. TechSummit 2026" required />
                </div>
                <div className="form-group">
                  <label>Event Theme/Topic</label>
                  <input className="form-control" value={eventData.theme} onChange={e => setEventData({...eventData, theme: e.target.value})} placeholder="e.g. AI and the Future of Work" required />
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <input className="form-control" value={eventData.targetAudience} onChange={e => setEventData({...eventData, targetAudience: e.target.value})} placeholder="e.g. Software Engineers, Product Managers" />
                </div>
                <div className="form-group">
                  <label>Key Topics (comma separated)</label>
                  <textarea className="form-control" rows={3} value={eventData.keyTopics} onChange={e => setEventData({...eventData, keyTopics: e.target.value})} placeholder="Machine Learning, Remote Work, Automation" />
                </div>
              </>
            )}

            {activeTab === 'speaker' && (
              <>
                <div className="form-group">
                  <label>Speaker Name</label>
                  <input className="form-control" value={speakerData.name} onChange={e => setSpeakerData({...speakerData, name: e.target.value})} placeholder="e.g. Dr. Sarah Chen" required />
                </div>
                <div className="form-group">
                  <label>Professional Background</label>
                  <textarea className="form-control" rows={3} value={speakerData.background} onChange={e => setSpeakerData({...speakerData, background: e.target.value})} placeholder="e.g. 15 years in AI research, former Google Brain lead" required />
                </div>
                <div className="form-group">
                  <label>Key Expertise</label>
                  <input className="form-control" value={speakerData.expertise} onChange={e => setSpeakerData({...speakerData, expertise: e.target.value})} placeholder="e.g. Neural Networks, Ethics in AI" required />
                </div>
              </>
            )}

            {activeTab === 'announcement' && (
              <>
                <div className="form-group">
                  <label>Event Name</label>
                  <input className="form-control" value={announcementData.eventName} onChange={e => setAnnouncementData({...announcementData, eventName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Announcement Type</label>
                  <select className="form-control" value={announcementData.type} onChange={e => setAnnouncementData({...announcementData, type: e.target.value})}>
                    <option value="REMINDER">Event Reminder</option>
                    <option value="UPDATE">Schedule Update</option>
                    <option value="URGENT">Urgent Change (e.g. Room Change)</option>
                    <option value="PROMO">Promotional / Ticket Sales</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Important Details</label>
                  <textarea className="form-control" rows={4} value={announcementData.details} onChange={e => setAnnouncementData({...announcementData, details: e.target.value})} placeholder="e.g. The keynote has been moved to Hall A at 10:00 AM" required />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', background: '#ec4899', borderColor: '#ec4899' }}>
              <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </form>
        </div>

        {/* Result Panel */}
        <div className="card" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>Generated Result</h3>
            {result && (
              <button onClick={copyToClipboard} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                {copied ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner />
            </div>
          ) : result ? (
            <div style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
              {result}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
              <Sparkles size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Fill out the details on the left to generate AI-crafted content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
