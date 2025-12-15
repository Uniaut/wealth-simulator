import { DollarSign, Calendar, PieChart, TrendingUp, Activity, RefreshCw } from 'lucide-react';
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
        <div className="space-y-8">
            {/* Capital Inputs */}
            <div className="space-y-5">
                <label className="block">
                    <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-400" /> Initial Capital (KRW)
                    </span>
                    <input
                        type="number"
                        value={inputs.initialCapital}
                        onChange={(e) => handleChange('initialCapital', e.target.value)}
                        className="w-full p-4 glass-input rounded-xl text-lg mb-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-indigo-300 font-medium pl-1">
                            {formatKRW(inputs.initialCapital)} 원
                        </span>
                        <div className="flex gap-2">
                            {[10000000, 50000000, 100000000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleChange('initialCapital', (inputs.initialCapital + amount).toString())}
                                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors border border-white/5"
                                >
                                    +{formatKRW(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                </label>

                <label className="block">
                    <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" /> Monthly Contribution (KRW)
                    </span>
                    <input
                        type="number"
                        value={inputs.monthlyContribution}
                        onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                        className="w-full p-4 glass-input rounded-xl text-lg mb-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-indigo-300 font-medium pl-1">
                            {formatKRW(inputs.monthlyContribution)} 원
                        </span>
                        <div className="flex gap-2">
                            {[100000, 500000, 1000000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleChange('monthlyContribution', (inputs.monthlyContribution + amount).toString())}
                                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors border border-white/5"
                                >
                                    +{formatKRW(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                </label>
            </div>

            <div className="h-px bg-white/10 my-6" />

            {/* Strategy Inputs */}
            <div className="space-y-5">
                <label className="block">
                    <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-secondary" /> Allocation Strategy
                    </span>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-black/20 rounded-xl mb-4">
                        {(['FIXED', 'GLIDE_CASH', 'GLIDE_LEVERAGE'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => onChange({ ...inputs, strategy: s })}
                                className={`py-2 text-sm font-medium rounded-lg transition-colors ${inputs.strategy === s
                                    ? 'bg-indigo-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {s === 'FIXED' && 'Fixed Cash'}
                                {s === 'GLIDE_CASH' && 'Cash Glide'}
                                {s === 'GLIDE_LEVERAGE' && 'Leverage'}
                            </button>
                        ))}
                    </div>

                    {inputs.strategy === 'FIXED' && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 w-24">Target Cash</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={inputs.startRatio}
                                onChange={(e) => handleChange('startRatio', e.target.value)}
                                className="flex-1 accent-indigo-500 h-2 rounded-lg cursor-pointer"
                            />
                            <span className="w-16 text-right font-mono text-indigo-300 text-lg">{inputs.startRatio}%</span>
                        </div>
                    )}

                    {inputs.strategy === 'GLIDE_CASH' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 w-24">Start Cash</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={inputs.startRatio}
                                    onChange={(e) => handleChange('startRatio', e.target.value)}
                                    className="flex-1 accent-indigo-500 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="w-16 text-right font-mono text-indigo-300 text-lg">{inputs.startRatio}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 w-24">End Cash</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={inputs.endRatio}
                                    onChange={(e) => handleChange('endRatio', e.target.value)}
                                    className="flex-1 accent-pink-500 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="w-16 text-right font-mono text-pink-300 text-lg">{inputs.endRatio}%</span>
                            </div>
                        </div>
                    )}

                    {inputs.strategy === 'GLIDE_LEVERAGE' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 w-24">Start Leverage</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={inputs.startRatio}
                                    onChange={(e) => handleChange('startRatio', e.target.value)}
                                    className="flex-1 accent-purple-500 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="w-16 text-right font-mono text-purple-300 text-lg">{inputs.startRatio}x</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 w-24">End Leverage</span>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.1"
                                    value={inputs.endRatio}
                                    onChange={(e) => handleChange('endRatio', e.target.value)}
                                    className="flex-1 accent-purple-500 h-2 rounded-lg cursor-pointer"
                                />
                                <span className="w-16 text-right font-mono text-purple-300 text-lg">{inputs.endRatio}x</span>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <span className="text-sm text-gray-400 w-24">Loan Rate (%)</span>
                                <input
                                    type="number"
                                    value={inputs.borrowCost}
                                    onChange={(e) => handleChange('borrowCost', e.target.value)}
                                    className="w-24 p-2 glass-input rounded-lg text-sm text-right"
                                />
                            </div>
                        </div>
                    )}
                </label>

                <label className="block">
                    <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" /> Duration (Years)
                    </span>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-white min-w-[3ch] text-center">
                                {inputs.durationYears}
                            </span>
                            <input
                                type="range"
                                min="1"
                                max="60"
                                value={inputs.durationYears}
                                onChange={(e) => handleChange('durationYears', e.target.value)}
                                className="flex-1 accent-indigo-500 h-2 rounded-lg cursor-pointer bg-white/10"
                            />
                        </div>

                        <div className="flex gap-2 justify-between">
                            {[5, 10, 20, 30, 40].map((years) => (
                                <button
                                    key={years}
                                    onClick={() => handleChange('durationYears', years.toString())}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${inputs.durationYears === years
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {years}y
                                </button>
                            ))}
                        </div>
                    </div>
                </label>
            </div>

            <div className="h-px bg-white/10 my-6" />

            {/* Market Scenario Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Market Scenario
                    </h3>
                    <button
                        onClick={onRegenerate}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-colors border border-indigo-500/30"
                        title="Generate a new random market sequence with the same parameters"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reroll
                    </button>
                </div>

                <div className="space-y-6">
                    <label className="block">
                        <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" /> Expected Annual Return (%)
                        </span>
                        <input
                            type="number"
                            value={inputs.expectedReturn}
                            onChange={(e) => handleChange('expectedReturn', e.target.value)}
                            step="0.1"
                            className="w-full p-4 glass-input rounded-xl text-lg bg-black/20"
                        />
                    </label>

                    <label className="block">
                        <span className="text-base font-medium text-gray-300 mb-2 block flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" /> Annual Volatility (%)
                        </span>
                        <input
                            type="number"
                            value={inputs.volatility}
                            onChange={(e) => handleChange('volatility', e.target.value)}
                            step="0.1"
                            className="w-full p-4 glass-input rounded-xl text-lg bg-black/20"
                        />
                        <p className="text-sm text-gray-500 mt-2">StDev of returns. S&P 500 is approx 15%.</p>
                    </label>
                </div>
            </div>
        </div>
    );
}
