import type { MarketDataPoint } from '../types';

/**
 * Generates a Geometric Brownian Motion (GBM) price sequence.
 * @param months Duration in months
 * @param annualMeanReturn Expected annual return (decimal, e.g., 0.10 for 10%)
 * @param annualVolatility Annual volatility (decimal, e.g., 0.15 for 15%)
 * @param initialPrice Starting price
 */
export function generateRandomWalk(
    months: number,
    annualMeanReturn: number = 0.10,
    annualVolatility: number = 0.15,
    initialPrice: number = 100
): MarketDataPoint[] {
    const dt = 1 / 12; // Time step in years (1 month)
    const drift = (annualMeanReturn - 0.5 * Math.pow(annualVolatility, 2)) * dt;
    const vol = annualVolatility * Math.sqrt(dt);

    const data: MarketDataPoint[] = [];
    let currentPrice = initialPrice;

    // Month 0
    data.push({
        month: 0,
        price: currentPrice,
        returnPct: 0
    });

    for (let i = 1; i <= months; i++) {
        const shock = boxMullerTransform();
        const logReturn = drift + vol * shock;
        const newPrice = currentPrice * Math.exp(logReturn);

        // Calculate simple return for the month
        const simpleReturn = (newPrice - currentPrice) / currentPrice;

        data.push({
            month: i,
            price: newPrice,
            returnPct: simpleReturn
        });

        currentPrice = newPrice;
    }

    return data;
}

/**
 * Standard Normal Distribution generator using Box-Muller transform
 */
function boxMullerTransform(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Mock Historical S&P 500 Data
 * For now, returning a static sequence or we could fake it more realistically.
 * Let's create a simple mocked history for demonstration if real API is not used.
 */
export function getMockSP500Data(months: number): MarketDataPoint[] {
    // A simplified mocked sequence typical of S&P 500 behavior (some crashes, general uptrend)
    return generateRandomWalk(months, 0.10, 0.15, 100);
    // Ideally we would load a JSON of real history here. 
    // For this MVP, we can potentially enhance this to satisfy "Mocking/Fetching".
}
