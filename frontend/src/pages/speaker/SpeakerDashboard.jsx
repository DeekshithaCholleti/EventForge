import React, { useState, useEffect, useCallback } from "react";
import { speakerAPI, sessionAPI, staffAssignmentAPI, sponsorAPI, eventMemberAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../../components/UI";
import {
  User, Calendar, Clock, Presentation, Globe, Linkedin, Twitter,
  Mic2, Building2, Briefcase, CheckCircle2, Edit3, Save, X,
  BookOpen, Tag, MapPin, Users, ChevronRight
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const badge = (label, color = "#5f7488") => (
  <span style={{
    background: color + "15", color, border: `1px solid ${color}30`,
    borderRadius: "999px", padding: "2px 10px", fontSize: "0.72rem", fontWeight: 700
  }}>
    {label}
  </span>
);

const card = { background: "var(--cream)", borderRadius: "2px", border: "2px solid var(--dark)", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "var(--shadow)" };
const inputStyle = { width: "100%", padding: "0.6rem 0.9rem", borderRadius: "2px", border: "2px solid var(--dark)", background: "var(--cream)", color: "var(--text-main)", fontSize: "0.9rem", boxSizing: "border-box", boxShadow: "3px 3px 0 var(--dark)" };
const btnPrimary = { background: "var(--sky)", color: "var(--dark)", border: "2px solid var(--dark)", borderRadius: "2px", padding: "0.55rem 1.2rem", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "4px 4px 0 var(--dark)" };
const btnSecondary = { background: "var(--aqua)", color: "var(--dark)", border: "2px solid var(--dark)", borderRadius: "2px", padding: "0.55rem 1.2rem", cursor: "pointer", fontWeight: 700, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "4px 4px 0 var(--dark)" };

// ─── Sub-components ──────────────────────────────────────────────────────────

const EventCard = ({ event }) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const now = new Date();
  const isLive = now >= start && now <= end;
  const isUpcoming = now < start;
  return (
    <div style={{ ...card, marginBottom: 0, borderLeft: `8px solid ${isLive ? "#7AB2D3" : isUpcoming ? "#B9E5E8" : "#5f7488"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{event.name}</h3>
        {badge(isLive ? "Live Now" : isUpcoming ? "Upcoming" : "Completed",
          isLive ? "#7AB2D3" : isUpcoming ? "#B9E5E8" : "#5f7488")}
      </div>
      <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 0.75rem", lineHeight: 1.5 }}>
        {event.description ? event.description.slice(0, 160) + (event.description.length > 160 ? "…" : "") : "No description."}
      </p>
      <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.8rem", color: "#64748b", flexWrap: "wrap" }}>
        <span style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          <Calendar size={13} />
          {start.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          {" – "}
          {end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        {event.location?.city && (
          <span style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <MapPin size={13} />
            {[event.location.venueName, event.location.city].filter(Boolean).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => (
  <div style={{ padding: "1rem", border: "2px solid var(--dark)", background: "var(--cream)", boxShadow: "3px 3px 0 var(--dark)", borderRadius: "2px", marginBottom: "0.75rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{session.title}</div>
        <div style={{ color: "#64748b", fontSize: "0.82rem" }}>
          <Clock size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />
          {new Date(session.startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {" – "}
          {new Date(session.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
      {session.sessionType && badge(session.sessionType, "#7AB2D3")}
    </div>
    {session.description && <p style={{ color: "#64748b", fontSize: "0.83rem", margin: "0.5rem 0 0" }}>{session.description}</p>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SpeakerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    bio: "", designation: "", company: "", expertise: "",
    availability: "", presentationMaterials: "",
    socialLinks: { linkedin: "", twitter: "", website: "" },
  });

  const flash = useCallback((msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [profileRes, eventsRes] = await Promise.all([
          speakerAPI.getMyProfile(),
          speakerAPI.getMyEvents(),
        ]);
        const p = profileRes.data?.profile || {};
        setProfile(p);
        setForm({
          bio: p.bio || "",
          designation: p.designation || "",
          company: p.company || "",
          expertise: Array.isArray(p.expertise) ? p.expertise.join(", ") : "",
          availability: p.availability || "",
          presentationMaterials: Array.isArray(p.presentationMaterials) ? p.presentationMaterials.join("\n") : "",
          socialLinks: { linkedin: p.socialLinks?.linkedin || "", twitter: p.socialLinks?.twitter || "", website: p.socialLinks?.website || "" },
        });
        const evs = eventsRes.data?.events || [];
        setEvents(evs);

        // Fetch sessions for all assigned events
        if (evs.length > 0) {
          const sessResults = await Promise.all(evs.map(ev => sessionAPI.getAll({ event: ev._id })));
          const allSessions = sessResults.flatMap(r => r.data?.sessions || []);
          setSessions(allSessions);
        }
      } catch (e) {
        flash("Failed to load your data. Please refresh.", true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio: form.bio,
        designation: form.designation,
        company: form.company,
        expertise: form.expertise.split(",").map(s => s.trim()).filter(Boolean),
        availability: form.availability,
        presentationMaterials: form.presentationMaterials.split("\n").map(s => s.trim()).filter(Boolean),
        socialLinks: form.socialLinks,
      };
      const res = await speakerAPI.updateMyProfile(payload);
      setProfile(res.data?.profile);
      setEditMode(false);
      flash("Profile saved successfully!");
    } catch (e) {
      flash(e.message || "Failed to save profile", true);
    } finally {
      setSaving(false);
    }
  };

  const tabStyle = (active) => ({
    padding: "0.65rem 1.25rem", borderBottom: `3px solid ${active ? "#7AB2D3" : "transparent"}`,
    color: active ? "#1f2933" : "#5f7488", fontWeight: active ? 800 : 600,
    cursor: "pointer", background: "none", border: "none", fontSize: "0.95rem",
    display: "flex", alignItems: "center", gap: "0.4rem",
  });

  if (loading) return <div style={{ textAlign: "center", padding: "4rem" }}><LoadingSpinner /></div>;

  return (
    <div className="speaker-dashboard" style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="speaker-hero-icon">
          <Mic2 size={24} style={{ color: "white" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800 }}>Speaker Dashboard</h1>
          <p style={{ margin: 0, color: "#64748b" }}>Welcome back, {user?.name}! You are speaking at {events.length} event{events.length !== 1 ? "s" : ""}.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Assigned Events", value: events.length, color: "#7AB2D3", icon: <Calendar size={20} /> },
          { label: "Total Sessions", value: sessions.length, color: "#B9E5E8", icon: <BookOpen size={20} /> },
          { label: "Upcoming Sessions", value: sessions.filter(s => new Date(s.startTime) > new Date()).length, color: "#DFF2EB", icon: <Clock size={20} /> },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "1rem 1.25rem", marginBottom: 0, display: "flex", alignItems: "center", gap: "1rem", borderTop: `3px solid ${s.color}` }}>
            <div className="speaker-stat-icon" style={{ background: s.color, color: "var(--dark)" }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      {/* Tabs */}
      <div className="speaker-tabs" style={{ display: "flex", borderBottom: "2px solid var(--dark)", marginBottom: "1.5rem" }}>
        <button className="speaker-tab" style={tabStyle(activeTab === "profile")} onClick={() => setActiveTab("profile")}><User size={16} /> My Profile</button>
        <button className="speaker-tab" style={tabStyle(activeTab === "events")} onClick={() => setActiveTab("events")}><Calendar size={16} /> My Events</button>
        <button className="speaker-tab" style={tabStyle(activeTab === "sessions")} onClick={() => setActiveTab("sessions")}><BookOpen size={16} /> Sessions</button>
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <>
          {!editMode ? (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem" }}>{user?.name}</h2>
                  <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    {profile?.designation && <span>{profile.designation}</span>}
                    {profile?.designation && profile?.company && <span> · </span>}
                    {profile?.company && <span>{profile.company}</span>}
                  </div>
                </div>
                <button style={btnPrimary} onClick={() => setEditMode(true)}><Edit3 size={15} /> Edit Profile</button>
              </div>

              {profile?.bio && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Bio</div>
                  <p style={{ color: "#374151", lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                </div>
              )}

              {profile?.expertise?.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Areas of Expertise</div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {profile.expertise.map(e => badge(e, "#7AB2D3"))}
                  </div>
                </div>
              )}

              {profile?.availability && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Availability</div>
                  <p style={{ color: "#374151", margin: 0 }}>{profile.availability}</p>
                </div>
              )}

              {profile?.presentationMaterials?.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Presentation Materials</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {profile.presentationMaterials.map((m, i) => (
                      <a key={i} href={m} target="_blank" rel="noopener noreferrer" style={{ color: "#5f98b8", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Globe size={14} /> {m}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(profile?.socialLinks?.linkedin || profile?.socialLinks?.twitter || profile?.socialLinks?.website) && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Social Links</div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#0a66c2", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.88rem" }}><Linkedin size={16} /> LinkedIn</a>}
                    {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#1da1f2", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.88rem" }}><Twitter size={16} /> Twitter</a>}
                    {profile.socialLinks.website && <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: "#5f98b8", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.88rem" }}><Globe size={16} /> Website</a>}
                  </div>
                </div>
              )}

              {!profile?.bio && !profile?.designation && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  <Mic2 size={32} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                  <p>Your profile is empty. Click "Edit Profile" to fill in your details.</p>
                </div>
              )}
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0 }}>Edit Your Profile</h3>
                <button style={btnSecondary} onClick={() => setEditMode(false)}><X size={15} /> Cancel</button>
              </div>
              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Designation</label>
                    <input value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} style={inputStyle} placeholder="e.g. Chief Technology Officer" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Company / Organization</label>
                    <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} style={inputStyle} placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Tell the audience about yourself…" />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Areas of Expertise <span style={{ color: "#94a3b8", fontWeight: 400 }}>(comma-separated)</span></label>
                  <input value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} style={inputStyle} placeholder="e.g. AI, Machine Learning, Product Strategy" />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Availability <span style={{ color: "#94a3b8", fontWeight: 400 }}>(your schedule / preferred speaking slots)</span></label>
                  <input value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))} style={inputStyle} placeholder="e.g. Available weekday mornings, Oct 1–15" />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Presentation Materials <span style={{ color: "#94a3b8", fontWeight: 400 }}>(one URL per line)</span></label>
                  <textarea value={form.presentationMaterials} onChange={e => setForm(p => ({ ...p, presentationMaterials: e.target.value }))} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder={"https://slides.google.com/...\nhttps://docs.example.com/..."} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}><Linkedin size={13} style={{ verticalAlign: "middle" }} /> LinkedIn</label>
                    <input value={form.socialLinks.linkedin} onChange={e => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))} style={inputStyle} placeholder="https://linkedin.com/in/…" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}><Twitter size={13} style={{ verticalAlign: "middle" }} /> Twitter / X</label>
                    <input value={form.socialLinks.twitter} onChange={e => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, twitter: e.target.value } }))} style={inputStyle} placeholder="https://twitter.com/…" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}><Globe size={13} style={{ verticalAlign: "middle" }} /> Website</label>
                    <input value={form.socialLinks.website} onChange={e => setForm(p => ({ ...p, socialLinks: { ...p.socialLinks, website: e.target.value } }))} style={inputStyle} placeholder="https://yoursite.com" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="submit" style={btnPrimary} disabled={saving}><Save size={15} />{saving ? "Saving…" : "Save Profile"}</button>
                  <button type="button" style={btnSecondary} onClick={() => setEditMode(false)}><X size={15} /> Cancel</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === "events" && (
        <div>
          {events.length === 0 ? (
            <div style={{ ...card, textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
              <Calendar size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
              <p>You haven't been assigned to any events yet. Contact your event organizer.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {events.map(ev => <EventCard key={ev._id} event={ev} />)}
            </div>
          )}
        </div>
      )}

      {/* ── SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <div>
          {events.map(ev => {
            const evSessions = sessions.filter(s => {
              const evId = typeof s.event === "object" ? s.event?._id : s.event;
              return evId === ev._id;
            });
            return (
              <div key={ev._id} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={16} style={{ color: "#7AB2D3" }} /> {ev.name}
                  <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: "0.85rem" }}>({evSessions.length} session{evSessions.length !== 1 ? "s" : ""})</span>
                </h3>
                {evSessions.length === 0 ? (
                  <p style={{ color: "#94a3b8", padding: "0.75rem 0" }}>No sessions published for this event yet.</p>
                ) : (
                  evSessions.map(s => <SessionCard key={s._id} session={s} />)
                )}
              </div>
            );
          })}
          {events.length === 0 && (
            <div style={{ ...card, textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
              <BookOpen size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
              <p>No sessions to display. You need to be assigned to an event first.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakerDashboard;
