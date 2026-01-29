# 目的

このリポジトリは「レシート支出を記録・集計するWebアプリ」を個人開発しつつ、チーム開発の作法（規約、分割コミット、レビュー前提）を練習する。

## 基本方針

- 小さく作って動かす（常に実行可能な状態を保つ）
- 1コミット=1目的
- 破壊的変更は段階的に行う（移行手順を残す）

## コミット規約

- Conventional Commits準拠：feat/fix/chore/docs/refactor/test
- スコープ例：frontend, docs
- 例：feat(frontend): add expense form

## ブランチ運用（簡易）

- main：常に動作する
- 作業は feature/* ブランチで行い、完了単位でmainへ（ローカルでも可）

## ディレクトリ責務

- frontend/：React + TypeScript（UI/状態管理/永続化）
- docs/：設計資料、意思決定ログ
- scripts/：開発補助スクリプト（後で）

## コーディング規約（初期）

- TypeScriptは strict 前提
- コンポーネントは小さく、ロジックはhooks/utilityへ分離
- データモデルは types/ に集約（例：Expense）
- 永続化は当面フロントのみ（例：LocalStorage/IndexedDB）。将来API化しても移行しやすい設計を意識する

## データ方針（暫定）

- JSONキー：snake_case（将来APIを切っても互換を保つ）
- 日付：YYYY-MM-DD
- 金額：整数（円）

## 進め方（最初のマイルストーン）

- リポジトリ雛形と規約を整備（README/AGENTS/docs）
- frontend雛形（Vite + React + TS）
- Expenseの追加/一覧（LocalStorage等で永続化）
- 集計（期間/カテゴリ）
- UI改善 → （将来）API化/公開