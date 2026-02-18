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
  const [searchKeyword, setSearchKeyword] = useState('') // 検索キーワード
  const [editingId, setEditingId] = useState<string | null>(null) // 編集中の支出ID
  const [editAmount, setEditAmount] = useState('') // 編集用の金額
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString('ja-JP'))

  // 📦 expenses が変わる度に LocalStorage に保存
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
    setLastUpdated(new Date().toLocaleTimeString('ja-JP'))
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

  // 🧹 フィルタをすべてリセット
  const resetFilters = () => {
    setFilterCategory(null)
    setSearchKeyword('')
    setSortOrder('latest')
  }

  // 🧹 すべての支出を削除する関数
  const clearAllExpenses = () => {
    if (window.confirm('本当にすべての支出を削除しますか？')) {
      setExpenses([])
    }
  }

  // ✏️ 支出の金額を編集する関数
  const updateExpenseAmount = (id: string, newAmount: number) => {
    setExpenses(expenses.map(item => 
      item.id === id ? { ...item, amount: newAmount } : item
    ))
    setEditingId(null)
    setEditAmount('')
  }

  // 🧹 入力フォームをリセット
  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('食費')
  }

  // 📅 本日の支出をすべて削除する関数
  const clearTodayExpenses = () => {
    if (window.confirm('本日の支出をすべて削除しますか？')) {
      setExpenses(expenses.filter(item => item.date !== today))
    }
  }

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0)
  const averageAmount = expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0
  const maxAmount = expenses.length > 0 ? Math.max(...expenses.map(item => item.amount)) : 0
  const minAmount = expenses.length > 0 ? Math.min(...expenses.map(item => item.amount)) : 0
  
  // 🔴 最高額と最低額の支出項目を取得
  const maxExpense = expenses.find(item => item.amount === maxAmount)
  const minExpense = expenses.find(item => item.amount === minAmount)
  
  // 📅 本日の支出を計算
  const today = new Date().toISOString().split('T')[0]
  const todayExpenses = expenses.filter(item => item.date === today)
  const todayTotal = todayExpenses.reduce((sum, item) => sum + item.amount, 0)

  // 📅 昨日の支出を計算
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const yesterdayExpenses = expenses.filter(item => item.date === yesterday)
  const yesterdayTotal = yesterdayExpenses.reduce((sum, item) => sum + item.amount, 0)

  // 📊 今週の支出を計算（過去7日間）
  const weekStart = new Date(Date.now() - 604800000).toISOString().split('T')[0]
  const weekExpenses = expenses.filter(item => item.date >= weekStart)
  const weekTotal = weekExpenses.reduce((sum, item) => sum + item.amount, 0)
  const weekAveragePerDay = weekExpenses.length > 0 ? Math.round(weekTotal / 7) : 0

  // 📅 今月の支出を計算
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const monthExpenses = expenses.filter(item => item.date >= monthStart)
  const monthTotal = monthExpenses.reduce((sum, item) => sum + item.amount, 0)
  
  // 📊 月間の1日あたりの平均支出を計算
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const daysPassed = new Date().getDate()
  const monthAveragePerDay = Math.round(monthTotal / daysPassed)
  
  // 📈 月末までの予想支出を計算
  const daysRemaining = daysInMonth - daysPassed
  const projectedMonthTotal = monthTotal + (monthAveragePerDay * daysRemaining)

  // 📅 昨月の支出を計算
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  const lastMonthStart = lastMonth.toISOString().split('T')[0]
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
  const lastMonthExpenses = expenses.filter(item => item.date >= lastMonthStart && item.date <= lastMonthEnd)
  const lastMonthTotal = lastMonthExpenses.reduce((sum, item) => sum + item.amount, 0)

  // 📅 日別の支出を集計してトップ3を取得
  const dailyAmount = expenses.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)
  const top3Days = Object.entries(dailyAmount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // 🏆 最多カテゴリ（最も件数が多いカテゴリ）を取得
  const categoryCount = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topCategory = expenses.length > 0 
    ? Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] 
    : null

  // 📊 フィルタ済みの統計を計算
  const filteredExpenses = expenses.filter(item => !filterCategory || item.category === filterCategory)
  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0)
  const filteredAverage = filteredExpenses.length > 0 ? Math.round(filteredTotal / filteredExpenses.length) : 0
  
  // 🔍 検索後の支出を計算
  const searchedExpenses = filteredExpenses.filter(item => item.title.toLowerCase().includes(searchKeyword.toLowerCase()))

  // 📊 カテゴリごとの合計を計算
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>💰 レシート支出管理</h1>
      <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>⏰ 最新更新: {lastUpdated}</p>
      
      {/* 📅 本日と昨日の支出表示 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#fff3cd', padding: '10px 15px', borderRadius: '8px', borderLeft: '4px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📍 本日: {todayTotal.toLocaleString()} 円</p>
          {todayExpenses.length > 0 && (
            <button onClick={clearTodayExpenses} style={{ fontSize: '11px', backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}>
              クリア
            </button>
          )}
        </div>
        <div style={{ backgroundColor: '#e8f5e9', padding: '10px 15px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📅 昨日: {yesterdayTotal.toLocaleString()} 円</p>
        </div>
      </div>

      {/* 📊 今週の支出表示 */}
      <div style={{ backgroundColor: '#e3f2fd', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #2196f3' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📈 今週: {weekTotal.toLocaleString()} 円 ({weekExpenses.length}件)</p>
        <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>1日平均: {weekAveragePerDay.toLocaleString()} 円</p>
      </div>

      {/* 📅 今月の支出表示 */}
      <div style={{ backgroundColor: '#f3e5f5', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #9c27b0' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📊 今月: {monthTotal.toLocaleString()} 円 ({monthExpenses.length}件)</p>
        <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>1日平均: {monthAveragePerDay.toLocaleString()} 円</p>
        {daysRemaining > 0 && (
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#9c27b0', fontWeight: 'bold' }}>📈 月末予想: {Math.round(projectedMonthTotal).toLocaleString()} 円</p>
        )}
      </div>

      {/* 📅 昨月の支出表示 */}
      <div style={{ backgroundColor: '#fce4ec', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #e91e63' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>📊 昨月: {lastMonthTotal.toLocaleString()} 円 ({lastMonthExpenses.length}件)</p>
        {monthTotal > 0 && lastMonthTotal > 0 && (
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            比較: {monthTotal > lastMonthTotal ? '↑' : '↓'} {Math.abs(monthTotal - lastMonthTotal).toLocaleString()} 円
          </p>
        )}
      </div>
      
      {/* 入力フォーム */}
      <form onSubmit={addExpense} style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
        {/* 🧹 フォームリセットボタン */}
        <button type="button" onClick={resetForm} style={{ backgroundColor: '#9e9e9e', color: 'white' }}>リセット</button>
      </form>

      {/* 🔍 検索ボックス */}
      {expenses.length > 0 && (
        <input 
          type="text" 
          placeholder="🔍 支出名で検索..." 
          value={searchKeyword} 
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      )}

      {/* 表示リスト */}
      <div className="list-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h2 style={{ display: 'inline' }}>履歴</h2>
            {searchedExpenses.length > 0 && (searchKeyword || filterCategory) && (
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666', backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '4px' }}>
                {searchedExpenses.length}/{expenses.length} 件
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* � フィルタ後の統計表示 */}
            {filterCategory && filteredExpenses.length > 0 && (
              <div style={{ fontSize: '12px', color: '#555', padding: '5px 10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                <strong>{filterCategory}</strong>: {filteredTotal.toLocaleString()} 円 ({filteredExpenses.length}件) / 平均: {filteredAverage.toLocaleString()} 円
              </div>
            )}
            {/* �🔍 カテゴリフィルタ */}
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
                {/* 🔄 フィルタリセットボタン */}
                {(filterCategory || searchKeyword || sortOrder !== 'latest') && (
                  <button 
                    onClick={resetFilters}
                    style={{ padding: '5px 8px', fontSize: '12px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    フィルタリセット
                  </button>
                )}
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
            {/* 🔍 フィルタリング + 検索 + ソート */}
            {expenses
              .filter(item => !filterCategory || item.category === filterCategory)
              .filter(item => item.title.toLowerCase().includes(searchKeyword.toLowerCase()))
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
                  <span style={{ marginRight: '10px' }}>
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editAmount} 
                        onChange={(e) => setEditAmount(e.target.value)}
                        style={{ width: '80px', padding: '5px', marginRight: '5px' }}
                      />
                    ) : (
                      <span>{item.amount.toLocaleString()} 円</span>
                    )}
                  </span>
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => updateExpenseAmount(item.id, Number(editAmount))} style={{ color: 'green', marginRight: '5px' }}>保存</button>
                      <button onClick={() => setEditingId(null)} style={{ color: 'gray' }}>キャンセル</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(item.id); setEditAmount(item.amount.toString()); }} style={{ color: 'blue', marginRight: '5px' }}>編集</button>
                      <button onClick={() => deleteExpense(item.id)} style={{ color: 'red' }}>削除</button>
                    </>
                  )}
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
        {expenses.length > 0 && (
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
            🔴 {maxExpense?.title} ({maxExpense?.amount.toLocaleString()}円) / 🔵 {minExpense?.title} ({minExpense?.amount.toLocaleString()}円)
          </p>
        )}
        
        {/* 📊 カテゴリごとの集計 */}
        {expenses.length > 0 && (
          <div style={{ marginTop: '15px', fontSize: '14px' }}>
            <p style={{ margin: '10px 0', color: '#555', fontWeight: 'bold' }}>🏆 支出が多かった日:</p>
            {top3Days.map(([date, amount], index) => (
              <div key={date} style={{ marginLeft: '10px', padding: '3px 0', fontSize: '12px' }}>
                <span>{index + 1}位: {date} - </span>
                <strong>{(amount as number).toLocaleString()} 円</strong>
              </div>
            ))}
          </div>
        )}
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
      </div>
  )
}

export default App