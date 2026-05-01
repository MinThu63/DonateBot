// Simple in-memory database for donations
// In production, replace with SQLite, PostgreSQL, etc.

const donations = [];
const GOAL_AMOUNT = 500; // $500 fundraising goal

export function saveDonation(donation) {
  donations.unshift(donation); // newest first
  return donation;
}

export function getDonations() {
  return donations;
}

export function getStats() {
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonations = donations.length;
  const goalProgress = Math.min((totalAmount / GOAL_AMOUNT) * 100, 100);
  const goalReached = totalAmount >= GOAL_AMOUNT;

  // Group by charity
  const byCharity = {};
  for (const d of donations) {
    if (!byCharity[d.charity]) {
      byCharity[d.charity] = { total: 0, count: 0 };
    }
    byCharity[d.charity].total += d.amount;
    byCharity[d.charity].count += 1;
  }

  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalDonations,
    goalAmount: GOAL_AMOUNT,
    goalProgress: parseFloat(goalProgress.toFixed(1)),
    goalReached,
    byCharity,
  };
}
