import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useStore, MONTHS, fmt } from './useStore'

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981']

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

export default function Analytics({ year }) {
  const { transactions } = useStore()

  const yearTx = useMemo(() =>
    transactions.filter(t => new Date(t.date).getFullYear() === year), [transactions, year])

  const monthlyData = useMemo(() =>
    MONTHS.map((label, i) => {
      const tx = yearTx.filter(t => new Date(t.date).getMonth() === i)
      const income  = tx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
      const expense = tx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      const savings = tx.filter(t => t.type === 'savings').reduce((a, t) => a + t.amount, 0)
      return { label, Income: income, Expenses: expense, Savings: savings, Balance: income - expense - savings }
    }), [yearTx])

  const catData = useMemo(() => {
    const cats = {}
    yearTx.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount
    })
    return Object.entries(cats).map(([name, value]) => ({ name, value }))
  }, [yearTx])

  const totals = useMemo(() => ({
    income:  yearTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0),
    expense: yearTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    savings: yearTx.filter(t => t.type === 'savings').reduce((a, t) => a + t.amount, 0),
  }), [yearTx])

  const savingsRate = totals.income > 0 ? ((totals.savings / totals.income) * 100).toFixed(1) : '0.0'
  const expenseRate = totals.income > 0 ? ((totals.expense / totals.income) * 100).toFixed(1) : '0.0'

  const fade = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } })

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Income',   val: fmt(totals.income),  sub: `${year} total`, color: 'text-emerald-400' },
          { label: 'Total Expenses', val: fmt(totals.expense), sub: `${expenseRate}% of income`, color: 'text-red-400' },
          { label: 'Total Savings',  val: fmt(totals.savings), sub: `${savingsRate}% of income`, color: 'text-purple-400' },
          { label: 'Net Balance',    val: fmt(totals.income - totals.expense - totals.savings), sub: 'income - exp - sav', color: totals.income - totals.expense - totals.savings >= 0 ? 'text-cyan-400' : 'text-orange-400' },
        ].map((k, i) => (
          <motion.div key={k.label} className="card-stat" {...fade(i)}>
            <span className="text-xs text-slate-400">{k.label}</span>
            <span className={`font-display font-bold text-base leading-tight ${k.color}`}>{k.val}</span>
            <span className="text-xs text-slate-500">{k.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Net balance trend */}
      <motion.div className="glass p-4" {...fade(4)}>
        <h3 className="font-display font-semibold text-sm text-slate-300 mb-4">Net Balance Trend — {year}</h3>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Balance" stroke="#06b6d4" fill="url(#balGrad)" strokeWidth={2} name="Balance" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Income vs Expense area */}
      <motion.div className="glass p-4" {...fade(5)}>
        <h3 className="font-display font-semibold text-sm text-slate-300 mb-4">Income vs Expenses vs Savings</h3>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              {[['incGrad','#10b981'], ['expGrad','#ef4444'], ['savGrad','#8b5cf6']].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Area type="monotone" dataKey="Income"   stroke="#10b981" fill="url(#incGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Savings"  stroke="#8b5cf6" fill="url(#savGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Expense pie + monthly table */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div className="glass p-4" {...fade(6)}>
          <h3 className="font-display font-semibold text-sm text-slate-300 mb-3">Expenses by Category</h3>
          {catData.length === 0
            ? <p className="text-xs text-slate-500 text-center mt-8">No expense data</p>
            : <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
          }
        </motion.div>

        <motion.div className="glass p-4 overflow-auto" {...fade(7)}>
          <h3 className="font-display font-semibold text-sm text-slate-300 mb-3">Monthly Breakdown</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-white/[0.06]">
                <th className="pb-1.5 text-left font-medium">Month</th>
                <th className="pb-1.5 text-right font-medium text-emerald-500">In</th>
                <th className="pb-1.5 text-right font-medium text-red-500">Exp</th>
                <th className="pb-1.5 text-right font-medium text-purple-500">Sav</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(row => (
                <tr key={row.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-1.5 text-slate-400">{row.label}</td>
                  <td className="py-1.5 text-right font-mono text-emerald-400">{row.Income > 0 ? fmt(row.Income) : '—'}</td>
                  <td className="py-1.5 text-right font-mono text-red-400">{row.Expenses > 0 ? fmt(row.Expenses) : '—'}</td>
                  <td className="py-1.5 text-right font-mono text-purple-400">{row.Savings > 0 ? fmt(row.Savings) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
