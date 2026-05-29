import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addTransaction, updateTransaction, CATEGORIES, TYPE_META } from './useStore'

const today = () => new Date().toISOString().split('T')[0]

const empty = { type: 'expense', category: 'Bills', amount: '', note: '', date: today() }

export default function TransactionModal({ open, onClose, editing }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (editing) setForm({ ...editing })
    else setForm({ ...empty, date: today() })
  }, [editing, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleTypeChange = (type) => {
    const firstCat = CATEGORIES[type][0]
    setForm(f => ({ ...f, type, category: firstCat }))
  }

  const submit = () => {
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return
    const tx = { ...form, amount }
    if (editing) updateTransaction(editing.id, tx)
    else addTransaction(tx)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative glass w-full max-w-md p-6 z-10 rounded-2xl"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-white">
                {editing ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={onClose} className="btn-ghost p-1.5 text-slate-400">✕</button>
            </div>

            {/* Type selector */}
            <div className="mb-4">
              <label className="label">Type</label>
              <div className="flex gap-2">
                {Object.entries(TYPE_META).map(([t, m]) => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      form.type === t
                        ? `${m.bg} ${m.text} ${m.border} border`
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₱)</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>

            <div className="mb-5">
              <label className="label">Note (optional)</label>
              <input className="input" placeholder="Description..." value={form.note} onChange={e => set('note', e.target.value)} />
            </div>

            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
              <button className="btn-primary flex-1" onClick={submit}>
                {editing ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
