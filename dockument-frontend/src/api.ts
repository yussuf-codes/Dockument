export type Note = { id: string; title: string; body: string };
export type NoteInput = { title: string; body: string };

const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const notesUrl = `${base}/api/notes`;

async function request(url: string, init?: RequestInit): Promise<Response> {
	let response: Response;
	try {
		response = await fetch(url, init);
	} catch {
		throw new Error('Could not reach the API. Check its URL, that it is running, and its CORS settings.');
	}
	if (!response.ok) {
		const text = await response.text();
		let message = '';
		try {
			const error: unknown = JSON.parse(text);
			if (error && typeof error === 'object') {
				const details = error as Record<string, unknown>;
				if (typeof details.detail === 'string') message = details.detail;
				else if (typeof details.title === 'string') message = details.title;
			}
		} catch { /* A non-JSON error may not be safe to display. */ }
		throw new Error(message || `API request failed (${response.status} ${response.statusText}).`);
	}
	return response;
}

function parseNote(value: unknown): Note {
	if (!value || typeof value !== 'object') throw new Error('Unexpected note format from the API.');
	const note = value as Record<string, unknown>;
	const id = note.id ?? note.Id;
	const title = note.title ?? note.Title;
	const body = note.body ?? note.Body;
	if (typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string') {
		throw new Error('Unexpected note format from the API. Expected id, title, and body.');
	}
	return { id, title, body };
}

const json = (method: string, data: NoteInput): RequestInit => ({
	method,
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify(data),
});

export const api = {
	async list(): Promise<Note[]> {
		const response = await request(notesUrl);
		const data: unknown = await response.json();
		if (!Array.isArray(data)) throw new Error('Unexpected response from the API. Expected an array of notes.');
		return data.map(parseNote);
	},
	async create(note: NoteInput): Promise<void> { await request(notesUrl, json('POST', note)); },
	async update(id: string, note: NoteInput): Promise<void> { await request(`${notesUrl}/${encodeURIComponent(id)}`, json('PUT', note)); },
	async remove(id: string): Promise<void> { await request(`${notesUrl}/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
};
