export const MOCK_CASES = [
  {
    case_id: "DP-7K2M-4Q",
    status: "ADMITTED",
    created_at: "2026-10-03T12:00:00Z",
    samples: [
      { sample_id: "S-0195", type: "URINE", state: "COLLECTED", updated_at: new Date(Date.now() - 25 * 60000).toISOString() },
      { sample_id: "S-0196", type: "BLOOD", state: "SEALED", updated_at: new Date(Date.now() - 65 * 60000).toISOString() }
    ]
  }
];

export const MOCK_RELEASE_PACKAGE = {
  case_id: "DP-7K2M-4Q",
  samples: MOCK_CASES[0].samples,
  ledger: [],
  verification: { ok: true, broken_at_seq: null, reason: null, anchor_ok: true }
};

export const MOCK_PATTERNS = [];