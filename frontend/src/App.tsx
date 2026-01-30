import { useState } from 'react'
import './App.css'
import type { Expense } from './types/expense'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  // フォーム用の入力状態
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')

  // 📝 新しい支出を追加する関数
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault() // ページ更新を防ぐ
    if (!title || !amount) return // 空の場合は何もしない

    const newExpense: Expense = {
      id: crypto.randomUUID(), // ブラウザが一意のIDを自動生成
      date: new Date().toISOString().split('T')[0], // 今日の日付 (YYYY-MM-DD)
      title,
      amount: Number(amount),
      category: '未分類'
    }

    // 既存の支出リストに新しいものを追加
    setExpenses([...expenses, newExpense])
    
    // 入力欄を空にする
    setTitle('')
    setAmount('')
  }

  // 🗑️ 支出を削除する関数
  const deleteExpense = (id: string) => {
    // IDが一致しない項目だけを残す（つまり、指定したIDは削除される）
    const updatedExpenses = expenses.filter(item => item.id !== id)
    setExpenses(updatedExpenses)
  }

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0)

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
                <div>
                  <span style={{ marginRight: '10px' }}>{item.amount.toLocaleString()} 円</span>
                  {/* 💡 Reactのルール3：クリック時に「関数を実行するよ」と予約する */}
                  <button onClick={() => deleteExpense(item.id)} style={{ color: 'red' }}>削除</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>合計: {totalAmount.toLocaleString()} 円</h2>
      </div>
    </div>
  )
}

export default App