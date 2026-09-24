import React, { useState, useEffect, useCallback } from "react";
import { sponsorAPI, sponsorAssignmentAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../../components/UI";
import { Building2, Calendar, Target, Edit3, Save, X, Tag, Link as LinkIcon, CheckCircle2, Circle } from "lucide-react";

const badge = (label, color = "#64748b") => (
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
const btnAction = { background: "var(--sky)", color: "var(--dark)", border: "2px solid var(--dark)", borderRadius: "2px", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem", boxShadow: "3px 3px 0 var(--dark)" };

const SponsorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [sponsorships, setSponsorships] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Edit Profile / Brand State
  const [editMode, setEditMode] = useState(null); // sponsor ID being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const flash = useCallback((msg, isErr = false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sponsorAPI.getMySponsorships();
      const sps = res.data?.sponsorships || [];
      setSponsorships(sps);

      const asgnMap = {};
      await Promise.all(sps.map(async (sp) => {
        const asgnRes = await sponsorAssignmentAPI.getAll({ sponsor: sp._id, event: sp.event?._id });
        if (asgnRes.data?.items?.length > 0) {
          asgnMap[sp._id] = asgnRes.data.items[0];
        }
      }));
      setAssignments(asgnMap);
    } catch (e) {
      flash("Failed to load sponsorship data.", true);
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (sponsor) => {
    setForm({
      companyName: sponsor.companyName || "",
      description: sponsor.description || "",
      logo: sponsor.logo || "",
      website: sponsor.website || "",
      contactInformation: {
        email: sponsor.contactInformation?.email || "",
        phone: sponsor.contactInformation?.phone || "",
        contactPerson: sponsor.contactInformation?.contactPerson || "",
      }
    });
    setEditMode(sponsor._id);
  };

  const handleSaveBrand = async (sponsorId, e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sponsorAPI.update(sponsorId, form);
      flash("Brand assets updated successfully!");
      setEditMode(null);
      fetchData();
    } catch (e) {
      flash(e.message || "Failed to update assets", true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDeliverable = async (assignmentId, deliverables, delId, newStatus) => {
    try {
      const updatedDeliverables = deliverables.map(d => 
        d._id === delId ? { ...d, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date() : null } : d
      );
      await sponsorAssignmentAPI.update(assignmentId, { deliverables: updatedDeliverables });
      flash("Deliverable updated!");
      fetchData();
    } catch (e) {
      flash("Failed to update deliverable", true);
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="sponsor-hero-icon">
          <Building2 size={24} style={{ color: "white" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800 }}>Sponsor Dashboard</h1>
          <p style={{ margin: 0, color: "#64748b" }}>Manage your event sponsorships, brand assets, and deliverables.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <button style={tabStyle(activeTab === "events")} onClick={() => setActiveTab("events")}><Calendar size={16} /> Sponsored Events</button>
        <button style={tabStyle(activeTab === "deliverables")} onClick={() => setActiveTab("deliverables")}><Target size={16} /> Deliverables & Packages</button>
      </div>

      {/* ── EVENTS & BRAND ASSETS ── */}
      {activeTab === "events" && (
        <div>
          {sponsorships.length === 0 ? (
            <div style={{ ...card, textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
              <Building2 size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
              <p>You have no active sponsorships yet.</p>
            </div>
          ) : (
            sponsorships.map(sp => (
              <div key={sp._id} style={{ ...card, borderTop: "8px solid #7AB2D3" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.2rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {sp.event?.name || "Unknown Event"} 
                      {badge(sp.status, sp.status === 'ACTIVE' ? '#10b981' : '#f59e0b')}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                      <Calendar size={12} style={{ verticalAlign: "middle", marginRight: "4px" }}/>
                      {new Date(sp.event?.startDate).toLocaleDateString()} - {new Date(sp.event?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#334155" }}><Building2 size={16} style={{ verticalAlign: "bottom" }} /> Brand Details for this Event</h3>
                    {editMode !== sp._id && (
                      <button style={{ ...btnSecondary, padding: "0.35rem 0.8rem" }} onClick={() => handleEditClick(sp)}>
                        <Edit3 size={14} /> Edit Assets
                      </button>
                    )}
                  </div>

                  {editMode === sp._id ? (
                    <form onSubmit={(e) => handleSaveBrand(sp._id, e)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Company Name</label>
                          <input required value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Website</label>
                          <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} style={inputStyle} placeholder="https://..." />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Company Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Logo URL</label>
                        <input value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))} style={inputStyle} placeholder="https://..." />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Contact Person</label>
                          <input value={form.contactInformation.contactPerson} onChange={e => setForm(p => ({ ...p, contactInformation: { ...p.contactInformation, contactPerson: e.target.value } }))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Email</label>
                          <input type="email" value={form.contactInformation.email} onChange={e => setForm(p => ({ ...p, contactInformation: { ...p.contactInformation, email: e.target.value } }))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "4px" }}>Phone</label>
                          <input value={form.contactInformation.phone} onChange={e => setForm(p => ({ ...p, contactInformation: { ...p.contactInformation, phone: e.target.value } }))} style={inputStyle} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <button type="submit" style={btnPrimary} disabled={saving}><Save size={15} />{saving ? "Saving…" : "Save Brand Details"}</button>
                        <button type="button" style={btnSecondary} onClick={() => setEditMode(null)}><X size={15} /> Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
                      <div>
                        {sp.logo ? (
                          <div style={{ padding: "0.5rem", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", display: "inline-block", marginBottom: "0.5rem" }}>
                            <img src={sp.logo} alt="Logo" style={{ maxHeight: "80px", maxWidth: "160px", objectFit: "contain" }} />
                          </div>
                        ) : (
                          <div style={{ padding: "1rem", background: "#f1f5f9", borderRadius: "8px", color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", marginBottom: "0.5rem" }}>No Logo Provided</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{sp.companyName}</div>
                        {sp.website && <a href={sp.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "#5f98b8", display: "flex", alignItems: "center", gap: "0.2rem" }}><LinkIcon size={12}/> Website</a>}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.9rem", color: "#475569", margin: "0 0 1rem", lineHeight: 1.6 }}>{sp.description || "No description provided."}</p>
                        {(sp.contactInformation?.contactPerson || sp.contactInformation?.email) && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b", background: "white", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>Primary Contact</div>
                            <div>{sp.contactInformation.contactPerson} {sp.contactInformation.email && `(${sp.contactInformation.email})`} {sp.contactInformation.phone}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── DELIVERABLES & PACKAGES ── */}
      {activeTab === "deliverables" && (
        <div>
          {sponsorships.length === 0 ? (
            <div style={{ ...card, textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
              <Target size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
              <p>No deliverables available.</p>
            </div>
          ) : (
            sponsorships.map(sp => {
              const asgn = assignments[sp._id];
              if (!asgn) {
                return (
                  <div key={sp._id} style={{ ...card, textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
                    <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "#334155" }}>{sp.event?.name}</h3>
                    <Target size={40} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
                    <p>No sponsorship package or deliverables have been assigned to you for this event yet.</p>
                  </div>
                );
              }
              
              const pkg = asgn.sponsorshipPackage;
              const pendingCount = asgn.deliverables?.filter(d => d.status !== 'COMPLETED').length || 0;

              return (
                <div key={sp._id} style={{ ...card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <div>
                      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.1rem" }}>{sp.event?.name}</h3>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#5f98b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Tag size={14} /> {pkg?.name || "Custom Package"}
                        </span>
                        {badge(`Payment: ${asgn.paymentStatus}`, asgn.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b')}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: pendingCount === 0 ? "#607f6c" : "#7AB2D3" }}>
                        {pendingCount}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Pending Deliverables</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "0.9rem", color: "#334155", marginBottom: "0.75rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>Required Deliverables</h4>
                  
                  {(!asgn.deliverables || asgn.deliverables.length === 0) ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No specific deliverables assigned.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {asgn.deliverables.map(d => (
                        <div key={d._id} style={{ padding: "1rem", borderRadius: "8px", border: "1px solid", borderColor: d.status === 'COMPLETED' ? "#10b98140" : "#e2e8f0", background: d.status === 'COMPLETED' ? "#f0fdf4" : "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "0.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {d.status === 'COMPLETED' ? <CheckCircle2 size={16} color="#10b981"/> : <Circle size={16} color="#94a3b8"/>}
                              {d.title}
                            </div>
                            {d.description && <div style={{ fontSize: "0.8rem", color: "#64748b", marginLeft: "1.5rem" }}>{d.description}</div>}
                            {d.dueDate && (
                              <div style={{ fontSize: "0.75rem", color: new Date(d.dueDate) < new Date() && d.status !== 'COMPLETED' ? "#ef4444" : "#64748b", marginLeft: "1.5rem", marginTop: "0.2rem" }}>
                                Due: {new Date(d.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div>
                            {d.status !== 'COMPLETED' ? (
                              <button style={btnAction} onClick={() => handleUpdateDeliverable(asgn._id, asgn.deliverables, d._id, 'COMPLETED')}>
                                <CheckCircle2 size={14} /> Mark Provided
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                <CheckCircle2 size={14} /> Provided
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pkg?.benefits?.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <h4 style={{ fontSize: "0.9rem", color: "#334155", marginBottom: "0.5rem" }}>Package Benefits Included</h4>
                      <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#475569", fontSize: "0.85rem", lineHeight: 1.6 }}>
                        {pkg.benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SponsorDashboard;
