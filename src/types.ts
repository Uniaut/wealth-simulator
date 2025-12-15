export interface MarketDataPoint {
    month: number;
    price: number;
    returnPct: number;
}

export type RebalancingStrategy = 'FIXED' | 'GLIDE_CASH' | 'GLIDE_LEVERAGE';

export interface SimulationParams {
    initialCapital: number;
    monthlyContribution: number;
    // Strategy Params
    strategy: RebalancingStrategy;
    startRatio: number; // Cash % or Leverage X
    endRatio: number;
    borrowCost: number; // Annual %

    marketData: MarketDataPoint[];
}

export interface SimulationStep {
    month: number;
    totalValue: number;
    cashValue: number;
    assetValue: number;
    assetPrice: number;
    contributionTotal: number;
    targetRatio: number; // For visualization
}
