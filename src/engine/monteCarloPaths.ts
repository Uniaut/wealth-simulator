import type { SimulationParams, SimulationStep } from '../types';
import { generateRandomWalk } from './generators';
import { runSimulation } from './simulator';

export interface MonteCarloPathsResult {
    paths: SimulationStep[][];
    medianIndex: number;
}

export function generateMonteCarloPaths(
    baseParams: Omit<SimulationParams, 'marketData'>,
    count: number = 50,
    durationYears: number,
    expectedReturnInfo: { mean: number; volatility: number }
): MonteCarloPathsResult {
    const paths: SimulationStep[][] = [];
    const months = durationYears * 12;

    for (let i = 0; i < count; i++) {
        // 1. Generate new independent random market data
        const marketData = generateRandomWalk(
            months,
            expectedReturnInfo.mean / 100,
            expectedReturnInfo.volatility / 100,
            100 // Starting price
        );

        // 2. Run simulation
        const results = runSimulation({
            ...baseParams,
            marketData
        });

        // Store full path
        if (results.length > 0) {
            paths.push(results);
        }
    }

    // Sort paths by final value to identify the median
    paths.sort((a, b) => {
        const lastA = a[a.length - 1].totalValue;
        const lastB = b[b.length - 1].totalValue;
        return lastA - lastB;
    });

    // Middle index
    const medianIndex = Math.floor(paths.length / 2);

    return {
        paths,
        medianIndex
    };
}
