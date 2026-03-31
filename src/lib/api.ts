const API_BASE = import.meta.env.PUBLIC_API_URL || 'https://financial-freedom-api.financial-freedom.workers.dev';

export interface StatePayload {
  lang: string;
  currency: string;
  fields: Record<string, string>;
}

export async function createState(payload: StatePayload): Promise<string> {
  const res = await fetch(`${API_BASE}/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create state');
  const data = await res.json();
  return data.id;
}

export async function getState(id: string): Promise<StatePayload | null> {
  const res = await fetch(`${API_BASE}/state/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to get state');
  return res.json();
}

export async function updateState(id: string, payload: StatePayload): Promise<void> {
  const res = await fetch(`${API_BASE}/state/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update state');
}
