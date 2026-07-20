export type QualificationFactors = { strategicFit: number; clientNeed: number; buyerAccess: number; valueBudget: number; deliveryFeasibility: number; timing: number; repeatability: number };
const weights: Record<keyof QualificationFactors, number> = { strategicFit: .2, clientNeed: .15, buyerAccess: .15, valueBudget: .15, deliveryFeasibility: .15, timing: .1, repeatability: .1 };

export function scoreOpportunity(factors: QualificationFactors, criticalGateFailed = false) {
  for (const value of Object.values(factors)) if (!Number.isFinite(value) || value < 0 || value > 5) throw new Error("INVALID_FACTOR");
  const score = Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + factors[key as keyof QualificationFactors] * 20 * weight, 0));
  const recommendation = criticalGateFailed || score < 45 ? "Decline" : score < 70 ? "Nurture" : "Pursue";
  return { score, recommendation } as const;
}
