export type Expense = {
  id: string;          // 一意のID（UUIDなど）
  date: string;        // 日付 (YYYY-MM-DD)
  title: string;       // 品目・店名
  amount: number;      // 金額
  category: string;    // カテゴリ（食費、日用品など）
};