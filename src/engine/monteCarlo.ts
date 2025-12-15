import type { SimulationParams } from '../types';
import { generateRandomWalk } from './generators';
import { runSimulation } from './simulator';

export interface MonteCarloResult {
    finalValues: number[];
    benchmarkExcedanceFreq: number; // % of times portfolio beat benchmark
    medianBenchmarkReturn: number;
}

export function runMonteCarlo(
    baseParams: Omit<SimulationParams, 'marketData'>,
    iterations: number,
    durationYears: number,
    expectedReturnInfo: { mean: number; volatility: number }
): MonteCarloResult {
    const finalValues: number[] = [];
    let beatBenchmarkCount = 0;
    const benchmarkReturns: number[] = [];

    const months = durationYears * 12;

    for (let i = 0; i < iterations; i++) {
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
            marketData // Override with new data
        });

        // 3. Store final portfolio value
        if (results.length > 0) {
            const final = results[results.length - 1];
            finalValues.push(final.totalValue);

            // Benchmark Comparison (Lump sum logic or same contribution?)
            // To be fair, Benchmark should follow the same contribution pattern but 100% in Asset.
            // Let's approximate Benchmark as 100% Asset Allocation with same contributions.

            // Actually, we can just run a "Benchmark Simulation" efficiently here?
            // Or simpler: Compare geometric return?

            // Let's do a quick calculation for 100% Asset strategy on this data.
            // We can reuse runSimulation!
            // But that doubles compute.

            // Optimized Benchmark Calc:
            // Just accumulate contributions * growth.
            let benchValue = baseParams.initialCapital;
            let benchContributionTotal = baseParams.initialCapital;

            for (let j = 0; j < marketData.length; j++) {
                benchValue *= (1 + marketData[j].returnPct);
                benchValue += baseParams.monthlyContribution;
                benchContributionTotal += baseParams.monthlyContribution;
            }

            const benchProfit = benchValue - benchContributionTotal;
            const portProfit = final.totalValue - final.contributionTotal;

            if (portProfit > benchProfit) {
                beatBenchmarkCount++;
            }

            benchmarkReturns.push((benchProfit / benchContributionTotal) * 100);
        }
    }

    // Sort benchmark returns to find median
    benchmarkReturns.sort((a, b) => a - b);
    const medianBenchmarkReturn = benchmarkReturns[Math.floor(benchmarkReturns.length / 2)];

    return {
        finalValues,
        benchmarkExcedanceFreq: (beatBenchmarkCount / iterations) * 100,
        medianBenchmarkReturn
    };
}
