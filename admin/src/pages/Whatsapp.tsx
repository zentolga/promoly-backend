
import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const Whatsapp: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Fetch Health / Status
    useEffect(() => {
        fetch(`${API_BASE}/whatsapp/health`)
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(err => console.error('Error fetching WA status:', err));
    }, []);

    const handleSendCampaign = async () => {
        if (!confirm('Möchten Sie den aktuellen Prospekt an alle angemeldeten Kunden senden?')) return;

        setSending(true);
        setResult(null);

        // Fetch active campaign first or let backend handle it
        // We need a campaign ID. For now, let's fetch the Published one.
        // Simplified: The backend send-campaign endpoint usually takes an ID. 
        // We'll fetch campaigns first to get the active one ID. 
        // Or simpler: We just hardcode a known test flow, but proper way is to pick one.
        // Let's assume we send the "Current Active" one.

        try {
            // Get Campaigns
            const cRes = await fetch(`${API_BASE}/campaigns`);
            const campaigns = await cRes.json();
            const active = campaigns.find((c: any) => c.status === 'PUBLISHED');

            if (!active) {
                alert('Keine aktive Kampagne gefunden!');
                setSending(false);
                return;
            }

            const res = await fetch(`${API_BASE}/whatsapp/send-campaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: active.id, mode: 'digest' })
            });
            const data = await res.json();
            if (data.success) {
                setResult(`Erfolg! Nachricht an ${data.recipients} Empfänger gesendet.`);
            } else {
                setResult('Fehler beim Senden.');
            }
        } catch (e) {
            console.error(e);
            setResult('Ein Fehler ist aufgetreten.');
        }
        setSending(false);
    };

    return (
        <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>
            <h1>WhatsApp Bot Steuerung</h1>
            <p style={{ color: '#666' }}>Hier können Sie den WhatsApp Bot verwalten und Nachrichten senden.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 }}>
                {/* Status Card */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3>Status</h3>
                    <div style={{ marginTop: 10 }}>
                        {status ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: status.status === 'configured' || status.status === 'active' ? '#4caf50' : '#f44336' }}></div>
                                    <span style={{ fontWeight: 'bold' }}>{status.status === 'active' ? 'Aktiv (WasenderAPI)' : status.status}</span>
                                </div>
                                <div style={{ fontSize: 13, color: '#888' }}>
                                    Provider: {status.provider || '-'}<br />
                                </div>
                            </div>
                        ) : 'Lade Status...'}
                    </div>
                </div>

                {/* Actions Card */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3>Aktionen</h3>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Senden Sie den aktuellen Prospekt an alle Benutzer, die sich mit "Start" angemeldet haben.</p>

                    <button
                        onClick={handleSendCampaign}
                        disabled={sending}
                        style={{
                            background: sending ? '#ccc' : '#25D366',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: 6,
                            fontWeight: 'bold',
                            cursor: sending ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}>
                        {sending ? 'Sende...' : '📢 Newsletter Senden'}
                    </button>

                    {result && <div style={{ marginTop: 15, color: result.includes('Erfolg') ? 'green' : 'red', fontWeight: 'bold' }}>{result}</div>}
                </div>
            </div>

            {/* Test Section */}
            <div style={{ marginTop: 40, padding: 20, border: '1px dashed #ccc', borderRadius: 8 }}>
                <h3>🧪 Test-Bereich</h3>
                <p style={{ fontSize: 13, color: '#666' }}>Testen Sie die Verbindung mit Ihrer eigenen Nummer.</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                    <input type="text" placeholder="Ihre Nummer (+49...)" id="testPhone" style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd', width: 200 }} defaultValue="4917661009362" />
                    <button onClick={async () => {
                        const phoneInput = document.getElementById('testPhone') as HTMLInputElement;
                        const phone = phoneInput.value;
                        if (!phone) return alert('Bitte Nummer eingeben');

                        try {
                            const res = await fetch(`${API_BASE}/whatsapp/request-optin`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone })
                            });
                            const data = await res.json();
                            console.log('Test result:', data);

                            if (data.success) {
                                alert('✅ Nachricht erfolgreich gesendet! Bitte WhatsApp prüfen.');
                            } else {
                                alert(`❌ Fehler: ${data.message || 'Unbekannter Fehler'}`);
                            }
                        } catch (e) {
                            console.error(e);
                            alert('❌ Netzwerk- oder Serverfehler beim Senden.');
                        }
                    }} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
                        Test-Nachricht senden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Whatsapp;
