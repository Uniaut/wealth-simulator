import type { SimulationParams, SimulationStep } from '../types';

export function runSimulation(params: SimulationParams): SimulationStep[] {
    const { initialCapital, monthlyContribution, marketData, strategy, startRatio, endRatio, borrowCost } = params;

    // Initialize
    let targetAssetRatio = 0;
    if (strategy === 'GLIDE_LEVERAGE') {
        targetAssetRatio = startRatio; // e.g. 1.5
    } else {
        targetAssetRatio = 1 - (startRatio / 100); // e.g. 0.8 for 20% cash
    }

    let currentTotalValue = initialCapital;
    let currentAssetValue = currentTotalValue * targetAssetRatio;
    let currentCash = currentTotalValue - currentAssetValue;

    let totalContribution = initialCapital;

    const results: SimulationStep[] = [];
    const totalMonths = marketData.length;

    for (let i = 0; i < totalMonths; i++) {
        const market = marketData[i];

        // 1. Calculate Target Ratio for this month (Linear Interpolation)
        let currentTargetAssetRatio = 0;
        const progress = i / (totalMonths - 1 || 1);

        if (strategy === 'FIXED') {
            currentTargetAssetRatio = 1 - (startRatio / 100);
        } else if (strategy === 'GLIDE_CASH') {
            const currentCashPct = startRatio + (endRatio - startRatio) * progress;
            currentTargetAssetRatio = 1 - (currentCashPct / 100);
        } else if (strategy === 'GLIDE_LEVERAGE') {
            currentTargetAssetRatio = startRatio + (endRatio - startRatio) * progress;
        }

        // 2. Asset Growth
        const assetReturn = market.returnPct;
        currentAssetValue *= (1 + assetReturn);

        // 3. Interest Cost (if Leverage)
        if (currentCash < 0) {
            // Annual rate to monthly
            const monthlyRate = borrowCost / 100 / 12;
            const interest = Math.abs(currentCash) * monthlyRate;
            currentCash -= interest;
        }

        // 4. Monthly Contribution
        currentCash += monthlyContribution;
        totalContribution += monthlyContribution;

        // 5. Rebalancing
        currentTotalValue = currentAssetValue + currentCash;
        const targetAssetValue = currentTotalValue * currentTargetAssetRatio;

        // Buy/Sell difference
        const diff = targetAssetValue - currentAssetValue;
        currentAssetValue += diff;
        currentCash -= diff;

        results.push({
            month: market.month,
            totalValue: currentAssetValue + currentCash,
            cashValue: currentCash,
            assetValue: currentAssetValue,
            assetPrice: market.price,
            contributionTotal: totalContribution,
            targetRatio: currentTargetAssetRatio,
        });
    }

    return results;
}
