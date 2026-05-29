import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid
} from 'recharts'
import { useStore, MONTHS, fmt, TYPE_META } from './useStore'

const fade = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07 } })

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function Dashboard({ year, month, setMonth }) {
  const { transactions } = useStore()

  const yearTx = useMemo(() =>
    transactions.filter(t => new Date(t.date).getFullYear() === year), [transactions, year])

  const monthTx = useMemo(() =>
    yearTx.filter(t => new Date(t.date).getMonth() === month), [yearTx, month])

  const sum = (txs, type) => txs.filter(t => t.type === type).reduce((a, t) => a + t.amount, 0)
  const sumCat = (txs, cat) => txs.filter(t => t.category === cat).reduce((a, t) => a + t.amount, 0)

  const mIncome   = sum(monthTx, 'income')
  const mExpense  = sum(monthTx, 'expense')
  const mSavings  = sum(monthTx, 'savings')
  const mPersonal = sumCat(monthTx, 'Personal Savings')
  const mSav2     = sumCat(monthTx, 'Savings #2')
  const mBalance  = mIncome - mExpense - mSavings

  const yIncome  = sum(yearTx, 'income')
  const yExpense = sum(yearTx, 'expense')
  const ySavings = sum(yearTx, 'savings')
  const yBalance = yIncome - yExpense - ySavings

  const monthlyData = useMemo(() =>
    MONTHS.map((label, i) => {
      const tx = yearTx.filter(t => new Date(t.date).getMonth() === i)
      return {
        label,
        Income: sum(tx, 'income'),
        Expenses: sum(tx, 'expense'),
        Savings: sum(tx, 'savings'),
      }
    }), [yearTx])

  const stats = [
    { label: 'Monthly Income',    val: mIncome,  color: 'text-emerald-400', icon: '↑' },
    { label: 'Monthly Expenses',  val: mExpense, color: 'text-red-400',     icon: '↓' },
    { label: 'Total Savings',     val: mSavings, color: 'text-purple-400',  icon: '◈' },
    { label: 'Remaining Balance', val: mBalance, color: mBalance >= 0 ? 'text-cyan-400' : 'text-orange-400', icon: '◎' },
  ]

  const yearStats = [
    { label: 'Year Income',   val: yIncome,  color: 'text-emerald-400' },
    { label: 'Year Expenses', val: yExpense, color: 'text-red-400' },
    { label: 'Year Savings',  val: ySavings, color: 'text-purple-400' },
    { label: 'Net Balance',   val: yBalance, color: yBalance >= 0 ? 'text-cyan-400' : 'text-orange-400' },
  ]

  const expByCategory = useMemo(() => {
    const cats = {}
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount
    })
    return Object.entries(cats).sort((a, b) => b[1] - a[1])
  }, [monthTx])

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setMonth(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              month === i
                ? 'bg-accent-blue text-white'
                : 'bg-white/[0.05] text-slate-400 hover:bg-white/10'
            }`}
          >{m}</button>
        ))}
      </div>

      {/* Monthly stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="card-stat" {...fade(i)}>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className={s.color}>{s.icon}</span> {s.label}
            </span>
            <span className={`font-display font-bold text-lg ${s.color}`}>{fmt(s.val)}</span>
          </motion.div>
        ))}
      </div>

      {/* Savings breakdown */}
      <motion.div className="glass p-4" {...fade(4)}>
        <h3 className="font-display font-semibold text-sm text-slate-300 mb-3">
          {MONTHS[month]} Savings Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Personal Savings', val: mPersonal, desc: 'Emergency fund, daily' },
            { label: 'Savings #2',       val: mSav2,     desc: 'Travel, goals, etc.' },
          ].map(s => (
            <div key={s.label} className="bg-purple-500/[0.07] border border-purple-500/20 rounded-xl p-3">
              <p className="text-xs text-purple-300 font-medium">{s.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
              <p className="font-display font-bold text-base text-purple-400 mt-2">{fmt(s.val)}</p>
              {mSavings > 0 && (
                <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500/60"
                    style={{ width: `${(s.val / mSavings) * 100}%` }}
                  />
                </div>
              )}
              {mSavings > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {mSavings > 0 ? Math.round((s.val / mSavings) * 100) : 0}% of savings
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Year overview bar chart */}
      <motion.div className="glass p-4" {...fade(5)}>
        <h3 className="font-display font-semibold text-sm text-slate-300 mb-4">{year} Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="Income"   fill="#10b981" radius={[3,3,0,0]} maxBarSize={24} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[3,3,0,0]} maxBarSize={24} />
            <Bar dataKey="Savings"  fill="#8b5cf6" radius={[3,3,0,0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom: year totals + expense categories */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div className="glass p-4" {...fade(6)}>
          <h3 className="font-display font-semibold text-sm text-slate-300 mb-3">Year Totals</h3>
          <div className="space-y-2.5">
            {yearStats.map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-400">{s.label}</span>
                <span className={`font-mono text-sm font-semibold ${s.color}`}>{fmt(s.val)}</span>
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-white/[0.06] space-y-1.5">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Savings Detail</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">└ Personal Savings</span>
                <span className="font-mono text-xs text-purple-300">{fmt(yearTx.filter(t=>t.category==='Personal Savings').reduce((a,t)=>a+t.amount,0))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">└ Savings #2</span>
                <span className="font-mono text-xs text-purple-300">{fmt(yearTx.filter(t=>t.category==='Savings #2').reduce((a,t)=>a+t.amount,0))}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="glass p-4" {...fade(7)}>
          <h3 className="font-display font-semibold text-sm text-slate-300 mb-3">
            {MONTHS[month]} Expenses by Category
          </h3>
          {expByCategory.length === 0
            ? <p className="text-xs text-slate-500 mt-4 text-center">No expenses this month</p>
            : <div className="space-y-2">
                {expByCategory.map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-red-400 font-mono">{fmt(amt)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500/70"
                        style={{ width: `${(amt / mExpense) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
          }
        </motion.div>
      </div>
    </div>
  )
}
