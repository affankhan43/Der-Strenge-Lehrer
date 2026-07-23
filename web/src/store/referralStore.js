import { create } from 'zustand';

function generateCode(email) {
  const base = (email || 'user').split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `DSL-${base}-${suffix}`;
}

function load() {
  try { return JSON.parse(localStorage.getItem('dsl_referral') || '{}'); } catch { return {}; }
}
function save(data) {
  localStorage.setItem('dsl_referral', JSON.stringify(data));
}

export const useReferralStore = create((set, get) => ({
  code: null,
  referrals: [],   // [{name, joinedAt, xpEarned}]
  totalBonus: 0,

  init(user) {
    const stored = load();
    let code = stored.code;
    if (!code) {
      code = generateCode(user?.email);
      const next = { ...stored, code, referrals: stored.referrals || [] };
      save(next);
    }
    const referrals = stored.referrals || [];
    const totalBonus = referrals.length * 50;
    set({ code, referrals, totalBonus });
  },

  /* Simulate adding a referred user (demo only — real impl would use backend) */
  addReferral(name) {
    const stored = load();
    const entry = { name, joinedAt: new Date().toISOString().slice(0, 10), xpEarned: 50 };
    const referrals = [...(stored.referrals || []), entry];
    save({ ...stored, referrals });
    set({ referrals, totalBonus: referrals.length * 50 });
  },
}));
