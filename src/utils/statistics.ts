export interface HistogramBin {
    rangeStart: number;
    rangeEnd: number;
    count: number;
    label: string;
}

export interface SimulationStats {
    p10: number; // Worst 10%
    p50: number; // Median
    p90: number; // Best 10%
    min: number;
    max: number;
    // Comparisons
    benchmarkWinRate?: number;
    medianBenchmarkReturn?: number;
}

export function calculatePercentiles(values: number[]): SimulationStats {
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;

    const getPercentile = (p: number) => {
        const index = Math.floor(p * count);
        return sorted[Math.min(index, count - 1)];
    };

    return {
        p10: getPercentile(0.10),
        p50: getPercentile(0.50),
        p90: getPercentile(0.90),
        min: sorted[0],
        max: sorted[count - 1]
    };
}

export function calculateHistogram(values: number[], binCount: number = 20): HistogramBin[] {
    if (values.length === 0) return [];

    const stats = calculatePercentiles(values);
    // Remove extreme outliers for better chart visibility (optional, but let's keep it simple first)
    // Actually, handling outliers is crucial for financial data.
    // Let's us min/max for now.

    const min = stats.min;
    const max = stats.max;
    const range = max - min;
    const step = range / binCount;

    const bins: HistogramBin[] = [];
    for (let i = 0; i < binCount; i++) {
        const start = min + (i * step);
        const end = start + step;
        bins.push({
            rangeStart: start,
            rangeEnd: end,
            count: 0,
            label: `${(start / 100000000).toFixed(1)}~${(end / 100000000).toFixed(1)}억`
        });
    }

    values.forEach(v => {
        let binIndex = Math.floor((v - min) / step);
        if (binIndex >= binCount) binIndex = binCount - 1;
        if (binIndex < 0) binIndex = 0;
        bins[binIndex].count++;
    });

    return bins;
}
