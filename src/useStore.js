import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'kj_tracker_v1'

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { transactions: [] }
  } catch { return { transactions: [] } }
}

let _listeners = []
let _state = loadData()

const save = (state) => {
  _state = state
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  _listeners.forEach(fn => fn(state))
}

export const addTransaction = (tx) => {
  const newTx = { ...tx, id: Date.now().toString() }
  save({ ..._state, transactions: [newTx, ..._state.transactions] })
}

export const updateTransaction = (id, tx) => {
  save({
    ..._state,
    transactions: _state.transactions.map(t => t.id === id ? { ...t, ...tx } : t)
  })
}

export const deleteTransaction = (id) => {
  save({ ..._state, transactions: _state.transactions.filter(t => t.id !== id) })
}

export const useStore = () => {
  const [state, setState] = useState(_state)
  useEffect(() => {
    _listeners.push(setState)
    return () => { _listeners = _listeners.filter(fn => fn !== setState) }
  }, [])
  return state
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Other Income'],
  expense: ['Bills', 'Extras', 'School Fees', 'Other'],
  savings: ['Personal Savings', 'Savings #2'],
}

export const TYPE_META = {
  income:  { label: 'Income',  color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  expense: { label: 'Expense', color: '#ef4444', bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  savings: { label: 'Savings', color: '#8b5cf6', bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
}

export const YEARS = Array.from({ length: 10 }, (_, i) => 2026 + i)
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const fmt = (n) => `₱${Math.abs(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
