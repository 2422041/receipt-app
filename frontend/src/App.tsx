import { useState } from 'react'
import './App.css'
import { Expense } from './types/expense'

function App() {
  // 支出リストの状態管理（最初は空）
  const [expenses, setExpenses] = useState<Expense[]>([])

  return (
    <div className="container">
      <h1>💰 レシート支出管理</h1>
      
      <div className="input-section">
        {/* ここに後で入力フォームを作ります */}
        <p>ここにフォームが入る予定</p>
      </div>

      <div className="list-section">
        <h2>履歴</h2>
        {expenses.length === 0 ? (
          <p>データがありません</p>
        ) : (
          <ul>
            {/* ここに後でリストを表示します */}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App