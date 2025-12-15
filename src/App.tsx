import { useState, useEffect, useMemo } from 'react';
import { LineChart, Calculator, TrendingUp, AlertCircle, BarChart3, Play } from 'lucide-react';
import { SimulatorForm, type SimulatorInputs } from './components/SimulatorForm';
import { ResultsChart } from './components/ResultsChart';
import { generateRandomWalk } from './engine/generators';
import { runSimulation } from './engine/simulator';
import type { SimulationStep } from './types';
import { DEFAULT_INPUTS_KRW } from './constants/defaults';
import { formatKRW } from './utils/formatters';
import { runMonteCarlo } from './engine/monteCarlo';
import { calculateHistogram, calculatePercentiles, type HistogramBin, type SimulationStats } from './utils/statistics';
import { MonteCarloChart } from './components/MonteCarloChart';
import { generateMonteCarloPaths, type MonteCarloPathsResult } from './engine/monteCarloPaths';
import { MonteCarloPathsChart } from './components/MonteCarloPathsChart';

function App() {
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULT_INPUTS_KRW);

  const [results, setResults] = useState<SimulationStep[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Monte Carlo State
  const [mcStats, setMcStats] = useState<SimulationStats | null>(null);
  const [mcBins, setMcBins] = useState<HistogramBin[]>([]);
  const [mcPathsResult, setMcPathsResult] = useState<MonteCarloPathsResult | null>(null);
  const [isMcRunning, setIsMcRunning] = useState(false);

  // View Toggle
  const [mcViewMode, setMcViewMode] = useState<'HISTOGRAM' | 'PATHS'>('HISTOGRAM');

  const handleRegenerate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRunMonteCarlo = () => {
    setIsMcRunning(true);
    // Small timeout to allow UI to show loading state
    setTimeout(() => {
      const { finalValues, benchmarkExcedanceFreq, medianBenchmarkReturn } = runMonteCarlo(
        inputs,
        10000,
        inputs.durationYears,
        { mean: inputs.expectedReturn, volatility: inputs.volatility }
      );

      const stats = calculatePercentiles(finalValues);
      stats.benchmarkWinRate = benchmarkExcedanceFreq;
      stats.medianBenchmarkReturn = medianBenchmarkReturn;

      const bins = calculateHistogram(finalValues, 25);

      // 2. Run 50 for Paths Visualization
      const pathsRes = generateMonteCarloPaths(
        inputs,
        50,
        inputs.durationYears,
        { mean: inputs.expectedReturn, volatility: inputs.volatility }
      );

      setMcStats(stats);
      setMcBins(bins);
      setMcPathsResult(pathsRes);
      setIsMcRunning(false);
    }, 100);
  };

  // Run simulation whenever inputs change debounced or immediately
  useEffect(() => {
    if (inputs.durationYears <= 0 || inputs.initialCapital < 0) return;

    const months = inputs.durationYears * 12;
    // Generate Market Data
    const marketData = generateRandomWalk(
      months,
      inputs.expectedReturn / 100,
      inputs.volatility / 100,
      100
    );

    // Run Simulation
    const simResults = runSimulation({
      initialCapital: inputs.initialCapital,
      monthlyContribution: inputs.monthlyContribution,
      marketData,
      strategy: inputs.strategy,
      startRatio: inputs.startRatio,
      endRatio: inputs.endRatio,
      borrowCost: inputs.borrowCost
    });

    setResults(simResults);
    // Reset MC stats on input change to indicate they might be stale
    // setMcStats(null); 
    // Actually, keeping them might be better for comparison, but technically they are stale.
    // Let's reset for correctness.
    setMcStats(null);
    setMcBins([]);
  }, [inputs, refreshTrigger]);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const final = results[results.length - 1];
    const totalInvested = final.contributionTotal;
    const profit = final.totalValue - totalInvested;
    const roi = (profit / totalInvested) * 100;

    return {
      finalValue: final.totalValue,
      totalInvested,
      profit,
      roi
    };
  }, [results, inputs.durationYears]);

  return (
    <div className="container pb-20">
      <header className="fixed top-0 left-0 right-0 p-6 glass-panel z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Antigravity Wealth
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            DCA & Rebalancing Simulator
          </div>
        </div>
      </header>

      <main className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto px-4">
        {/* Simulator Form */}
        <section className="lg:col-span-4 glass-panel p-8 rounded-3xl h-fit border border-white/10">
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
            <Calculator className="w-6 h-6 text-indigo-400" />
            Configuration
          </h2>
          <SimulatorForm inputs={inputs} onChange={setInputs} onRegenerate={handleRegenerate} />

          <div className="mt-8 p-5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-base text-blue-200 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Simulates {inputs.durationYears} years. Strategy: {inputs.strategy}.
            </p>
          </div>
        </section>

        {/* Results & Charts */}
        <section className="lg:col-span-8 space-y-10">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-xl border-l-4 border-l-indigo-500">
                <p className="text-sm text-gray-400 mb-1">Final Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatKRW(summary.finalValue)}
                </p>
              </div>
              <div className="glass-panel p-5 rounded-xl border-l-4 border-l-emerald-500">
                <p className="text-sm text-gray-400 mb-1">Total Profit</p>
                <p className="text-2xl font-bold text-emerald-400">
                  +{formatKRW(summary.profit)}
                </p>
              </div>
              <div className="glass-panel p-5 rounded-xl border-l-4 border-l-cyan-500">
                <p className="text-sm text-gray-400 mb-1">Total Return</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {summary.roi.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Performance Chart */}
          <div className="glass-panel p-8 rounded-3xl min-h-[500px]">
            <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
              <LineChart className="w-6 h-6 text-indigo-400" />
              Performance Projection (Single Scenario)
            </h3>
            {results.length > 0 ? (
              <ResultsChart data={results} />
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                No Data
              </div>
            )}
          </div>

          {/* Monte Carlo Section */}
          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-pink-400" />
                <div>
                  Monte Carlo Analysis (10,000 Runs)
                  {summary && (
                    <div className="text-xs font-normal text-gray-400 mt-1">
                      Ref: Total Invested <span className="text-indigo-300 font-mono">{formatKRW(summary.totalInvested)}</span>
                    </div>
                  )}
                </div>
              </h3>
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                {mcStats && (
                  <div className="flex bg-black/30 rounded-lg p-1">
                    <button
                      onClick={() => setMcViewMode('HISTOGRAM')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mcViewMode === 'HISTOGRAM' ? 'bg-pink-500 text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Distribution
                    </button>
                    <button
                      onClick={() => setMcViewMode('PATHS')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mcViewMode === 'PATHS' ? 'bg-cyan-500 text-white shadow' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Paths (50)
                    </button>
                  </div>
                )}

                <button
                  onClick={handleRunMonteCarlo}
                  disabled={isMcRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isMcRunning ? 'Running...' : 'Run Simulation'}
                </button>
              </div>
            </div>

            {mcStats ? (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">P10 (Unlucky)</p>
                    <p className="text-lg font-bold text-rose-300">{formatKRW(mcStats.p10)}</p>
                    <p className="text-xs text-rose-500/50 mt-1">Bottom 10%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 ring-1 ring-white/10">
                    <p className="text-sm text-indigo-300 mb-1">P50 (Median)</p>
                    <p className="text-lg font-bold text-white">{formatKRW(mcStats.p50)}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      vs Benchmark: <span className="text-white">{mcStats.medianBenchmarkReturn?.toFixed(1)}%</span>
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">P90 (Lucky)</p>
                    <p className="text-lg font-bold text-emerald-300">{formatKRW(mcStats.p90)}</p>
                    <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[90%]"></div>
                    </div>
                    <p className="text-xs text-emerald-500/50 mt-1">Top 10%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Win Rate</p>
                    <p className={`text-lg font-bold ${mcStats.benchmarkWinRate! >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {mcStats.benchmarkWinRate?.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Beating Market</p>
                  </div>
                </div>

                <div className="h-[400px]">
                  {mcViewMode === 'HISTOGRAM' ? (
                    <MonteCarloChart bins={mcBins} />
                  ) : (
                    <MonteCarloPathsChart
                      paths={mcPathsResult?.paths || []}
                      medianIndex={mcPathsResult?.medianIndex || 0}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
                <p>Click "Run Simulation" to analyze 10,000 possibilities.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
