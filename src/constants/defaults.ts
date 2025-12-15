export const DEFAULT_INPUTS_KRW = {
    initialCapital: 10000000,
    monthlyContribution: 500000,
    // Strategy Defaults
    strategy: 'FIXED' as const,
    startRatio: 20, // 20% Cash
    endRatio: 20,
    borrowCost: 5, // 5% Loan Rate

    durationYears: 10,
    expectedReturn: 8,
    volatility: 15,
};
