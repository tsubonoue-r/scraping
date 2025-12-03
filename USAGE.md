# Web Scraping Tool - 使い方

企業名のCSVファイルから、ホームページURLとお問い合わせメールアドレスを自動取得するツールメン！

## 使用方法

### 1. 入力CSVファイルを準備

```csv
企業名
株式会社サンプル
Google
Microsoft
```

### 2. スクレイピング実行

```bash
npm run dev input.csv output.csv
```

または引数なしで実行（デフォルトで input.csv -> output.csv）

```bash
npm run dev
```

### 3. 結果を確認

output.csvに以下の形式で出力されるメン：

```csv
企業名,ホームページURL,お問い合わせメールアドレス
株式会社サンプル,https://example.com,info@example.com
Google,https://google.com,contact@google.com
Microsoft,https://microsoft.com,support@microsoft.com
```

## 機能

- ✅ 企業名からホームページURLを自動検索
- ✅ ホームページからお問い合わせメールアドレスを自動抽出
- ✅ お問い合わせページも自動で探索
- ✅ 進捗状況をリアルタイム表示
- ✅ 統計情報を表示

## 注意事項

- Google検索のスクレイピングは制限される可能性があるメン
- スクレイピングはマナーを守って1秒ずつ待機するメン
- 大量のリクエストは避けるべきメン
