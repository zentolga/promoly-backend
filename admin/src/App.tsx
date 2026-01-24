import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useParams } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { api, API_BASE } from './api';
import Whatsapp from './pages/Whatsapp';

// Themes based on real German supermarket flyer designs
// Themes based on real German supermarket flyer designs
const THEMES = {
    kaufland_red: {
        id: 'kaufland_red',
        name: 'Kaufland Rot',
        label: 'Kaufland Rot',
        background: 'linear-gradient(135deg, #c62828 0%, #e53935 50%, #d32f2f 100%)',
        bg: '#f9f9f9',
        primary: '#c62828',
        headerBg: 'rgba(0,0,0,0.3)',
        accent: '#c62828',
        priceTagBg: '#d32f2f',
        priceTagText: '#fff',
        badgeBg: '#ffd600',
        badgeText: '#000',
        cardBg: '#fff',
        cardBorder: 'none',
        priceShape: 'price-tag-starburst',
        cardTexture: 'radial-gradient(circle at top left, #fff, #f5f5f5)',
        slogans: ['KNÜLLER', 'AKTION', 'TOP PREIS', 'BILLIGER'],
        font: 'Inter, sans-serif'
    },
    lidl_yellow: {
        id: 'lidl_yellow',
        name: 'Lidl Gelb',
        label: 'Lidl Gelb',
        background: 'linear-gradient(135deg, #0050aa 0%, #0076c0 100%)',
        bg: '#f0f4f8',
        primary: '#0050aa',
        headerBg: 'rgba(255,240,0,0.9)',
        accent: '#fff000',
        priceTagBg: '#fff000',
        priceTagText: '#0050aa',
        badgeBg: '#e60000',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: '3px solid #0050aa',
        priceShape: 'price-tag-jagged',
        cardTexture: 'linear-gradient(to bottom, #fff 80%, #fff000 100%)',
        slogans: ['SUPER', 'XXL', 'NUR DIESE WOCHE', 'FRISCHE'],
        font: 'Roboto, sans-serif'
    },
    aldi_white: {
        id: 'aldi_white',
        name: 'Aldi Weiß',
        label: 'Aldi Weiß',
        background: 'linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%)',
        bg: '#f0f0f0',
        primary: '#003399',
        headerBg: '#003399',
        accent: '#003399',
        priceTagBg: '#ff6600',
        priceTagText: '#fff',
        badgeBg: '#003399',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: '1px solid #ddd',
        priceShape: 'round',
        cardTexture: 'none',
        slogans: ['ALDI PREIS', 'GENUSS', 'BIO', 'AKTION'],
        font: 'sans-serif'
    },
    netto_yellow: {
        id: 'netto_yellow',
        name: 'Netto Gelb',
        label: 'Netto Gelb',
        background: 'linear-gradient(135deg, #ffe700 0%, #ffcc00 100%)',
        bg: '#fffee0',
        primary: '#ffe700',
        headerBg: '#000',
        accent: '#000',
        priceTagBg: '#d50000',
        priceTagText: '#fff',
        badgeBg: '#000',
        badgeText: '#ffe700',
        cardBg: '#fff',
        cardBorder: '2px solid #000',
        priceShape: 'price-tag-starburst',
        cardTexture: 'repeating-linear-gradient(45deg, #fff, #fff 10px, #fffee0 10px, #fffee0 20px)',
        slogans: ['DANN GEH DOCH', 'MARKEN', 'DISCOUNT', 'SPAREN'],
        font: 'Arial Black, sans-serif'
    },
    impact_red: {
        id: 'impact_red',
        name: 'Impact Red',
        label: 'Impact Red',
        background: 'linear-gradient(135deg, #d3122a 0%, #b71c1c 100%)',
        bg: '#fff',
        primary: '#d3122a',
        headerBg: '#d3122a',
        accent: '#d3122a',
        priceTagBg: '#d3122a',
        priceTagText: '#fff',
        badgeBg: '#ffcc00',
        badgeText: '#000',
        cardBg: 'transparent',
        cardBorder: 'none',
        priceShape: '',
        cardTexture: 'none',
        slogans: ['RICHTIG FRISCH', 'KNÜLLER', 'TOP PREIS'],
        font: 'Inter, sans-serif'
    },
    rewe_red: {
        id: 'rewe_red',
        name: 'Rewe Rot',
        label: 'Rewe Rot',
        background: 'linear-gradient(135deg, #cc0a1f 0%, #a60819 100%)',
        bg: '#fff',
        primary: '#cc0a1f',
        headerBg: '#cc0a1f',
        accent: '#cc0a1f',
        priceTagBg: '#cc0a1f',
        priceTagText: '#fff',
        badgeBg: '#ffd600',
        badgeText: '#000',
        cardBg: '#fff',
        cardBorder: 'none',
        priceShape: 'round',
        cardTexture: 'none',
        slogans: ['BESTE WAHL', 'QUALITÄT', 'FRISCH', 'REGIONAL'],
        font: 'Arial, sans-serif'
    },
    penny_red: {
        id: 'penny_red',
        name: 'Penny Rot',
        label: 'Penny Rot',
        background: 'linear-gradient(135deg, #e31e24 0%, #c4161b 100%)',
        bg: '#ffe0e0',
        primary: '#e31e24',
        headerBg: '#e31e24',
        accent: '#ffcc00',
        priceTagBg: '#ffcc00',
        priceTagText: '#e31e24',
        badgeBg: '#e31e24',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: '2px solid #e31e24',
        priceShape: 'price-tag-starburst',
        cardTexture: 'linear-gradient(to bottom, #fff, #fff5f5)',
        slogans: ['PREISKRACHER', 'MEGA DEAL', 'HAMMER PREIS'],
        font: 'Impact, sans-serif'
    },
    edeka_yellow: {
        id: 'edeka_yellow',
        name: 'Edeka Gelb',
        label: 'Edeka Gelb',
        background: 'linear-gradient(135deg, #004f9f 0%, #003d7a 100%)',
        bg: '#fffbe0',
        primary: '#004f9f',
        headerBg: '#ffed00',
        accent: '#ffed00',
        priceTagBg: '#ffed00',
        priceTagText: '#004f9f',
        badgeBg: '#004f9f',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: '2px solid #004f9f',
        priceShape: 'price-tag-jagged',
        cardTexture: 'linear-gradient(to bottom, #fff, #fffbe0)',
        slogans: ['WIR LIEBEN LEBENSMITTEL', 'GENUSS', 'TOP'],
        font: 'Verdana, sans-serif'
    },
    real_blue: {
        id: 'real_blue',
        name: 'Real Blau',
        label: 'Real Blau',
        background: 'linear-gradient(135deg, #003a70 0%, #00264d 100%)',
        bg: '#e8f4fc',
        primary: '#003a70',
        headerBg: '#003a70',
        accent: '#e31e24',
        priceTagBg: '#e31e24',
        priceTagText: '#fff',
        badgeBg: '#003a70',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: '1px solid #003a70',
        priceShape: 'round',
        cardTexture: 'none',
        slogans: ['EINMAL HIN', 'ALLES DRIN', 'GÜNSTIG'],
        font: 'Tahoma, sans-serif'
    },
    rossmann_green: {
        id: 'rossmann_green',
        name: 'Rossmann Grün',
        label: 'Rossmann Grün',
        background: 'linear-gradient(135deg, #009639 0%, #006b29 100%)',
        bg: '#e8f5e9',
        primary: '#009639',
        headerBg: '#009639',
        accent: '#e31e24',
        priceTagBg: '#e31e24',
        priceTagText: '#fff',
        badgeBg: '#009639',
        badgeText: '#fff',
        cardBg: '#fff',
        cardBorder: 'none',
        priceShape: 'round',
        cardTexture: 'linear-gradient(to bottom, #fff, #e8f5e9)',
        slogans: ['MEIN DROGERIEMARKT', 'GÜNSTIG', 'BEAUTY'],
        font: 'Helvetica, sans-serif'
    },
};


// Login Page
function Login({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/login', { password });
            onLogin();
        } catch {
            setError('Ungültiges Passwort');
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1 className="login-title">🛒 Promoly Admin</h1>
                <div className="form-group">
                    <label className="form-label">Passwort</label>
                    <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort eingeben" />
                </div>
                {error && <p style={{ color: '#e53935', marginBottom: 16 }}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Anmelden</button>
            </form>
        </div>
    );
}

// Sidebar
function Sidebar() {
    const location = useLocation();
    const navItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/kategorien', icon: '📁', label: 'Kategorien' },
        { path: '/produkte', icon: '📦', label: 'Produkte' },
        { path: '/kampagnen', icon: '📢', label: 'Kampagnen' },
        { path: '/kunden', icon: '👥', label: 'Kunden' },
        { path: '/whatsapp', icon: '💬', label: 'WhatsApp' },
        { path: '/einstellungen', icon: '⚙️', label: 'Einstellungen' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header"><h1>🛒 Promoly</h1></div>
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path} className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}>
                        <span>{item.icon}</span><span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}

// Dashboard
function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    useEffect(() => { api.get('/stats/summary').then(setStats); }, []);

    return (
        <div className="main">
            <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
            {stats && (
                <>
                    <div className="stats-grid">
                        <Link to="/kategorien" className="stat-card"><div className="stat-value">{stats.categoriesCount}</div><div className="stat-label">Kategorien</div></Link>
                        <Link to="/produkte" className="stat-card"><div className="stat-value">{stats.productsCount}</div><div className="stat-label">Produkte</div></Link>
                        <Link to="/kampagnen" className="stat-card"><div className="stat-value">{stats.campaignsCount}</div><div className="stat-label">Kampagnen</div></Link>
                        <Link to="/kunden" className="stat-card"><div className="stat-value">{stats.customersCount}</div><div className="stat-label">Kunden</div></Link>
                    </div>
                    {stats.activeCampaign && (
                        <div className="card" style={{ marginTop: 24 }}>
                            <h3>🔥 Aktive Kampagne</h3>
                            <p style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{stats.activeCampaign.title_de}</p>
                            <p style={{ color: '#666' }}>{new Date(stats.activeCampaign.dateFrom).toLocaleDateString('de-DE')} - {new Date(stats.activeCampaign.dateTo).toLocaleDateString('de-DE')}</p>
                            <p style={{ marginTop: 8 }}>{stats.activeCampaign.itemsCount} Artikel</p>
                            <Link to={`/kampagnen/${stats.activeCampaign.id}`} className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Editor öffnen</Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Image Upload Component
function ImageUpload({ value, onChange, folder = 'images' }: { value?: string; onChange: (path: string) => void; folder?: string }) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE}/files/upload/${folder}`, { method: 'POST', body: formData });
            const data = await res.json();
            onChange(data.filePath);
        } catch (err) {
            console.error('Upload failed:', err);
        }
        setUploading(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {value && <img src={`${API_BASE}/files/${value}`} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />}
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                {uploading ? 'Hochladen...' : value ? 'Bild ändern' : '📷 Bild hochladen'}
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
        </div>
    );
}

// Categories CRUD
function Kategorien() {
    const [items, setItems] = useState<any[]>([]);
    const [form, setForm] = useState({ name_de: '', sortOrder: 0 });
    const [editId, setEditId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const load = () => api.get('/categories').then(setItems);
    useEffect(() => { load(); }, []);

    const save = async () => {
        if (editId) await api.put(`/categories/${editId}`, form);
        else await api.post('/categories', form);
        setForm({ name_de: '', sortOrder: 0 }); setEditId(null); setShowForm(false); load();
    };

    const startEdit = (c: any) => { setForm({ name_de: c.name_de, sortOrder: c.sortOrder }); setEditId(c.id); setShowForm(true); };

    return (
        <div className="main">
            <div className="page-header">
                <h1 className="page-title">Kategorien</h1>
                <button className="btn btn-primary" onClick={() => { setForm({ name_de: '', sortOrder: 0 }); setEditId(null); setShowForm(true); }}>+ Neue Kategorie</button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>{editId ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, marginTop: 16 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Name</label>
                            <input className="input" placeholder="z.B. Obst & Gemüse" value={form.name_de} onChange={e => setForm({ ...form, name_de: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ margin: 0, width: 100 }}>
                            <label className="form-label">Sortierung</label>
                            <input className="input" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <button className="btn btn-primary" onClick={save}>Speichern</button>
                            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Abbrechen</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <table className="table">
                    <thead><tr><th>Name</th><th>Sortierung</th><th>Produkte</th><th style={{ width: 150 }}>Aktionen</th></tr></thead>
                    <tbody>
                        {items.map(c => (
                            <tr key={c.id}>
                                <td><strong>{c.name_de}</strong></td>
                                <td>{c.sortOrder}</td>
                                <td><span className="badge badge-success">{c._count?.products || 0} Produkte</span></td>
                                <td>
                                    <button className="btn btn-secondary" onClick={() => startEdit(c)}>✏️ Bearbeiten</button>
                                    <button className="btn btn-secondary" onClick={async () => { if (confirm('Kategorie löschen?')) { await api.delete(`/categories/${c.id}`); load(); } }} style={{ marginLeft: 8 }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Products CRUD with Image Upload
function Produkte() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [form, setForm] = useState({ name_de: '', brand: '', unitText: 'Stück', categoryId: '', imagePath: '' });
    const [editId, setEditId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const load = () => { api.get('/products').then(setItems); api.get('/categories').then(setCategories); };
    useEffect(() => { load(); }, []);

    const save = async () => {
        const data = { ...form, categoryId: form.categoryId || undefined };
        if (editId) await api.put(`/products/${editId}`, data);
        else await api.post('/products', data);
        setForm({ name_de: '', brand: '', unitText: 'Stück', categoryId: '', imagePath: '' });
        setEditId(null); setShowForm(false); load();
    };

    const startEdit = (p: any) => {
        setForm({ name_de: p.name_de, brand: p.brand || '', unitText: p.unitText, categoryId: p.categoryId || '', imagePath: p.imagePath || '' });
        setEditId(p.id); setShowForm(true);
    };

    const filtered = items.filter(p => p.name_de.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="main">
            <div className="page-header">
                <h1 className="page-title">Produkte</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input className="input" placeholder="🔍 Suchen..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
                    <button className="btn btn-primary" onClick={() => { setForm({ name_de: '', brand: '', unitText: 'Stück', categoryId: '', imagePath: '' }); setEditId(null); setShowForm(true); }}>+ Neues Produkt</button>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>{editId ? 'Produkt bearbeiten' : 'Neues Produkt'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                        <div className="form-group"><label className="form-label">Produktname *</label><input className="input" placeholder="z.B. Bio-Äpfel" value={form.name_de} onChange={e => setForm({ ...form, name_de: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Marke</label><input className="input" placeholder="z.B. Naturland" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Einheit</label><input className="input" placeholder="z.B. 1 kg, 500 g, 6 Stück" value={form.unitText} onChange={e => setForm({ ...form, unitText: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Kategorie</label>
                            <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                <option value="">-- Keine Kategorie --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name_de}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Produktbild</label>
                            <ImageUpload value={form.imagePath} onChange={(path) => setForm({ ...form, imagePath: path })} />
                        </div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={save}>Speichern</button>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Abbrechen</button>
                    </div>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {filtered.map(p => (
                        <div key={p.id} style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, display: 'flex', gap: 16 }}>
                            <div style={{ width: 80, height: 80, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {p.imagePath ? <img src={`${API_BASE}/files/${p.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>📦</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{p.name_de}</div>
                                {p.brand && <div style={{ color: '#666', fontSize: 13 }}>{p.brand}</div>}
                                <div style={{ color: '#888', fontSize: 12 }}>{p.unitText}</div>
                                <div style={{ marginTop: 4 }}><span className="badge badge-warning">{p.category?.name_de || 'Ohne Kategorie'}</span></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <button className="btn btn-secondary" onClick={() => startEdit(p)} style={{ padding: '6px 12px' }}>✏️</button>
                                <button className="btn btn-secondary" onClick={async () => { if (confirm('Produkt löschen?')) { await api.delete(`/products/${p.id}`); load(); } }} style={{ padding: '6px 12px' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Campaigns List with Preview
function Kampagnen() {
    const [items, setItems] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title_de: '', heroTitle_de: '', dateFrom: '', dateTo: '', themeId: 'kaufland_orange' });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);

    const load = () => api.get('/campaigns').then(setItems);
    useEffect(() => { load(); }, []);

    const create = async () => {
        await api.post('/campaigns', form);
        setForm({ title_de: '', heroTitle_de: '', dateFrom: '', dateTo: '', themeId: 'kaufland_orange' });
        setShowForm(false); load();
    };

    const publish = async (id: string) => { await api.post(`/campaigns/${id}/publish`); load(); };
    const archive = async (id: string) => { await api.post(`/campaigns/${id}/archive`); load(); };

    const copyCampaign = async (id: string) => {
        const source = await api.get(`/campaigns/${id}`);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const newCampaign = await api.post('/campaigns', {
            title_de: `${source.title_de} (Kopie)`,
            heroTitle_de: source.heroTitle_de,
            themeId: source.themeId,
            dateFrom: today.toISOString().split('T')[0],
            dateTo: nextWeek.toISOString().split('T')[0],
        });
        // Copy items
        for (const item of source.items) {
            await api.post(`/campaigns/${newCampaign.id}/items`, {
                productId: item.productId,
                oldPrice: item.oldPrice,
                newPrice: item.newPrice,
                badgeText: item.badgeText,
                labelText: item.labelText,
                limitText: item.limitText,
                posX: item.posX,
                posY: item.posY,
                width: item.width,
                height: item.height,
            });
        }
        load();
        alert('Kampagne kopiert!');
    };

    const togglePreview = async (id: string) => {
        if (expandedId === id) { setExpandedId(null); setPreviewData(null); return; }
        setExpandedId(id);
        const data = await api.get(`/campaigns/${id}`);
        setPreviewData(data);
    };

    return (
        <div className="main">
            <div className="page-header">
                <h1 className="page-title">Kampagnen</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Neue Kampagne</button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Neue Kampagne erstellen</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Titel</label><input className="input" placeholder="z.B. Wochenangebote KW 3" value={form.title_de} onChange={e => setForm({ ...form, title_de: e.target.value })} /></div>
                        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Hero-Titel</label><input className="input" placeholder="z.B. RICHTIG FRISCH" value={form.heroTitle_de} onChange={e => setForm({ ...form, heroTitle_de: e.target.value })} /></div>
                        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Von</label><input className="input" type="date" value={form.dateFrom} onChange={e => setForm({ ...form, dateFrom: e.target.value })} /></div>
                        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Bis</label><input className="input" type="date" value={form.dateTo} onChange={e => setForm({ ...form, dateTo: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={create}>Erstellen</button>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Abbrechen</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {items.map(c => (
                    <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Theme color indicator */}
                            <div style={{ width: 8, height: 60, borderRadius: 4, background: THEMES[c.themeId as keyof typeof THEMES]?.background || THEMES.kaufland_red.background }} />

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <strong style={{ fontSize: 18 }}>{c.title_de}</strong>
                                    <span className={`badge ${c.status === 'PUBLISHED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-error'}`}>
                                        {c.status === 'PUBLISHED' ? '🟢 Live' : c.status === 'DRAFT' ? '📝 Entwurf' : '📦 Archiv'}
                                    </span>
                                </div>
                                <div style={{ color: '#666', marginTop: 4 }}>
                                    📅 {new Date(c.dateFrom).toLocaleDateString('de-DE')} - {new Date(c.dateTo).toLocaleDateString('de-DE')}
                                    <span style={{ marginLeft: 16 }}>📦 {c._count?.items || 0} Artikel</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-secondary" onClick={() => togglePreview(c.id)}>{expandedId === c.id ? '▲ Schließen' : '▼ Vorschau'}</button>
                                <button className="btn btn-secondary" onClick={() => copyCampaign(c.id)} title="Kampagne kopieren">📋 Kopieren</button>
                                <Link to={`/kampagnen/${c.id}`} className="btn btn-primary">🎨 Editor</Link>
                                {c.status === 'DRAFT' && <button className="btn btn-success" onClick={() => publish(c.id)}>Veröffentlichen</button>}
                                {c.status === 'PUBLISHED' && <button className="btn btn-secondary" onClick={() => archive(c.id)}>Archivieren</button>}
                            </div>
                        </div>

                        {/* Preview Panel */}
                        {expandedId === c.id && previewData && (
                            <div style={{ background: '#f9f9f9', padding: 16, borderTop: '1px solid #eee' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {previewData.items?.length > 0 ? previewData.items.map((item: any) => (
                                        <div key={item.id} style={{ width: 140, background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            <div style={{ width: 50, height: 50, margin: '0 auto', background: '#f0f0f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {item.product.imagePath ? <img src={`${API_BASE}/files/${item.product.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📦</span>}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 8 }}>{item.product.name_de}</div>
                                            <div style={{ textAlign: 'center', marginTop: 4 }}>
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 11 }}>{item.oldPrice.toFixed(2)}€</span>
                                                <span style={{ color: '#e53935', fontWeight: 'bold', marginLeft: 4 }}>{item.newPrice.toFixed(2)}€</span>
                                            </div>
                                        </div>
                                    )) : <p style={{ color: '#999' }}>Keine Artikel in dieser Kampagne</p>}
                                </div>
                                {previewData.flyerAssets?.length > 0 && (
                                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
                                        <strong>Exportierte Dateien:</strong>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            {previewData.flyerAssets.map((a: any) => (
                                                <a key={a.id} href={`${API_BASE}/files/${a.filePath}`} target="_blank" className="btn btn-secondary" style={{ fontSize: 12 }}>
                                                    {a.type === 'BESTOF_PDF' ? '📄 PDF' : a.type === 'BESTOF_POST_PNG' ? '📱 Post' : '📱 Story'}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Customers
function Kunden() {
    const [items, setItems] = useState<any[]>([]);
    const load = () => api.get('/customers').then(setItems);
    useEffect(() => { load(); }, []);

    const toggleOptIn = async (id: string, optedIn: boolean) => { await api.put(`/customers/${id}`, { optedIn: !optedIn }); load(); };

    return (
        <div className="main">
            <div className="page-header"><h1 className="page-title">Kunden ({items.length})</h1></div>
            <div className="card">
                <table className="table">
                    <thead><tr><th>Telefon</th><th>Name</th><th>Registriert</th><th>Status</th></tr></thead>
                    <tbody>
                        {items.map(c => (
                            <tr key={c.id}>
                                <td><strong>{c.phoneE164}</strong></td>
                                <td>{c.name || '-'}</td>
                                <td>{new Date(c.createdAt).toLocaleDateString('de-DE')}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <button className={`btn ${c.optedIn ? 'btn-success' : 'btn-secondary'}`} onClick={() => toggleOptIn(c.id, c.optedIn)}>
                                        {c.optedIn ? '✅ Aktiv' : '❌ Abgemeldet'}
                                    </button>
                                    {!c.optedIn && (
                                        <button className="btn btn-primary" onClick={async () => {
                                            if (confirm(`Opt-In Anfrage an ${c.phoneE164} senden?`)) {
                                                await api.post('/whatsapp/request-optin', { phone: c.phoneE164 });
                                                alert('Anfrage gesendet!');
                                            }
                                        }}>
                                            📩 Anfrage senden
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Settings
function Einstellungen() {
    const [form, setForm] = useState<any>({});
    useEffect(() => { api.get('/store-profile').then(setForm); }, []);
    const save = async () => { await api.put('/store-profile', form); alert('Gespeichert!'); };

    return (
        <div className="main">
            <div className="page-header"><h1 className="page-title">Einstellungen</h1></div>
            <div className="card">
                <h3>Geschäftsdaten</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <div className="form-group"><label className="form-label">Geschäftsname</label><input className="input" value={form.storeName || ''} onChange={e => setForm({ ...form, storeName: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Telefon</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Adresse</label><input className="input" value={form.addressLine1 || ''} onChange={e => setForm({ ...form, addressLine1: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">PLZ</label><input className="input" value={form.postalCode || ''} onChange={e => setForm({ ...form, postalCode: e.target.value })} /></div>
                        <div className="form-group" style={{ flex: 2 }}><label className="form-label">Stadt</label><input className="input" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Öffnungszeiten</label><textarea className="input" rows={4} value={form.openingHours_de || ''} onChange={e => setForm({ ...form, openingHours_de: e.target.value })} /></div>
                    <div className="form-group">
                        <label className="form-label">Logo</label>
                        <ImageUpload value={form.logoPath} onChange={(path) => setForm({ ...form, logoPath: path })} folder="logos" />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={save} style={{ marginTop: 16 }}>Speichern</button>
            </div>
        </div>
    );
}

// WhatsApp Settings
function WhatsAppSettings() {
    const [health, setHealth] = useState<any>(null);
    const [broadcasting, setBroadcasting] = useState(false);
    useEffect(() => { api.get('/whatsapp/health').then(setHealth); }, []);

    const sendBroadcast = async () => {
        setBroadcasting(true);
        try {
            const result = await api.post('/broadcast/bestof');
            alert(`Broadcast gesendet: ${result.sent}/${result.total} Nachrichten`);
        } catch (e) {
            alert('Fehler beim Senden');
        }
        setBroadcasting(false);
    };

    return (
        <div className="main">
            <div className="page-header"><h1 className="page-title">WhatsApp</h1></div>
            <div className="card">
                <h3>Status</h3>
                {health && (
                    <div style={{ marginTop: 16 }}>
                        <p><strong>Status:</strong> <span className={`badge ${health.status === 'configured' ? 'badge-success' : 'badge-warning'}`}>{health.status}</span></p>
                        <p><strong>Phone ID:</strong> {health.phoneNumberId || 'Nicht konfiguriert'}</p>
                        <p><strong>Template:</strong> {health.templateName}</p>
                    </div>
                )}
            </div>
            <div className="card">
                <h3>Broadcast</h3>
                <p style={{ color: '#666', marginTop: 8 }}>Sende aktuelle Angebote an alle angemeldeten Kunden.</p>
                <button className="btn btn-success" onClick={sendBroadcast} disabled={broadcasting} style={{ marginTop: 16 }}>
                    {broadcasting ? 'Sende...' : '📤 Best-of Broadcast senden'}
                </button>
            </div>
        </div>
    );
}

// Flyer Editor with Drag & Drop
function FlyerEditor() {
    const { id: campaignId } = useParams();
    const [campaign, setCampaign] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [store, setStore] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [exporting, setExporting] = useState('');
    const [pageCount, setPageCount] = useState(1);
    const [backgrounds, setBackgrounds] = useState<string[]>([]);
    // const [backgrounds, setBackgrounds] = useState<string[]>([]); // Removed duplicate
    const [scale, setScale] = useState(0.6); // Default zoom mostly out to see page
    const [isDragging, setIsDragging] = useState(false);

    const [layoutMode, setLayoutMode] = useState<'3x3' | '4x4'>('3x3');
    const [showOverflow, setShowOverflow] = useState(false);

    // Use global THEMES from top of file - just reference them
    const theme = THEMES[campaign?.themeId as keyof typeof THEMES] || THEMES.kaufland_red;



    useEffect(() => {
        if (campaignId) {
            api.get(`/campaigns/${campaignId}`).then(setCampaign);
            api.get('/products').then(setProducts);
            api.get('/store-profile').then(setStore);
            api.get('/flyers/backgrounds/list').then((res: any) => setBackgrounds(res.data)).catch(() => setBackgrounds([]));
        }
    }, [campaignId]);

    useEffect(() => {
        if (campaign?.flyerJson?.layoutMode) {
            setLayoutMode(campaign.flyerJson.layoutMode);
        }
    }, [campaign?.flyerJson]);

    // Flyer Header Component - Dynamic for ALL themes
    const FlyerHeader = () => {
        // Theme-specific background images
        const themeBackgrounds: Record<string, string> = {
            impact_red: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            kaufland_red: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            lidl_yellow: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            aldi_white: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            netto_yellow: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            rewe_red: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            penny_red: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            edeka_yellow: 'https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            real_blue: 'https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
            rossmann_green: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        };

        const headerBgImage = themeBackgrounds[theme.id] || themeBackgrounds.impact_red;
        const dateFrom = campaign.dateFrom ? new Date(campaign.dateFrom).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '18.01.2026';
        const dateTo = campaign.dateTo ? new Date(campaign.dateTo).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : '24.01.2026';

        return (
            <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                {/* Date Strip */}
                <div style={{
                    background: theme.primary,
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '6px 0',
                    fontSize: 13,
                    letterSpacing: 1,
                    zIndex: 10,
                    position: 'relative'
                }}>
                    VON {dateFrom.toUpperCase()} BIS {dateTo.toUpperCase()}
                </div>

                {/* Main Header with Background */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px 40px',
                    backgroundImage: `url('${headerBgImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    height: 170
                }}>
                    {/* Dark Overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 0 }}></div>

                    {/* Logo */}
                    <div style={{
                        zIndex: 1,
                        position: 'relative',
                        background: '#222',
                        padding: 10,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                        transform: 'rotate(-2deg)'
                    }}>
                        <img src={store?.logoPath ? `${API_BASE}/files/${store.logoPath}` : "/logo.png"} alt="Logo" style={{ maxHeight: 100 }} />
                    </div>

                    {/* Slogan */}
                    <div style={{
                        zIndex: 1,
                        position: 'relative',
                        fontFamily: "'Anton', 'Impact', sans-serif",
                        fontSize: 52,
                        color: '#fff',
                        textShadow: `3px 3px 0 ${theme.primary}, -1px -1px 0 ${theme.primary}`,
                        lineHeight: 0.95,
                        textTransform: 'uppercase',
                        textAlign: 'right',
                        transform: 'rotate(-2deg)'
                    }}>
                        {campaign.heroTitle_de || store?.storeName || 'FRISCH'}
                    </div>
                </div>
            </div>
        );
    };

    // Flyer Footer Component - Dynamic for ALL themes
    const FlyerFooter = () => (
        <div style={{
            height: 120,
            background: theme.primary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1000,
            boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ background: '#222', padding: 8, borderRadius: 8, transform: 'rotate(-2deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                    <img src={store?.logoPath ? `${API_BASE}/files/${store.logoPath}` : "/logo.png"} alt="Logo" style={{ height: 60 }} />
                </div>
                <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 18, textTransform: 'uppercase' }}>{store?.storeName}</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{store?.addressLine1}, {store?.city}</div>
                </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>ÖFFNUNGSZEITEN</div>
                <div style={{ whiteSpace: 'pre-line' }}>{store?.openingHours_de}</div>
            </div>
        </div>
    );

    const addItem = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Factors corresponding to current mode
        const factorW = layoutMode === '3x3' ? 4 : 3;
        const factorH = layoutMode === '3x3' ? 6 : 4;
        const cols = layoutMode === '3x3' ? 3 : 4;
        const rows = layoutMode === '3x3' ? 3 : 4;

        // Find first empty slot
        let foundSlot = null;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Check if any item occupies this slot
                const isOccupied = campaign.items?.some((item: any) =>
                    Math.floor(item.posX / factorW) === x && Math.floor(item.posY / factorH) === y
                );
                if (!isOccupied) {
                    foundSlot = { x, y };
                    break;
                }
            }
            if (foundSlot) break;
        }

        if (!foundSlot) {
            alert('⚠️ Sayfa dolu! Lütfen yeni sayfa ekleyin.');
            return;
        }

        // Optimistic Update: Add item immediately to state
        const tempId = 'temp-' + Date.now();
        const optimisticItem = {
            id: tempId,
            productId,
            type: 'product',
            product: product, // Assuming product object is available in scope
            oldPrice: 9.99,
            newPrice: 6.99,
            badgeText: '-30%',
            posX: foundSlot.x * factorW,
            posY: foundSlot.y * factorH,
            width: factorW,
            height: factorH,
            zIndex: 10
        };

        setCampaign((prev: any) => ({
            ...prev,
            items: [...(prev.items || []), optimisticItem]
        }));

        try {
            await api.post(`/campaigns/${campaignId}/items`, {
                productId,
                oldPrice: 9.99,
                newPrice: 6.99,
                badgeText: '-30%',
                posX: foundSlot.x * factorW,
                posY: foundSlot.y * factorH,
                width: factorW,
                height: factorH,
            });
            // Refresh from server to get real ID
            const res = await api.get(`/campaigns/${campaignId}`);
            setCampaign(res);
        } catch (e) {
            console.error('Add failed', e);
            // Rollback on error
            setCampaign((prev: any) => ({
                ...prev,
                items: prev.items.filter((i: any) => i.id !== tempId)
            }));
            alert('Fehler beim Hinzufügen');
        }
    };

    // ... (updateItem, etc)

    // ... inside return JSX ...

    // [Cleaned up duplicate/floating JSX code]


    // Update campaign data
    const updateCampaign = async (data: any) => {
        // Optimistic UI update
        setCampaign((prev: any) => ({ ...prev, ...data }));
        await api.put(`/campaigns/${campaignId}`, data);
        // Refresh from server to ensure consistency
        api.get(`/campaigns/${campaignId}`).then(setCampaign);
    };

    // ... (keep addItem etc)

    const updateItem = async (itemId: string, data: any) => {
        // Optimistic update
        setCampaign((prev: any) => ({
            ...prev,
            items: (prev?.items || []).map((i: any) => i.id === itemId ? { ...i, ...data } : i)
        }));
        // Server update
        await api.put(`/campaigns/${campaignId}/items/${itemId}`, data);
    };

    // Auto-add logo/slogan removed per user request

    const removeItem = async (itemId: string) => {
        // Optimistic delete
        setCampaign((prev: any) => ({
            ...prev,
            items: prev.items.filter((i: any) => i.id !== itemId)
        }));
        await api.delete(`/campaigns/${campaignId}/items/${itemId}`);
    };

    const changeTheme = async (themeId: string) => {
        await api.put(`/campaigns/${campaignId}`, { themeId });
        api.get(`/campaigns/${campaignId}`).then(setCampaign);
    };

    const ignoreNextLayoutChange = useRef(false);

    // Layout conversion logic
    const changeLayout = (newMode: '3x3' | '4x4') => {
        if (newMode === layoutMode) return;

        // Warn if switching to 3x3 with more than 9 items
        if (newMode === '3x3') {
            const productCount = (campaign.items || []).filter((i: any) => i.type === 'product').length;
            if (productCount > 9) {
                if (!window.confirm(`⚠️ Warnung: Sie haben ${productCount} Produkte, aber das 3x3 Raster erlaubt nur 9.\n\nEinige Produkte werden abgeschnitten/versteckt sein. Möchten Sie trotzdem fortfahren?`)) {
                    return;
                }
            }
        }

        // Grid unit factors
        // 3x3 Mode: 3 cols (12 units total, 4 per col), 3 rows 
        // 4x4 Mode: 4 cols (12 units total, 3 per col), 4 rows
        const oldFactorW = layoutMode === '3x3' ? 4 : 3;
        const oldFactorH = layoutMode === '3x3' ? 6 : 4;
        const newFactorW = newMode === '3x3' ? 4 : 3;
        const newFactorH = newMode === '3x3' ? 6 : 4;

        const updatedItems = (campaign.items || []).map((item: any) => ({
            ...item,
            // Convert pos and size maintaining relative scale
            posX: Math.round((item.posX / oldFactorW) * newFactorW),
            posY: Math.round((item.posY / oldFactorH) * newFactorH),
            width: Math.max(newFactorW, Math.round((item.width / oldFactorW) * newFactorW)),
            height: Math.max(newFactorH, Math.round((item.height / oldFactorH) * newFactorH))
        }));

        ignoreNextLayoutChange.current = true;
        setLayoutMode(newMode);

        const updatedFlyerJson = { ...(campaign.flyerJson || {}), layoutMode: newMode };

        // Optimistic update
        setCampaign((prev: any) => ({ ...prev, items: updatedItems, flyerJson: updatedFlyerJson }));

        // Save new positions
        api.put(`/campaigns/${campaignId}/items-positions`, {
            items: updatedItems.map((i: any) => ({
                id: i.id, posX: i.posX, posY: i.posY, width: i.width, height: i.height
            }))
        });
        // Save layout mode
        api.put(`/campaigns/${campaignId}`, { flyerJson: updatedFlyerJson });
    };

    const onLayoutChange = useCallback((layout: any[]) => {
        if (ignoreNextLayoutChange.current) {
            ignoreNextLayoutChange.current = false;
            return;
        }
        if (!campaign?.items || !layout) return;

        // Factors corresponding to current mode
        const factorW = layoutMode === '3x3' ? 4 : 3;
        const factorH = layoutMode === '3x3' ? 6 : 4;

        const updates = layout.map(l => ({
            id: l.i,
            posX: Math.floor(l.x * factorW),
            posY: Math.floor(l.y * factorH),
            width: Math.round(l.w * factorW),
            height: Math.round(l.h * factorH),
        }));
        api.put(`/campaigns/${campaignId}/items-positions`, { items: updates });
    }, [campaign?.items, layoutMode, campaignId]);

    const exportFlyer = async (type: 'pdf' | 'post' | 'story') => {
        setExporting(type);
        try {
            const result = await api.post(`/flyers/${campaignId}/generate-${type}`);
            window.open(`${API_BASE}/files/${result.filePath}`, '_blank');
        } catch (e) {
            alert('Export fehlgeschlagen');
        }
        setExporting('');
    };

    if (!campaign) return <div className="main"><p>Laden...</p></div>;

    const gridCols = layoutMode === '3x3' ? 3 : 4;
    const factorW = layoutMode === '3x3' ? 4 : 3;
    const factorH = layoutMode === '3x3' ? 6 : 4;

    // Calculate body height - header (200) and footer (120) = 803 for all themes
    const bodyHeight = 803;
    const gridRows = layoutMode === '3x3' ? 3 : 4;
    // Subtract explicit buffer (15px) to prevent items from touching/overlapping footer
    const gridRowHeight = Math.floor((bodyHeight - 15) / gridRows);

    const layout = campaign.items?.map((item: any) => ({
        i: item.id,
        x: Math.floor((item.posX ?? 0) / factorW),
        y: Math.floor((item.posY ?? 0) / factorH),
        w: Math.max(1, Math.round((item.width ?? factorW) / factorW)),
        h: Math.max(1, Math.round((item.height ?? factorH) / factorH)),
        minW: 1, minH: 1
    })) || [];

    return (
        <div className="main" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/kampagnen" style={{ color: '#666', textDecoration: 'none' }}>← Zurück</Link>
                    <h2 style={{ margin: 0 }}>{campaign.title_de}</h2>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => setPageCount(p => p + 1)} style={{ padding: '6px 12px' }}>➕ Seite</button>
                    <span style={{ color: '#666', fontSize: 12 }}>({pageCount})</span>

                    <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden', marginRight: 8, height: 28 }}>
                        <button
                            style={{
                                padding: '0 10px',
                                background: layoutMode === '3x3' ? '#eee' : '#fff',
                                fontWeight: layoutMode === '3x3' ? 'bold' : 'normal',
                                cursor: 'pointer', border: 'none',
                                borderRight: '1px solid #ddd',
                                fontSize: 12
                            }}
                            onClick={() => changeLayout('3x3')}
                            title="3 Spalten Raster"
                        >3x3</button>
                        <button
                            style={{
                                padding: '0 10px',
                                background: layoutMode === '4x4' ? '#eee' : '#fff',
                                fontWeight: layoutMode === '4x4' ? 'bold' : 'normal',
                                cursor: 'pointer', border: 'none',
                                fontSize: 12
                            }}
                            onClick={() => changeLayout('4x4')}
                            title="4 Spalten Raster"
                        >4x4</button>
                    </div>

                    <button className="btn btn-secondary" onClick={() => exportFlyer('pdf')} disabled={!!exporting}>
                        {exporting === 'pdf' ? 'Generiere...' : '📄 PDF Export'}
                    </button>
                    <button onClick={async () => {
                        const mode = window.prompt("Sende-Modus wählen:\n'digest' - PDF Link (1 Nachricht)\n'drip' - Einzelne Angebote (Mehrere Nachrichten)", "digest");
                        if (mode === 'digest' || mode === 'drip') {
                            setExporting('whatsapp');
                            try {
                                const res = await api.post('/whatsapp/send-campaign', { campaignId, mode });
                                alert(`Kampagne gesendet an ${res.recipients} Kunden!`);
                            } catch (e) {
                                alert('Fehler beim Senden');
                            }
                            setExporting('');
                        }
                    }} disabled={!!exporting} className="btn" style={{ background: '#25D366', color: '#fff', border: 'none' }}>
                        {exporting === 'whatsapp' ? 'Sende...' : '🚀 Kampagne starten'}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                {/* Canvas - A4 Container (210mm x 297mm approx 794px x 1123px @ 96dpi) */}
                <div style={{ flex: 1, background: '#333', padding: '20px 40px', overflow: showOverflow ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', minHeight: 0 }}>

                    {/* Zoom Toolbar */}
                    <div style={{ position: 'absolute', top: 10, right: 20, zIndex: 100, display: 'flex', gap: 8, background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                        <button className="btn btn-secondary" onClick={() => setScale(s => Math.max(0.3, s - 0.1))} style={{ padding: '4px 8px' }}>-</button>
                        <span style={{ padding: '4px 8px', fontSize: 14, fontWeight: 'bold' }}>{Math.round(scale * 100)}%</span>
                        <button className="btn btn-secondary" onClick={() => setScale(s => Math.min(1.5, s + 0.1))} style={{ padding: '4px 8px' }}>+</button>
                        <button className="btn btn-primary" onClick={() => setScale(0.65)} style={{ padding: '4px 8px', fontSize: 12 }}>Fit A4</button>
                        <button
                            className={`btn ${showOverflow ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowOverflow(!showOverflow)}
                            style={{ padding: '4px 8px', fontSize: 12 }}
                            title="Versteckte Elemente anzeigen"
                        >
                            {showOverflow ? '👁️ An' : '👁️ Aus'}
                        </button>
                    </div>

                    <div style={{ color: '#aaa', marginBottom: 8, fontSize: 12, flexShrink: 0 }}>A4 Format (210mm x 297mm) - WYSIWYG</div>
                    <div className={`flyer-canvas ${theme.id === 'impact_red' ? 'theme-impact' : ''}`} style={{
                        width: 794,
                        height: 1123, // Force A4 height
                        overflow: 'hidden', // Clip anything outside
                        background: theme.bg || '#fff',
                        position: 'relative',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0, // Prevent squashing
                        display: 'flex', flexDirection: 'column',
                        overflow: showOverflow ? 'visible' : 'hidden' // Allow seeing overflow if toggled
                    }}>
                        {/* THEME HEADER - Now for ALL themes */}
                        <div style={{ height: 200, overflow: 'hidden', flexShrink: 0 }}>
                            <FlyerHeader />
                        </div>

                        {/* BODY BACKGROUND & GRID - Fixed height: 1123 - 200 (header) - 120 (footer) = 803 */}
                        <div style={{ height: 803, position: 'relative', flexShrink: 0 }} onClick={() => setSelectedItem(null)}>
                            {/* Product Area Background */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: (() => {
                                    // 1. If user uploaded a custom bg for this campaign, use it
                                    if (campaign.backgroundImage) return `url(${API_BASE}/files/${campaign.backgroundImage}) center/cover no-repeat`;

                                    // 2. Theme-specific backgrounds
                                    // 2. Theme-specific backgrounds
                                    const bodyBgs: Record<string, string> = {
                                        // 1. Impact Red -> Slate
                                        impact_red: `url(${API_BASE}/files/slate_bg.jpg) center/cover no-repeat`,

                                        // 2. The Big 4 (Generated Unique Backgrounds)
                                        kaufland_red: `url(${API_BASE}/files/backgrounds/bg_kaufland.png) center/cover no-repeat`,
                                        lidl_yellow: `url(${API_BASE}/files/backgrounds/bg_lidl.png) center/cover no-repeat`,
                                        aldi_white: `url(${API_BASE}/files/backgrounds/bg_aldi.png) center/cover no-repeat`,
                                        rewe_red: `url(${API_BASE}/files/backgrounds/bg_rewe.png) center/cover no-repeat`,

                                        // 3. Rossmann -> Fresh Green
                                        rossmann_green: `url(${API_BASE}/files/backgrounds/bg_a4_fresh_green_1768682128158.png) center/cover no-repeat`,

                                        // 4. Discounters (Netto, Penny) -> Sale/Yellow
                                        netto_yellow: `url(${API_BASE}/files/backgrounds/bg_a4_sale_1768682112596.png) center/cover no-repeat`,
                                        penny_red: `url(${API_BASE}/files/backgrounds/bg_a4_sale_1768682112596.png) center/cover no-repeat`,

                                        // 5. Others -> Standard Texture
                                        edeka_yellow: `url(${API_BASE}/files/product_bg.png) center/cover no-repeat`,
                                        real_blue: `url(${API_BASE}/files/product_bg.png) center/cover no-repeat`,
                                    };
                                    return bodyBgs[theme.id] || bodyBgs.kaufland_red;
                                })(),
                                pointerEvents: 'none'
                            }} />

                            {/* Grid Lines Overlay */}
                            {/* Grid Lines Removed */}

                            {/* Grid Lines Overlay */}
                            {/* Grid Lines Removed */}

                            {/* Grid Overlay - Shows when item is selected */}
                            {selectedItem && (
                                <div style={{ position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}>
                                    {Array.from({ length: layoutMode === '3x3' ? 9 : 16 }).map((_, idx) => {
                                        const cols = layoutMode === '3x3' ? 3 : 4;
                                        const rows = layoutMode === '3x3' ? 3 : 4;
                                        // Body height is now 803 for all themes (header 200 + body 803 + footer 120 = 1123)
                                        const bodyHeight = 803;
                                        const cellW = 794 / cols;
                                        // Sync with gridRowHeight buffer (-15px)
                                        const cellH = (bodyHeight - 15) / rows;
                                        const x = idx % cols;
                                        const y = Math.floor(idx / cols);

                                        // Check if this cell is occupied
                                        const factorW = layoutMode === '3x3' ? 4 : 3;
                                        const factorH = layoutMode === '3x3' ? 6 : 4;
                                        const occupyingItem = campaign.items?.find((i: any) =>
                                            Math.floor(i.posX / factorW) === x && Math.floor(i.posY / factorH) === y
                                        );
                                        const isOccupied = !!occupyingItem;
                                        const isCurrentItem = occupyingItem?.id === selectedItem;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isCurrentItem) {
                                                        setSelectedItem(null);
                                                        return;
                                                    }

                                                    const selectedItemData = campaign.items.find((i: any) => i.id === selectedItem);
                                                    if (!selectedItemData) return;

                                                    // Calculate new positions
                                                    const newPosX = x * factorW;
                                                    const newPosY = y * factorH;

                                                    let updatedItems;
                                                    if (isOccupied && occupyingItem) {
                                                        // SWAP: Exchange positions
                                                        updatedItems = campaign.items.map((item: any) => {
                                                            if (item.id === selectedItem) {
                                                                return { ...item, posX: newPosX, posY: newPosY };
                                                            }
                                                            if (item.id === occupyingItem.id) {
                                                                return { ...item, posX: selectedItemData.posX, posY: selectedItemData.posY };
                                                            }
                                                            return item;
                                                        });
                                                    } else {
                                                        // MOVE: Just move to empty cell
                                                        updatedItems = campaign.items.map((item: any) => {
                                                            if (item.id === selectedItem) {
                                                                return { ...item, posX: newPosX, posY: newPosY };
                                                            }
                                                            return item;
                                                        });
                                                    }

                                                    // Update state and backend
                                                    updateCampaign({ ...campaign, items: updatedItems });
                                                    // api.put removed - handled by updateCampaign
                                                    setSelectedItem(null); // Deselect after move
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    left: x * cellW,
                                                    top: y * cellH,
                                                    width: cellW,
                                                    height: cellH,
                                                    // Removed grid lines/borders as requested. Only selection remains visibly highlighted.
                                                    border: isCurrentItem ? '2px solid #2196F3' : 'none',
                                                    background: 'transparent',
                                                    cursor: isCurrentItem ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.2s'
                                                }}
                                                title={isCurrentItem ? 'Seçili öğe' : (isOccupied ? 'Yer değiştir' : 'Buraya taşı')}
                                            >
                                                {!isCurrentItem && (
                                                    <span style={{
                                                        fontSize: 12,
                                                        color: isOccupied ? '#ff9800' : '#4CAF50',
                                                        fontWeight: 'bold',
                                                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                                    }}>
                                                        {isOccupied ? '↔️ Swap' : '📍'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Wrapper to constrain GridLayout height */}
                            {/* Overflow visible needed for badges to pop over header */}
                            <div style={{ height: '100%', width: '100%', overflow: 'visible', position: 'relative', zIndex: 100 }}>
                                <GridLayout
                                    className="layout"
                                    layout={layout}
                                    cols={gridCols}
                                    rowHeight={gridRowHeight}
                                    width={794}
                                    onLayoutChange={onLayoutChange}
                                    isResizable={false}
                                    isDraggable={false}
                                    useCSSTransforms={false}
                                    isBounded={true}
                                    margin={[0, 0]}
                                    compactType={null}
                                    preventCollision={true}
                                    maxRows={gridRows}
                                >
                                    {campaign.items?.map((item: any) => {
                                        const isSelected = selectedItem === item.id;
                                        const zIndex = item.zIndex || 10;

                                        // Helper for delete button - only show when selected
                                        const DeleteButton = () => isSelected ? (
                                            <div
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeItem(item.id);
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                style={{
                                                    position: 'absolute',
                                                    top: 4, right: 4,
                                                    width: 30, height: 30, // Larger
                                                    borderRadius: '50%',
                                                    background: '#ff4444',
                                                    border: '2px solid white',
                                                    color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    zIndex: 100000, // Topmost
                                                    pointerEvents: 'auto', // Capture clicks
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                                    fontWeight: '900', fontSize: 18,
                                                    lineHeight: 1
                                                }}
                                                title="Sil"
                                            >
                                                ×
                                            </div>
                                        ) : null;

                                        // --- RENDER LOGO ---
                                        if (item.type === 'logo') {
                                            return (
                                                <div key={item.id} className={`grid-item ${isSelected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }} style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    zIndex, position: 'relative',
                                                    background: '#222222', // Dark background for contrast
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                                    padding: '8px'
                                                }}>
                                                    <DeleteButton />

                                                    {/* User Generated Logo */}
                                                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                                                        {store?.logoPath ? (
                                                            <img src={`${API_BASE}/files/${store.logoPath}`} alt="Logo" style={{ height: '95%', width: 'auto', objectFit: 'contain', pointerEvents: 'none' }} />
                                                        ) : (
                                                            <div style={{ fontSize: 24, fontWeight: 'bold', pointerEvents: 'none', color: '#fff' }}>{store?.storeName || 'LOGO'}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // --- RENDER SLOGAN ---
                                        if (item.type === 'slogan') {
                                            return (
                                                <div key={item.id} className={`grid-item ${isSelected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: item.color || theme.primary,
                                                    transform: `rotate(${item.rotation || 0}deg)`,
                                                    zIndex,
                                                    position: 'relative'
                                                }}>
                                                    <DeleteButton />
                                                    <div style={{
                                                        color: '#fff', fontSize: item.fontSize || 32,
                                                        fontWeight: 900, fontFamily: theme.font,
                                                        textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1,
                                                        pointerEvents: 'none',
                                                        width: '100%', padding: '0 8px',
                                                        overflow: 'hidden', wordBreak: 'break-word',
                                                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                                                    }}>{item.text}</div>
                                                </div>
                                            );
                                        }

                                        // --- RENDER STICKER ---
                                        if (item.type === 'sticker') {
                                            return (
                                                <div key={item.id} className={`grid-item ${isSelected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transform: `rotate(${item.rotation || 0}deg)`,
                                                        zIndex: zIndex || 50,
                                                        position: 'relative'
                                                    }}>
                                                    <DeleteButton />
                                                    {item.imagePath ? (
                                                        <img src={`${API_BASE}/files/${item.imagePath}`} alt="Sticker" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <div style={{
                                                            fontSize: 48,
                                                            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
                                                            animation: isSelected ? 'none' : 'pulse 2s infinite'
                                                        }}>{item.stickerEmoji || '⭐'}</div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // --- RENDER PRODUCT (Default) ---
                                        // Use saved slogan or empty (no random)
                                        const slogan = item.slogan || '';
                                        const showSlogan = !!item.slogan;

                                        let priceShapeClass = theme.priceShape || '';
                                        if (item.priceStyle === 'starburst') priceShapeClass = 'price-tag-starburst';
                                        if (item.priceStyle === 'jagged') priceShapeClass = 'price-tag-jagged';
                                        if (item.priceStyle === 'circle') priceShapeClass = 'badge-round-burst';
                                        if (item.priceStyle === 'minimal') priceShapeClass = '';

                                        const useTransparent = item.cardBgMode === 'transparent' || (!!campaign.backgroundImage && item.cardBgMode !== 'solid');

                                        // Card Background Logic: Custom Texture > Campaign Default Texture > Transparent > Theme Default
                                        // Fallback to 'tag_v2_3.png' standard tag if nothing selected so we always show a nice tag
                                        const texture = item.cardTexture || campaign.defaultCardTexture || 'tag_v2_3.png';

                                        // IMPORTANT: When using texture image, don't apply CSS shape classes
                                        if (texture) {
                                            priceShapeClass = '';
                                        }

                                        const cardBg = useTransparent ? 'transparent' : (theme.cardTexture && theme.cardTexture !== 'none' ? theme.cardTexture : theme.cardBg);

                                        const priceColor = item.priceTagBg || theme.priceTagBg;

                                        return (
                                            <div key={item.id} className={`grid-item grid-item-layered ${isSelected ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }}
                                                style={{
                                                    background: cardBg,
                                                    border: (texture || campaign.showBorders === false) ? 'none' : theme.cardBorder,
                                                    borderRadius: 8,
                                                    display: 'flex', flexDirection: 'column', padding: 4, zIndex: zIndex, position: 'relative'
                                                }}>
                                                <DeleteButton />

                                                {showSlogan && (
                                                    <div className="slogan-overlay" style={{
                                                        top: '15%', left: '5%', right: '5%', color: theme.accent, fontSize: 22,
                                                        transform: 'rotate(-12deg)', opacity: 0.95, textShadow: '2px 2px 0 #fff',
                                                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                                                    }}>{slogan}</div>
                                                )}

                                                {item.badgeText && (
                                                    <div className={priceShapeClass === 'price-tag-jagged' ? 'badge-round-burst' : ''} style={{
                                                        position: 'absolute', top: -12, right: 4, // Moved inwards to prevent cut-off
                                                        background: theme.badgeBg, color: theme.badgeText,
                                                        fontWeight: '900', padding: '8px',
                                                        borderRadius: (priceShapeClass === 'price-tag-starburst' || priceShapeClass === 'price-tag-jagged') ? 0 : '50%',
                                                        fontSize: 16, zIndex: 2000, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                    }}>
                                                        {item.priceStyle === 'starburst' && <div className="starburst-shape" style={{ background: theme.badgeBg }}></div>}
                                                        <span style={{ position: 'relative', zIndex: 2 }}>{item.badgeText}</span>
                                                    </div>
                                                )}

                                                {item.labelText && (
                                                    <div style={{
                                                        position: 'absolute', top: 10, left: -2, background: theme.accent, color: '#fff',
                                                        padding: '2px 10px', fontSize: 10, fontWeight: 'bold',
                                                        clipPath: 'polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%)', zIndex: 12
                                                    }}>{item.labelText}</div>
                                                )}

                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 5, minHeight: 80 }}>
                                                    {item.product?.imagePath ? (
                                                        <img src={`${API_BASE}/files/${item.product.imagePath}`} alt={item.product?.name_de} style={{ maxWidth: '125%', maxHeight: '125%', objectFit: 'contain' }} />
                                                    ) : <span style={{ fontSize: 32 }}>📦</span>}
                                                </div>

                                                <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%', paddingBottom: 50 /* Space for absolute price tag */ }}>
                                                    <div style={{ fontWeight: '800', fontSize: 15, lineHeight: 1.2, marginBottom: 4, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', textAlign: 'center' }}>{item.product?.name_de}</div>
                                                    <div style={{ fontSize: 13, fontWeight: '600', color: '#eee', textAlign: 'center', marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{item.product?.unitText}</div>

                                                    {/* Old Price - positioned above the price tag or left aligned? Keeping it centered for now */}
                                                    <div style={{ textDecoration: 'line-through', color: '#ffaaaa', fontSize: 13, fontWeight: 'bold', marginBottom: 4, opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{(item.oldPrice || 0).toFixed(2)} €</div>

                                                    {/* PRICE TAG - Absolute Bottom Right */}
                                                    {/* PRICE TAG - Absolute Bottom Right */}
                                                    <div style={{ position: 'absolute', bottom: 4, right: 4, zIndex: 10 }}>
                                                        {(() => {
                                                            // Determine specific style based on texture
                                                            // Determine specific style based on texture
                                                            // Default: Dead center
                                                            let alignStyle: any = { alignItems: 'center', justifyContent: 'center', padding: 0 };

                                                            // Special cases (only if texture clearly requires offset)
                                                            if (texture === 'tag_v2_1.png') {
                                                                // User feedback: Move price UP a few pixels
                                                                alignStyle = { alignItems: 'center', justifyContent: 'center', padding: '0 0 8px 0' };
                                                            }
                                                            else if (texture === 'tag_v2_2.png' || texture === 'tag_v2_3.png') {
                                                                // User feedback: Move price UP slightly
                                                                alignStyle = { alignItems: 'center', justifyContent: 'center', padding: '8px 0 0 0' };
                                                            }
                                                            else if (texture === 'tag_v2_4.png') {
                                                                // User feedback: Move price UP
                                                                alignStyle = { alignItems: 'center', justifyContent: 'center', padding: '0 0 12px 0' };
                                                            }
                                                            else if (texture === 'tag_v2_5.png') {
                                                                // Top Preis box
                                                                alignStyle = { alignItems: 'center', justifyContent: 'center', padding: '20px 0 0 0' };
                                                            }
                                                            else if (texture && texture.includes('tag_card_')) {
                                                                // Generic cards often describe price at bottom
                                                                alignStyle = { alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 10px 0' };
                                                            }

                                                            return (
                                                                <div className={priceShapeClass} style={{
                                                                    position: 'relative',
                                                                    height: 100, // Increased size again
                                                                    display: 'inline-flex',
                                                                    borderRadius: 6,
                                                                    boxShadow: texture ? 'none' : '0 2px 6px rgba(0,0,0,0.2)',
                                                                    background: texture ? 'transparent' : priceColor,
                                                                }}>
                                                                    {texture && (
                                                                        <img
                                                                            src={`${API_BASE}/files/${texture}`}
                                                                            style={{
                                                                                height: '100%',
                                                                                width: 'auto',
                                                                                objectFit: 'contain',
                                                                                display: 'block'
                                                                            }}
                                                                        />
                                                                    )}

                                                                    {priceShapeClass === 'price-tag-starburst' && !texture && <div className="starburst-bg" style={{ background: priceColor }}></div>}

                                                                    <div style={{
                                                                        position: 'absolute', top: 0, left: 0,
                                                                        width: '100%', height: '100%',
                                                                        display: 'flex',
                                                                        color: theme.priceTagText,
                                                                        ...alignStyle
                                                                    }}>
                                                                        <span style={{ fontSize: 34, fontWeight: '900', lineHeight: 0.9 }}>{Math.floor(item.newPrice || 0)}</span>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 2, marginBottom: 2 }}>
                                                                            <span style={{ fontSize: 18, fontWeight: '900', lineHeight: 1 }}>{((item.newPrice || 0) % 1).toFixed(2).substring(2)}</span>
                                                                            <span style={{ fontSize: 12, fontWeight: 'bold', lineHeight: 0.8 }}>€</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })}
                                </GridLayout>
                            </div>
                        </div>

                        {/* FOOTER - Outside body, part of flyer-canvas flex */}
                        <div style={{ height: 120, flexShrink: 0, position: 'relative', zIndex: 1000 }}>
                            <FlyerFooter />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ width: 320, background: '#fff', borderLeft: '1px solid #eee', padding: 20, overflow: 'auto' }}>
                    {/* Visual Builder Tools */}
                    <div className="card" style={{ marginBottom: 12, padding: 12 }}>
                        <h5 style={{ margin: '0 0 8px' }}>🎨 Theme</h5>
                        <div className="theme-selector">
                            {Object.values(THEMES)?.map(t => (
                                <button key={t.id}
                                    className={`theme-btn ${theme.id === t.id ? 'active' : ''}`}
                                    style={{ background: t.primary, width: 32, height: 32, borderRadius: 4, marginRight: 4, cursor: 'pointer', border: theme.id === t.id ? '2px solid #000' : '1px solid #ddd' }}
                                    onClick={() => changeTheme(t.id)}
                                    title={t.label}
                                />
                            ))}
                        </div>
                    </div>

                    <h4 style={{ margin: '0 0 12px' }}>Visueller Builder</h4>

                    <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 8, borderRadius: 8 }}>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 6, fontWeight: 'bold' }}>📐 Grid Layout</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className={`btn ${layoutMode === '3x3' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => changeLayout('3x3')}
                                style={{ flex: 1, fontSize: 12 }}
                            >
                                3x3 (Standard)
                            </button>
                            <button
                                className={`btn ${layoutMode === '4x4' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => changeLayout('4x4')}
                                style={{ flex: 1, fontSize: 12 }}
                            >
                                4x4 (Dicht)
                            </button>
                        </div>
                    </div>

                    {/* Background Selection */}
                    <div style={{ marginBottom: 24, padding: 12, border: '1px dashed #ccc', borderRadius: 8 }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>🖼️ Hintergrund wählen</label>

                        {/* Preset Backgrounds Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                            {(backgrounds || []).map((bg: string) => (
                                <div key={bg}
                                    onClick={() => updateCampaign({ ...campaign, backgroundImage: bg })}
                                    style={{
                                        aspectRatio: '0.7',
                                        backgroundImage: `url(${API_BASE}/files/${bg})`,
                                        backgroundSize: 'cover',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        border: campaign.backgroundImage === bg ? '2px solid #1a1a2e' : '1px solid #eee'
                                    }}
                                    title={bg.split('/').pop()}
                                />
                            ))}
                        </div>

                        {/* Upload New BG */}
                        <label className="btn btn-secondary" style={{ display: 'block', width: '100%', cursor: 'pointer', textAlign: 'center', fontSize: 13, padding: '8px 0' }}>
                            📁 Eigenes Bild hochladen
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const formData = new FormData();
                                    formData.append('file', e.target.files[0]);
                                    // Use fetch directly for FormData upload
                                    fetch(`${API_BASE}/flyers/${campaignId}/upload-background`, {
                                        method: 'POST',
                                        body: formData
                                    }).then(() => {
                                        api.get(`/campaigns/${campaignId}`).then(setCampaign);
                                        api.get('/flyers/backgrounds/list').then((res: any) => setBackgrounds(res.data));
                                    });
                                }
                            }} />
                        </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
                        <button className="btn btn-secondary" onClick={async () => {
                            const newItem = { type: 'logo', posX: 0, posY: 0, width: 4, height: 2 };
                            await api.post(`/campaigns/${campaignId}/items`, newItem);
                            api.get(`/campaigns/${campaignId}`).then(setCampaign);
                        }}>Logo +</button>

                        <button className="btn btn-secondary" onClick={async () => {
                            const newItem = {
                                type: 'slogan', text: 'KNÜLLER',
                                posX: 1, posY: 1, width: 4, height: 2,
                                rotation: -15, color: theme.accent, fontSize: 32, zIndex: 60
                            };
                            await api.post(`/campaigns/${campaignId}/items`, newItem);
                            api.get(`/campaigns/${campaignId}`).then(setCampaign);
                        }}>Slogan +</button>

                        <button className="btn btn-secondary" onClick={() => {
                            updateCampaign({ ...campaign, showBorders: campaign.showBorders === false ? true : false });
                        }}>
                            {campaign.showBorders === false ? '🔲 Rahmen AN' : '🔳 Rahmen AUS'}
                        </button>
                    </div>

                    {/* Sticker Picker */}
                    <div style={{ marginBottom: 24 }}>
                        <h5 style={{ margin: '0 0 8px', fontSize: 13, color: '#888' }}>⭐ Sticker hinzufügen</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                            {[
                                { emoji: '⭐', label: 'Star', stickerType: 'star' },
                                { emoji: '🔥', label: 'Hot', stickerType: 'fire' },
                                { emoji: '🆕', label: 'Neu', stickerType: 'new' },
                                { emoji: '🌿', label: 'Bio', stickerType: 'bio' },
                                { emoji: '💯', label: 'Top', stickerType: 'top100' },
                                { emoji: '🏆', label: 'Best', stickerType: 'bestseller' },
                                { emoji: '❤️', label: 'Love', stickerType: 'love' },
                                { emoji: '💥', label: 'Boom', stickerType: 'boom' },
                                { emoji: '🎁', label: 'Gift', stickerType: 'gift' },
                                { emoji: '📢', label: 'Sale', stickerType: 'sale' },
                            ].map(s => (
                                <button
                                    key={s.stickerType}
                                    className="btn btn-secondary"
                                    onClick={async () => {
                                        const newItem = {
                                            type: 'sticker',
                                            stickerType: s.stickerType,
                                            stickerEmoji: s.emoji,
                                            posX: 8, posY: 0, width: 2, height: 2, zIndex: 50
                                        };
                                        await api.post(`/campaigns/${campaignId}/items`, newItem);
                                        api.get(`/campaigns/${campaignId}`).then(setCampaign);
                                    }}
                                    style={{
                                        padding: '8px 4px', fontSize: 20,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                                    }}
                                    title={s.label}
                                >
                                    {s.emoji}
                                    <span style={{ fontSize: 9 }}>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Card & Special Stickers */}
                    <div style={{ marginBottom: 24, padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fafafa' }}>
                        <h5 style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>🃏 Fiyat Kartı & Özel Etiketler</h5>

                        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, fontWeight: 'bold' }}>Özel Etiketler</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <button className="btn btn-secondary" onClick={() => {
                                api.post(`/campaigns/${campaignId}/items`, {
                                    type: 'sticker', imagePath: 'sticker_top_angebot.png',
                                    posX: 4, posY: 4, width: 4, height: 2, zIndex: 60
                                }).then(() => api.get(`/campaigns/${campaignId}`).then(setCampaign));
                            }} style={{ flex: 1, flexDirection: 'column', gap: 2, padding: 4 }}>
                                <img src={`${API_BASE}/files/sticker_top_angebot.png`} title="Top Angebot" style={{ height: 30, objectFit: 'contain' }} />
                                <div style={{ fontSize: 9 }}>Top Angebot</div>
                            </button>
                        </div>

                        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, fontWeight: 'bold' }}>Fiyat Etiketi Arkaplanı Seçin (Tümü İçin)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            <button className={`btn ${!campaign.defaultCardTexture ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => updateCampaign({ ...campaign, defaultCardTexture: null })}
                                style={{ fontSize: 10, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                Varsayılan
                            </button>
                            {[
                                'tag_v2_1.png',
                                'tag_v2_2.png',
                                'tag_v2_3.png',
                                'tag_v2_4.png',
                                'tag_v2_5.png'
                            ].map(bg => (
                                <div key={bg}
                                    onClick={() => updateCampaign({ ...campaign, defaultCardTexture: bg })}
                                    style={{ aspectRatio: '1.2', backgroundImage: `url(${API_BASE}/files/${bg})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', cursor: 'pointer', border: campaign.defaultCardTexture === bg ? '2px solid blue' : '1px solid #ddd', borderRadius: 4, backgroundColor: 'transparent' }}
                                    title={bg}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Themes */}
                    <h4 style={{ margin: '0 0 12px' }}>🎨 Thema ({Object.keys(THEMES).length} verfügbar)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                        {Object.entries(THEMES)?.map(([id, t]) => (
                            <button
                                key={id}
                                onClick={() => changeTheme(id)}
                                style={{
                                    width: 36, height: 36, borderRadius: 6,
                                    border: campaign.themeId === id ? '3px solid #1a1a2e' : '2px solid transparent',
                                    background: t.background, cursor: 'pointer',
                                    boxShadow: campaign.themeId === id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                                title={t.name}
                            />
                        ))}
                    </div>

                    {/* Add Products */}
                    <h4 style={{ margin: '0 0 12px' }}>Produkte hinzufügen</h4>
                    <div style={{ maxHeight: 250, overflowY: 'auto', marginBottom: 24 }}>
                        {products.filter(p => !campaign.items?.find((i: any) => i.productId === p.id)).map(p => (
                            <div key={p.id} onClick={() => addItem(p.id)} style={{ display: 'flex', gap: 12, padding: 10, background: '#f9f9f9', borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }} className="product-card-preview">
                                <div style={{ width: 40, height: 40, background: 'transparent', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {p.imagePath ? <img src={`${API_BASE}/files/${p.imagePath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📦</span>}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name_de}</div>
                                    <div style={{ fontSize: 11, color: '#888' }}>{p.category?.name_de}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit Selected Item */}
                    {/* Edit Selected Item */}
                    {selectedItem && campaign.items?.find((i: any) => i.id === selectedItem) && (() => {
                        const item = campaign.items.find((i: any) => i.id === selectedItem);

                        // --- SLOGAN EDITOR ---
                        if (item.type === 'slogan') {
                            return (
                                <>
                                    <h4 style={{ margin: '0 0 12px' }}>Slogan bearbeiten</h4>
                                    <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16 }}>
                                        <div className="form-group">
                                            <label className="form-label">Text</label>
                                            <input className="input" value={item.text || ''} onChange={e => updateItem(item.id, { text: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Rotation ({item.rotation || -15}°)</label>
                                            <input type="range" min="-180" max="180" value={item.rotation || -15} onChange={e => updateItem(item.id, { rotation: +e.target.value })} style={{ width: '100%' }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Schriftgröße ({item.fontSize || 32}px)</label>
                                            <input type="range" min="12" max="120" value={item.fontSize || 32} onChange={e => updateItem(item.id, { fontSize: +e.target.value })} style={{ width: '100%' }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Farbe</label>
                                            <input type="color" value={item.color || theme.accent} onChange={e => updateItem(item.id, { color: e.target.value })} style={{ width: '100%', height: 40 }} />
                                        </div>

                                    </div>
                                </>
                            );
                        }

                        // --- LOGO EDITOR ---
                        if (item.type === 'logo') {
                            return (
                                <>
                                    <h4 style={{ margin: '0 0 12px' }}>Logo bearbeiten</h4>
                                    <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16 }}>
                                        <p style={{ fontSize: 13, color: '#666' }}>Größe ändern Sie direkt im Editor (unten rechts am Logo ziehen).</p>

                                    </div>
                                </>
                            );
                        }

                        // --- PRODUCT EDITOR ---
                        return (
                            <>
                                <h4 style={{ margin: '0 0 12px' }}>Artikel bearbeiten</h4>
                                <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Slogan</label>
                                        <select className="input" value={item.slogan || ''} onChange={e => updateItem(item.id, { slogan: e.target.value })}>
                                            <option value="">Kein Slogan</option>
                                            <option value="KNÜLLER">KNÜLLER</option>
                                            <option value="TOP PREIS">TOP PREIS</option>
                                            <option value="RICHTIG FRISCH">RICHTIG FRISCH</option>
                                            <option value="AKTION">AKTION</option>
                                            <option value="SUPER">SUPER</option>
                                            <option value="XXL">XXL</option>
                                            <option value="BILLIGER">BILLIGER</option>
                                            <option value="FRISCHE">FRISCHE</option>
                                            <option value="BIO">BIO</option>
                                            <option value="NUR DIESE WOCHE">NUR DIESE WOCHE</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Preis-Stil</label>
                                        <select className="input" value={item.priceStyle || 'theme'} onChange={e => updateItem(item.id, { priceStyle: e.target.value })}>
                                            <option value="theme">Wie Thema ({theme.name})</option>
                                            <option value="starburst">💥 Starburst (Action)</option>
                                            <option value="jagged">⚡ Jagged (Discounter)</option>
                                            <option value="circle">🔴 Kreis (Klassisch)</option>
                                            <option value="minimal">⬜ Minimal (Box)</option>
                                        </select>
                                    </div>

                                    {/* Card Background Toggle */}
                                    <div className="form-group">
                                        <label className="form-label">Karten-Hintergrund</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className={`btn ${item.cardBgMode !== 'transparent' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => updateItem(item.id, { cardBgMode: 'solid' })}
                                                style={{ flex: 1, fontSize: 12 }}
                                            >⬜ Mit Hintergrund</button>
                                            <button
                                                className={`btn ${item.cardBgMode === 'transparent' ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => updateItem(item.id, { cardBgMode: 'transparent' })}
                                                style={{ flex: 1, fontSize: 12 }}
                                            >🔳 Transparent</button>
                                        </div>
                                    </div>

                                    {/* Custom Price Tag Color */}
                                    <div className="form-group">
                                        <label className="form-label">Preis-Hintergrund</label>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={item.priceTagBg || theme.priceTagBg}
                                                onChange={e => updateItem(item.id, { priceTagBg: e.target.value })}
                                                style={{ width: 40, height: 40, padding: 0, border: '2px solid #ddd', borderRadius: 4 }}
                                            />
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => updateItem(item.id, { priceTagBg: null })}
                                                style={{ fontSize: 11 }}
                                            >Reset</button>
                                            <span style={{ fontSize: 11, color: '#888' }}>oder Theme-Farbe</span>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>{item.product?.name_de || 'Slogan/Logo'}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Alter Preis</label>
                                                <input className="input" type="number" step="0.01" value={item.oldPrice ?? ''} onChange={e => {
                                                    const oldPrice = e.target.value === '' ? null : +e.target.value;
                                                    const updates: any = { oldPrice };
                                                    // Auto-calculate badge
                                                    if (oldPrice && item.newPrice && oldPrice > item.newPrice) {
                                                        updates.badgeText = `-${Math.round((1 - item.newPrice / oldPrice) * 100)}%`;
                                                    }
                                                    updateItem(item.id, updates);
                                                }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Neuer Preis</label>
                                                <input className="input" type="number" step="0.01" value={item.newPrice ?? ''} onChange={e => {
                                                    const newPrice = e.target.value === '' ? null : +e.target.value;
                                                    const updates: any = { newPrice };
                                                    // Auto-calculate badge
                                                    if (item.oldPrice && newPrice && item.oldPrice > newPrice) {
                                                        updates.badgeText = `-${Math.round((1 - newPrice / item.oldPrice) * 100)}%`;
                                                    }
                                                    updateItem(item.id, updates);
                                                }} />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Badge (otomatik hesaplanır)</label>
                                            <input className="input" value={item.badgeText || ''} onChange={e => updateItem(item.id, { badgeText: e.target.value })} placeholder="Otomatik: -30%" />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Label (z.B. AKTION, XXL)</label><input className="input" value={item.labelText || ''} onChange={e => updateItem(item.id, { labelText: e.target.value })} /></div>
                                    <div><label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4 }}>Limit (z.B. Max 2 Stück)</label><input className="input" value={item.limitText || ''} onChange={e => updateItem(item.id, { limitText: e.target.value })} /></div>
                                </div>

                                {/* Delete Button */}
                                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="btn" style={{ background: 'red', color: 'white', width: '100%', marginTop: 20 }}>Löschen</button>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    )
}

// Main App
export default function App() {
    const [loggedIn, setLoggedIn] = useState(true); // Login bypassed by user request
    const handleLogin = () => { sessionStorage.setItem('loggedIn', 'true'); setLoggedIn(true); };

    if (!loggedIn) return <Login onLogin={handleLogin} />;

    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route path="/kampagnen/:id" element={<FlyerEditor />} />
                    <Route path="*" element={
                        <>
                            <Sidebar />
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/kategorien" element={<Kategorien />} />
                                <Route path="/produkte" element={<Produkte />} />
                                <Route path="/kampagnen" element={<Kampagnen />} />
                                <Route path="/kunden" element={<Kunden />} />
                                <Route path="/einstellungen" element={<Einstellungen />} />
                                <Route path="/whatsapp" element={<Whatsapp />} />
                            </Routes>
                        </>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
