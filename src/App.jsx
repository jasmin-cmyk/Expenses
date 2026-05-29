import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Dashboard from './Dashboard'
import Transactions from './Transactions'
import Analytics from './Analytics'
import TransactionModal from './TransactionModal'
import { YEARS, MONTHS } from './useStore'

const TABS = [
  { id: 'dashboard',     label: 'Dashboard', icon: '◈' },
  { id: 'transactions',  label: 'Transactions', icon: '≡' },
  { id: 'analytics',     label: 'Analytics', icon: '◎' },
]

const now = new Date()

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [dark, setDark] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  const openAdd = () => { setEditing(null); setModal(true) }
  const openEdit = (tx) => { setEditing(tx); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  return (
    <div className={`min-h-screen ${dark ? '' : 'light'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${dark ? 'bg-navy-900/80 border-white/[0.06]' : 'bg-slate-50/90 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent leading-tight">
              KJ's Expense Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Year selector */}
            <select
              className={`text-xs rounded-lg px-2 py-1.5 border font-mono transition-all focus:outline-none ${
                dark
                  ? 'bg-navy-700/80 border-white/10 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className={`p-1.5 rounded-lg text-sm transition-all ${dark ? 'bg-white/[0.07] hover:bg-white/10 text-yellow-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
              title="Toggle theme"
            >{dark ? '☀️' : '🌙'}</button>

            <button className="btn-primary hidden sm:block text-xs" onClick={openAdd}>+ Add</button>
          </div>
        </div>

        {/* Tab nav */}
        <div className={`max-w-4xl mx-auto px-4 flex gap-1 pb-3`}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                tab === t.id
                  ? 'text-white'
                  : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="tabBg"
                  className="absolute inset-0 bg-accent-blue rounded-lg"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              <span className="relative z-10">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-5 pb-24">
        {tab === 'dashboard' && (
          <Dashboard year={year} month={month} setMonth={setMonth} />
        )}
        {tab === 'transactions' && (
          <Transactions year={year} month={month} onEdit={openEdit} onAdd={openAdd} />
        )}
        {tab === 'analytics' && (
          <Analytics year={year} />
        )}
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={openAdd}
          className="w-13 h-13 rounded-full bg-accent-blue shadow-lg shadow-blue-500/30 flex items-center justify-center text-white text-2xl font-light hover:bg-blue-500 transition-all active:scale-95"
          style={{ width: 52, height: 52 }}
        >+</button>
      </div>

      <TransactionModal open={modal} onClose={closeModal} editing={editing} />
    </div>
  )
}
