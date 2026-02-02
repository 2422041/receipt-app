import { useState, useEffect } from 'react'
import './App.css'
import type { Expense } from './types/expense'

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    // 初回マウント時に LocalStorage から読み込む
    const saved = localStorage.getItem('expenses')
    return saved ? JSON.parse(saved) : []
  })
  
  // フォーム用の入力状態
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('食費')

  // 📦 expenses が変わる度に LocalStorage に保存
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  // 📝 新しい支出を追加する関数
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault() // ページ更新を防ぐ
    if (!title || !amount) return // 空の場合は何もしない

    const newExpense: Expense = {
      id: crypto.randomUUID(), // ブラウザが一意のIDを自動生成
      date: new Date().toISOString().split('T')[0], // 今日の日付 (YYYY-MM-DD)
      title,
      amount: Number(amount),
      category: category
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

  // 🧹 すべての支出を削除する関数
  const clearAllExpenses = () => {
    if (window.confirm('本当にすべての支出を削除しますか？')) {
      setExpenses([])
    }
  }

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0)

  // 📊 カテゴリごとの合計を計算
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)

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
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="食費">食費</option>
          <option value="日用品">日用品</option>
          <option value="交際費">交際費</option>
          <option value="その他">その他</option>
        </select>
        <button type="submit">追加</button>
      </form>

      {/* 表示リスト */}
      <div className="list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2>履歴</h2>
          {expenses.length > 0 && (
            <button onClick={clearAllExpenses} style={{ backgroundColor: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              すべて削除
            </button>
          )}
        </div>
        {expenses.length === 0 ? (
          <p>データがありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* 📅 最新の支出を上に表示（逆順ソート） */}
            {expenses.slice().reverse().map((item) => (
              <li key={item.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {item.date} 
                  {/* カテゴリに色付きのラベルをつける */}
                  <small style={{ marginLeft: '10px', color: '#666', border: '1px solid #ccc', padding: '2px 5px', borderRadius: '4px' }}>
                    {item.category}
                  </small>
                  <strong style={{ marginLeft: '10px' }}>{item.title}</strong>
                </span>
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
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>📊 件数: {expenses.length}件</p>
        
        {/* 📊 カテゴリごとの集計 */}
        {expenses.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <p style={{ margin: '5px 0', color: '#555' }}>カテゴリ別:</p>
            {Object.entries(categoryTotals).map(([cat, total]) => (
              <div key={cat} style={{ marginLeft: '10px', padding: '3px 0' }}>
                <span>{cat}: </span>
                <strong>{(total as number).toLocaleString()} 円</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App