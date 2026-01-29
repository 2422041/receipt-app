import { useState } from 'react'
import './App.css'
import { Expense } from './types/expense'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  // フォーム用の入力状態
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    const newExpense: Expense = {
      id: crypto.randomUUID(), // ブラウザ標準機能で一意のIDを生成
      date: new Date().toISOString().split('T')[0], // 今日の日付 (YYYY-MM-DD)
      title,
      amount: Number(amount),
      category: '未分類'
    }

    setExpenses([...expenses, newExpense])
    
    // 入力欄を空にする
    setTitle('')
    setAmount('')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>💰 レシート支出管理</h1>
      
      {/* 入力フォーム */}
      <form onSubmit={addExpense} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="何買った？" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="いくら？" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
        <button type="submit">追加</button>
      </form>

      {/* 表示リスト */}
      <div className="list-section">
        <h2>履歴</h2>
        {expenses.length === 0 ? (
          <p>データがありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {expenses.map((item) => (
              <li key={item.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.date} : <strong>{item.title}</strong></span>
                <span>{item.amount.toLocaleString()} 円</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App