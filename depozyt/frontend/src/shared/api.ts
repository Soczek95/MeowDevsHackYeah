// Zakładamy, że backend działa na 8000. Jeśli Vite ma proxy, można to zmienić na puste.
const API_URL = '/api'

async function request(endpoint: string, options: RequestInit = {}) {
	const res = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	})

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}))
		throw new Error(errorData.detail?.message || `Błąd HTTP: ${res.status}`)
	}
	return res.json()
}

export const api = {
	// ---- OSOBA POKRZYWDZONA (B) ----
	createCase: (origin: string) => request('/cases', { method: 'POST', body: JSON.stringify({ origin }) }),

	getCaseStatus: (caseId: string, caseKey: string) =>
		request(`/cases/${caseId}/status`, { headers: { 'X-Case-Key': caseKey } }),

	makeDecision: (caseId: string, caseKey: string, decision: string) =>
		request(`/cases/${caseId}/decisions`, {
			method: 'POST',
			headers: { 'X-Case-Key': caseKey },
			body: JSON.stringify({ decision }),
		}),

	// ---- SZPITAL (C) ----
	admitCase: (caseId: string, staff_id: string, hospital_id: string) =>
		request(`/cases/${caseId}/admit`, { method: 'POST', body: JSON.stringify({ staff_id, hospital_id }) }),

	addSample: (caseId: string, type: string, staff_id: string) =>
		request(`/cases/${caseId}/samples`, { method: 'POST', body: JSON.stringify({ staff_id, type }) }),

	addSampleEvent: (sampleId: string, event: string, location: string, staff_id: string) =>
		request(`/samples/${sampleId}/events`, { method: 'POST', body: JSON.stringify({ staff_id, event, location }) }),

	getSampleStatus: (sampleId: string) => request(`/samples/${sampleId}`),

	    // Pobiera listę wszystkich próbek w systemie
    getAllSamples: () => request(`/samples`),

	// ---- POLICJA (C) ----
	getPolicePackage: (token: string) => request(`/release/${token}`),

	// ---- DEMO (SCENA) ----
	resetDemo: () => request('/demo/reset', { method: 'POST' }),

	tamperLedger: (caseId: string, seq: number, field: string, value: string) =>
		request('/demo/tamper', { method: 'POST', body: JSON.stringify({ case_id: caseId, seq, field, value }) }),
}