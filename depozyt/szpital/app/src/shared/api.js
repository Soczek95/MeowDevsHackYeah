import { MOCK_CASES, MOCK_RELEASE_PACKAGE, MOCK_PATTERNS } from "./mock.js";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "0";

export const hospitalApi = {
  async getCases() {
    if (USE_MOCKS) return MOCK_CASES;
    const res = await fetch("/api/hospital/cases");
    if (!res.ok) throw new Error("Błąd pobierania spraw");
    return res.json();
  },

  async admitCase(caseId, staffId) {
    if (USE_MOCKS) return { success: true, entry_seq: 1 };
    const res = await fetch(`/api/hospital/cases/${caseId}/admit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_id: staffId })
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
};

export const policeApi = {
  async getReleasePackage(token) {
    if (USE_MOCKS) return MOCK_RELEASE_PACKAGE;
    const res = await fetch(`/api/police/release/${token}`);
    if (!res.ok) throw new Error("Nie znaleziono pakietu");
    return res.json();
  }
};