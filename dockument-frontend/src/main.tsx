import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, type Note, type NoteInput } from './api';
import './styles.css';

type Editor = { mode: 'create' } | { mode: 'edit'; id: string } | null;
const emptyNote: NoteInput = { title: '', body: '' };
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong.';

function App() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [notice, setNotice] = useState('');
	const [editor, setEditor] = useState<Editor>(null);
	const [form, setForm] = useState<NoteInput>(emptyNote);

	const loadNotes = useCallback(async () => {
		setLoading(true);
		try { setNotes(await api.list()); setError(''); }
		catch (err) { setError(errorMessage(err)); }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { void loadNotes(); }, [loadNotes]);

	function startCreate() {
		setForm(emptyNote); setEditor({ mode: 'create' }); setError(''); setNotice('');
	}
	function startEdit(note: Note) {
		setForm({ title: note.title, body: note.body }); setEditor({ mode: 'edit', id: note.id });
		setError(''); setNotice('');
	}
	async function save(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!editor || busy) return;
		if (!form.title.trim() || !form.body.trim()) { setError('Please enter a title and body.'); return; }
		setBusy(true); setError(''); setNotice('');
		try {
			const data = { title: form.title.trim(), body: form.body.trim() };
			if (editor.mode === 'create') await api.create(data);
			else await api.update(editor.id, data);
			setEditor(null);
			setNotice(editor.mode === 'create' ? 'Note created.' : 'Note updated.');
			await loadNotes();
		} catch (err) { setError(errorMessage(err)); }
		finally { setBusy(false); }
	}
	async function remove(note: Note) {
		if (busy || !window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
		setBusy(true); setError(''); setNotice('');
		try {
			await api.remove(note.id);
			if (editor?.mode === 'edit' && editor.id === note.id) setEditor(null);
			setNotice('Note deleted.');
			await loadNotes();
		} catch (err) { setError(errorMessage(err)); }
		finally { setBusy(false); }
	}

	return (
		<div className="app-shell">
			<header className="topbar"><div className="topbar-inner"><span className="brand-mark" aria-hidden="true">N</span><span className="brand">Dockument</span></div></header>
			<main className="main">
				<div className="page-heading">
					<div><p className="eyebrow">YOUR SPACE</p><h1>Dockument</h1><p className="subtitle">A simple place for your thoughts.</p></div>
					<button className="button primary" onClick={startCreate} disabled={busy}>+ New note</button>
				</div>
				{error && <div className="message error" role="alert">{error} <button className="text-button" onClick={() => void loadNotes()} disabled={busy}>Retry loading</button></div>}
				{notice && <div className="message success" role="status">{notice}</div>}
				{editor && <section className="editor" aria-labelledby="editor-title">
					<div className="section-heading"><div><p className="eyebrow">{editor.mode === 'create' ? 'NEW NOTE' : 'EDIT NOTE'}</p><h2 id="editor-title">{editor.mode === 'create' ? 'Write a note' : 'Update your note'}</h2></div></div>
					<form onSubmit={save}>
						<label htmlFor="title">Title</label>
						<input id="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Give your note a title" required disabled={busy} />
						<label htmlFor="body">Body</label>
						<textarea id="body" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Write something..." rows={6} required disabled={busy} />
						<div className="form-actions"><button className="button primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save note'}</button><button className="button secondary" type="button" onClick={() => setEditor(null)} disabled={busy}>Cancel</button></div>
					</form>
				</section>}
				<section aria-labelledby="notes-title" className="notes-section">
					<div className="list-heading"><h2 id="notes-title">All notes</h2><span className="count">{loading ? 'Loading…' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}</span></div>
					{loading && <p className="state" role="status">Loading your notes…</p>}
					{!loading && !error && notes.length === 0 && <div className="empty"><div className="empty-icon" aria-hidden="true">✎</div><h3>Nothing here yet</h3><p>Create your first note to get started.</p><button className="button secondary" onClick={startCreate} disabled={busy}>Create a note</button></div>}
					{!loading && notes.length > 0 && <div className="note-list">{notes.map(note => <article className="note" key={note.id}><div className="note-content"><h3>{note.title}</h3><p>{note.body}</p></div><div className="note-actions"><button className="button secondary" onClick={() => startEdit(note)} disabled={busy} aria-label={`Edit ${note.title}`}>Edit</button><button className="button danger" onClick={() => void remove(note)} disabled={busy} aria-label={`Delete ${note.title}`}>Delete</button></div></article>)}</div>}
				</section>
			</main>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
