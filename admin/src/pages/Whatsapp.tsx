
import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';

const Whatsapp: React.FC = () => {
    const [status, setStatus] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Fetch Health / Status & Campaigns
    useEffect(() => {
        // Status
        fetch(`${API_BASE}/whatsapp/health`)
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(err => console.error('Error fetching WA status:', err));

        // Campaigns
        fetch(`${API_BASE}/campaigns`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCampaigns(data);
                    // Select first published or created one by default
                    const def = data.find((c: any) => c.status === 'PUBLISHED') || data[0];
                    if (def) setSelectedCampaignId(def.id);
                }
            })
            .catch(err => console.error('Error fetching campaigns:', err));
    }, []);

    const handleGeneratePdf = async () => {
        if (!selectedCampaignId) return;
        setGenerating(true);
        setResult('Generiere PDF... Bitte warten (kann bis zu 30s dauern)...');
        try {
            const res = await fetch(`${API_BASE}/flyers/${selectedCampaignId}/generate-pdf`, { method: 'POST' });
            if (res.ok) {
                setResult('✅ PDF erfolgreich neu generiert!');
            } else {
                setResult('❌ Fehler beim Generieren des PDFs.');
            }
        } catch (e) {
            console.error(e);
            setResult('❌ Netzwerkfehler beim PDF-Generieren.');
        }
        setGenerating(false);
    };

    const handleSendCampaign = async () => {
        if (!selectedCampaignId) return alert('Bitte zuerst eine Kampagne auswählen.');
        if (!confirm('Möchten Sie diesen Prospekt wirklich an alle Kunden senden?')) return;

        setSending(true);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE}/whatsapp/send-campaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: selectedCampaignId, mode: 'digest' })
            });
            const data = await res.json();
            if (data.success) {
                setResult(`✅ Erfolg! Nachricht an ${data.recipients} Empfänger gesendet.`);
            } else {
                setResult('❌ Fehler beim Senden.');
            }
        } catch (e) {
            console.error(e);
            setResult('❌ Ein Fehler ist aufgetreten.');
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
                    <h3>Newsletter Senden</h3>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Wählen Sie eine Kampagne und senden Sie sie an Ihre Abonnenten.</p>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Kampagne wählen:</label>
                        <select
                            value={selectedCampaignId}
                            onChange={(e) => setSelectedCampaignId(e.target.value)}
                            style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
                        >
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.year} KW{c.week} - {c.title_de} ({c.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={handleGeneratePdf}
                            disabled={generating || sending || !selectedCampaignId}
                            style={{
                                background: '#2196F3',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: 6,
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                opacity: (generating || !selectedCampaignId) ? 0.7 : 1
                            }}>
                            {generating ? 'Generiere...' : '🔄 PDF Prüfen / Neu Bauen'}
                        </button>

                        <button
                            onClick={handleSendCampaign}
                            disabled={sending || generating || !selectedCampaignId}
                            style={{
                                background: sending ? '#ccc' : '#25D366',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: 6,
                                fontWeight: 'bold',
                                cursor: sending ? 'not-allowed' : 'pointer',
                                flex: 1
                            }}>
                            {sending ? 'Sende...' : '📢 Senden'}
                        </button>
                    </div>

                    {result && <div style={{ marginTop: 15, padding: 10, borderRadius: 4, background: '#f5f5f5', borderLeft: result.includes('Fehler') ? '4px solid red' : '4px solid green', fontWeight: 'bold' }}>{result}</div>}
                </div>
            </div>

            {/* Test Section */}
            <div style={{ marginTop: 40, padding: 20, border: '1px dashed #ccc', borderRadius: 8 }}>
                <h3>🧪 Test-Bereich (Einzelnummer)</h3>
                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                    <input type="text" placeholder="Ihre Nummer (+49...)" id="testPhone" style={{ padding: 10, borderRadius: 4, border: '1px solid #ddd', width: 200 }} defaultValue="49176" />
                    <button onClick={async () => {
                        const phoneInput = document.getElementById('testPhone') as HTMLInputElement;
                        const phone = phoneInput.value;
                        if (!phone) return alert('Bitte Nummer eingeben');

                        try {
                            // We use the opt-in endpoint as a simple "ping" or we can implement a specific test message
                            const res = await fetch(`${API_BASE}/whatsapp/request-optin`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phone })
                            });
                            const data = await res.json();
                            if (data.success) alert('✅ Nachricht gesendet!');
                            else alert(`❌ Fehler: ${data.message}`);
                        } catch (e) {
                            alert('❌ Netzwerkfehler');
                        }
                    }} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer' }}>
                        Ping Senden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Whatsapp;
