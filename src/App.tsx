import { useState, useEffect, useMemo } from 'react';
import { LineChart, BarChart3, Play, TrendingUp } from 'lucide-react';
import { SimulatorForm, type SimulatorInputs } from './components/SimulatorForm';
import { ResultsChart } from './components/ResultsChart';
import { ResultsDashboard } from './components/ResultsDashboard';
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
  const [mcViewMode, setMcViewMode] = useState<'HISTOGRAM' | 'PATHS'>('HISTOGRAM');

  const handleRegenerate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRunMonteCarlo = () => {
    setIsMcRunning(true);
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

  useEffect(() => {
    if (inputs.durationYears <= 0 || inputs.initialCapital < 0) return;

    const months = inputs.durationYears * 12;
    const marketData = generateRandomWalk(
      months,
      inputs.expectedReturn / 100,
      inputs.volatility / 100,
      100
    );

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
    <div className="container">
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.5rem',
        background: 'rgba(10, 10, 12, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        borderBottom: '1px solid hsla(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '8px', background: 'hsla(var(--primary)/0.2)', borderRadius: '8px' }}>
            <TrendingUp size={24} color="hsl(var(--primary))" />
          </div>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.5rem' }}>Antigravity Wealth</h1>
          </div>
        </div>
      </header>

      <main className="main-layout">
        {/* Sidebar: Configuration */}
        <aside className="glass-panel" style={{ height: 'fit-content' }}>
          <SimulatorForm inputs={inputs} onChange={setInputs} onRegenerate={handleRegenerate} />
        </aside>

        {/* Main Content: Results & Charts */}
        <div className="content-area">
          <ResultsDashboard summary={summary} />

          {/* Performance Chart */}
          <section className="glass-panel mb-lg">
            <div className="section-title">
              <LineChart size={20} color="hsl(var(--primary))" />
              <span>Performance Projection</span>
            </div>
            {results.length > 0 ? (
              <ResultsChart data={results} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                No Data
              </div>
            )}
          </section>

          {/* Monte Carlo Section */}
          <section className="glass-panel">
            <div className="flex-row justify-between mb-lg">
              <div className="section-title" style={{ borderBottom: 'none', marginBottom: 0 }}>
                <BarChart3 size={20} color="hsl(var(--accent-rose))" />
                <span>Monte Carlo Analysis (10k Runs)</span>
              </div>

              <div className="flex-row">
                {mcStats && (
                  <div className="strategy-selector" style={{ marginBottom: 0 }}>
                    <div
                      className={`strategy-option ${mcViewMode === 'HISTOGRAM' ? 'active' : ''}`}
                      onClick={() => setMcViewMode('HISTOGRAM')}
                    >
                      Distribution
                    </div>
                    <div
                      className={`strategy-option ${mcViewMode === 'PATHS' ? 'active' : ''}`}
                      onClick={() => setMcViewMode('PATHS')}
                    >
                      Paths
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRunMonteCarlo}
                  disabled={isMcRunning}
                  className="btn btn-primary"
                >
                  <Play size={16} fill="currentColor" />
                  {isMcRunning ? 'Running...' : 'Run Simulation'}
                </button>
              </div>
            </div>

            {mcStats ? (
              <div className="animate-fade-in">
                {/* MC Stats Grid */}
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'hsla(var(--bg-subtle))', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-sm text-muted" style={{ color: 'hsl(var(--text-muted))' }}>P10 (Unlucky)</div>
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--accent-rose))' }}>{formatKRW(mcStats.p10)}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'hsla(var(--bg-subtle))', borderRadius: 'var(--radius-sm)', border: '1px solid hsla(var(--primary)/0.3)' }}>
                    <div className="text-sm" style={{ color: 'hsl(var(--primary))' }}>P50 (Median)</div>
                    <div className="text-lg font-bold text-white">{formatKRW(mcStats.p50)}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'hsla(var(--bg-subtle))', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>P90 (Lucky)</div>
                    <div className="text-lg font-bold" style={{ color: 'hsl(var(--accent-green))' }}>{formatKRW(mcStats.p90)}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'hsla(var(--bg-subtle))', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-sm" style={{ color: 'hsl(var(--text-muted))' }}>Win Rate</div>
                    <div className={`text-lg font-bold ${mcStats.benchmarkWinRate! >= 50 ? 'text-success' : 'text-danger'}`} style={{ color: mcStats.benchmarkWinRate! >= 50 ? 'hsl(var(--accent-green))' : 'hsl(var(--accent-rose))' }}>
                      {mcStats.benchmarkWinRate?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {mcViewMode === 'HISTOGRAM' ? (
                  <MonteCarloChart bins={mcBins} />
                ) : (
                  <MonteCarloPathsChart
                    paths={mcPathsResult?.paths || []}
                    medianIndex={mcPathsResult?.medianIndex || 0}
                  />
                )}
              </div>
            ) : (
              <div style={{
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'hsla(var(--bg-subtle))',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed hsla(var(--text-muted)/0.2)',
                color: 'hsl(var(--text-muted))'
              }}>
                <BarChart3 size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                <p>Click "Run Simulation" to analyze 10,000 possibilities.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
