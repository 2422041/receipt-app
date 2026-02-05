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
  const [sortOrder, setSortOrder] = useState<'latest' | 'highest' | 'lowest'>('latest') // ソート順序
  const [filterCategory, setFilterCategory] = useState<string | null>(null) // カテゴリフィルタ

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
  const averageAmount = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0
  const maxAmount = expenses.length > 0 ? Math.max(...expenses.map(item => item.amount)) : 0
  const minAmount = expenses.length > 0 ? Math.min(...expenses.map(item => item.amount)) : 0
  
  // 📅 本日の支出を計算
  const today = new Date().toISOString().split('T')[0]
  const todayExpenses = expenses.filter(item => item.date === today)
  const todayTotal = todayExpenses.reduce((sum, item) => sum + item.amount, 0)

  // 🏆 最多カテゴリ（最も件数が多いカテゴリ）を取得
  const categoryCount = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topCategory = expenses.length > 0 
    ? Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] 
    : null

  // 📊 カテゴリごとの合計を計算
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>💰 レシート支出管理</h1>
      
      {/* 📅 本日の支出表示 */}
      <div style={{ backgroundColor: '#fff3cd', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #ffc107' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📍 本日: {todayTotal.toLocaleString()} 円 ({todayExpenses.length}件)</p>
      </div>
      
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
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 🔍 カテゴリフィルタ */}
            {expenses.length > 0 && (
              <select 
                value={filterCategory || ''} 
                onChange={(e) => setFilterCategory(e.target.value || null)}
                style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">すべて表示</option>
                <option value="食費">食費</option>
                <option value="日用品">日用品</option>
                <option value="交際費">交際費</option>
                <option value="その他">その他</option>
              </select>
            )}
            {/* 🔀 ソートボタン */}
            {expenses.length > 0 && (
              <>
                <button 
                  onClick={() => setSortOrder('latest')} 
                  style={{ padding: '5px 8px', fontSize: '12px', backgroundColor: sortOrder === 'latest' ? '#4CAF50' : '#ddd', color: sortOrder === 'latest' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  最新順
                </button>
                <button 
                  onClick={() => setSortOrder('highest')} 
                  style={{ padding: '5px 8px', fontSize: '12px', backgroundColor: sortOrder === 'highest' ? '#4CAF50' : '#ddd', color: sortOrder === 'highest' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  高い順
                </button>
                <button 
                  onClick={() => setSortOrder('lowest')} 
                  style={{ padding: '5px 8px', fontSize: '12px', backgroundColor: sortOrder === 'lowest' ? '#4CAF50' : '#ddd', color: sortOrder === 'lowest' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  安い順
                </button>
              </>
            )}
            {expenses.length > 0 && (
              <button onClick={clearAllExpenses} style={{ backgroundColor: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                すべて削除
              </button>
            )}
          </div>
        </div>
        {expenses.length === 0 ? (
          <p>データがありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* � フィルタリング + ソート */}
            {expenses
              .filter(item => !filterCategory || item.category === filterCategory)
              .slice()
              .sort((a, b) => {
                if (sortOrder === 'highest') return b.amount - a.amount
                if (sortOrder === 'lowest') return a.amount - b.amount
                return 0
              })
              .reverse()
              .map((item) => (
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
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>📊 件数: {expenses.length}件 / 平均: {averageAmount.toLocaleString()} 円</p>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>📈 最高: {maxAmount.toLocaleString()} 円 / 最低: {minAmount.toLocaleString()} 円</p>
        
        {/* 📊 カテゴリごとの集計 */}
        {expenses.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <p style={{ margin: '5px 0', color: '#555' }}>カテゴリ別:</p>
            {topCategory && (
              <div style={{ marginLeft: '10px', padding: '3px 0', marginBottom: '8px' }}>
                <span>🏆 最多: </span>
                <strong>{topCategory}</strong>
                <span style={{ color: '#999', marginLeft: '5px' }}>({categoryCount[topCategory]}件)</span>
              </div>
            )}
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