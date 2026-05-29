import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, deleteTransaction, MONTHS, TYPE_META, fmt } from './useStore'

export default function Transactions({ year, month, onEdit, onAdd }) {
  const { transactions } = useStore()
  const [filterType, setFilterType] = useState('all')
  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year &&
        d.getMonth() === month &&
        (filterType === 'all' || t.type === filterType)
    }), [transactions, year, month, filterType])

  const handleDelete = (id) => {
    if (confirmId === id) {
      deleteTransaction(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {['all', 'income', 'expense', 'savings'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterType === t
                  ? t === 'all' ? 'bg-accent-blue text-white'
                    : `${TYPE_META[t].bg} ${TYPE_META[t].text} border ${TYPE_META[t].border}`
                  : 'bg-white/[0.05] text-slate-400 hover:bg-white/10'
              }`}
            >{t}</button>
          ))}
        </div>
        <button className="btn-primary text-xs" onClick={onAdd}>+ Add</button>
      </div>

      <div className="glass overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <h3 className="font-display font-semibold text-sm text-slate-200">
            {MONTHS[month]} Transactions
            <span className="ml-2 text-xs text-slate-500 font-body">({filtered.length})</span>
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-slate-500">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence initial={false}>
              {filtered.map(tx => {
                const meta = TYPE_META[tx.type]
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${meta.bg} ${meta.text} border ${meta.border} shrink-0`}>
                      {meta.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{tx.category}</p>
                      {tx.note && <p className="text-xs text-slate-500 truncate">{tx.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-mono text-sm font-semibold ${meta.text}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors text-xs"
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          confirmId === tx.id
                            ? 'bg-red-500/20 text-red-400'
                            : 'hover:bg-white/10 text-slate-500 hover:text-red-400'
                        }`}
                        title={confirmId === tx.id ? 'Click again to confirm' : 'Delete'}
                      >{confirmId === tx.id ? '⚠️' : '🗑️'}</button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
