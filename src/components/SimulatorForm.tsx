import { DollarSign, PieChart, Activity, RefreshCw } from 'lucide-react';
import { formatKRW } from '../utils/formatters';

export interface SimulatorInputs {
    initialCapital: number;
    monthlyContribution: number;
    // New Strategy Inputs
    strategy: 'FIXED' | 'GLIDE_CASH' | 'GLIDE_LEVERAGE';
    startRatio: number; // Cash% or Leverage X
    endRatio: number;
    borrowCost: number;

    durationYears: number;
    expectedReturn: number; // Annual %
    volatility: number; // Annual %
}

interface Props {
    inputs: SimulatorInputs;
    onChange: (inputs: SimulatorInputs) => void;
    onRegenerate: () => void;
}

export function SimulatorForm({ inputs, onChange, onRegenerate }: Props) {
    const handleChange = (field: keyof SimulatorInputs, value: string) => {
        const numValue = parseFloat(value);
        onChange({
            ...inputs,
            [field]: isNaN(numValue) ? 0 : numValue,
        });
    };

    return (
        <div>
            {/* Capital Inputs */}
            <div className="section-title">
                <DollarSign size={20} color="hsl(var(--primary))" />
                <span>Capital</span>
            </div>

            <div className="input-group">
                <label className="input-label">Initial Capital (KRW)</label>
                <input
                    type="number"
                    value={inputs.initialCapital}
                    onChange={(e) => handleChange('initialCapital', e.target.value)}
                    className="input-field"
                />
                <div className="flex-row justify-between" style={{ marginTop: '0.5rem' }}>
                    <span className="text-sm" style={{ color: 'hsl(var(--primary))' }}>
                        {formatKRW(inputs.initialCapital)}
                    </span>
                    <div className="flex-row" style={{ gap: '0.5rem' }}>
                        {[10000000, 50000000, 100000000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleChange('initialCapital', (inputs.initialCapital + amount).toString())}
                                className="chip"
                            >
                                +{formatKRW(amount)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Monthly Contribution (KRW)</label>
                <input
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                    className="input-field"
                />
                <div className="flex-row justify-between" style={{ marginTop: '0.5rem' }}>
                    <span className="text-sm" style={{ color: 'hsl(var(--primary))' }}>
                        {formatKRW(inputs.monthlyContribution)}
                    </span>
                    <div className="flex-row" style={{ gap: '0.5rem' }}>
                        {[100000, 500000, 1000000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => handleChange('monthlyContribution', (inputs.monthlyContribution + amount).toString())}
                                className="chip"
                            >
                                +{formatKRW(amount)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-lg"></div>

            {/* Strategy Inputs */}
            <div className="section-title">
                <PieChart size={20} color="hsl(var(--accent-cyan))" />
                <span>Strategy</span>
            </div>

            <div className="input-group">
                <div className="strategy-selector">
                    {(['FIXED', 'GLIDE_CASH', 'GLIDE_LEVERAGE'] as const).map(s => (
                        <div
                            key={s}
                            onClick={() => onChange({ ...inputs, strategy: s })}
                            className={`strategy-option ${inputs.strategy === s ? 'active' : ''}`}
                        >
                            {s === 'FIXED' && 'Fixed Cash'}
                            {s === 'GLIDE_CASH' && 'Cash Glide'}
                            {s === 'GLIDE_LEVERAGE' && 'Leverage'}
                        </div>
                    ))}
                </div>

                {inputs.strategy === 'FIXED' && (
                    <div className="input-group">
                        <div className="flex-row justify-between">
                            <span className="input-label">Target Cash ({inputs.startRatio}%)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={inputs.startRatio}
                            onChange={(e) => handleChange('startRatio', e.target.value)}
                        />
                    </div>
                )}

                {inputs.strategy === 'GLIDE_CASH' && (
                    <>
                        <div className="input-group">
                            <span className="input-label">Start Cash ({inputs.startRatio}%)</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={inputs.startRatio}
                                onChange={(e) => handleChange('startRatio', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <span className="input-label">End Cash ({inputs.endRatio}%)</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={inputs.endRatio}
                                onChange={(e) => handleChange('endRatio', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {inputs.strategy === 'GLIDE_LEVERAGE' && (
                    <>
                        <div className="input-group">
                            <span className="input-label">Start Leverage ({inputs.startRatio}x)</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={inputs.startRatio}
                                onChange={(e) => handleChange('startRatio', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <span className="input-label">End Leverage ({inputs.endRatio}x)</span>
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={inputs.endRatio}
                                onChange={(e) => handleChange('endRatio', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Loan Rate (%)</label>
                            <input
                                type="number"
                                value={inputs.borrowCost}
                                onChange={(e) => handleChange('borrowCost', e.target.value)}
                                className="input-field"
                                style={{ width: '100px' }}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="input-group">
                <span className="input-label">Duration ({inputs.durationYears} Years)</span>
                <input
                    type="range"
                    min="1"
                    max="60"
                    value={inputs.durationYears}
                    onChange={(e) => handleChange('durationYears', e.target.value)}
                />
                <div className="flex-row" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[5, 10, 20, 30, 40].map((years) => (
                        <button
                            key={years}
                            onClick={() => handleChange('durationYears', years.toString())}
                            className="chip"
                            style={{ flex: 1, textAlign: 'center' }}
                        >
                            {years}y
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-lg"></div>

            {/* Market Scenario */}
            <div className="section-title justify-between" style={{ borderBottom: 'none' }}>
                <div className="flex-row">
                    <Activity size={20} color="hsl(var(--accent-rose))" />
                    <span>Market</span>
                </div>
                <button
                    onClick={onRegenerate}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                    <RefreshCw size={14} /> Reroll
                </button>
            </div>

            <div style={{ background: 'hsla(var(--bg-subtle))', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="input-group">
                    <label className="input-label">Expected Return (%)</label>
                    <input
                        type="number"
                        value={inputs.expectedReturn}
                        onChange={(e) => handleChange('expectedReturn', e.target.value)}
                        step="0.1"
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Volatility (%)</label>
                    <input
                        type="number"
                        value={inputs.volatility}
                        onChange={(e) => handleChange('volatility', e.target.value)}
                        step="0.1"
                        className="input-field"
                    />
                    <div className="text-sm" style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
                        Ref: S&P 500 ≈ 15%
                    </div>
                </div>
            </div>
        </div>
    );
}
