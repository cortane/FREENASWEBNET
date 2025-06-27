# FreeNAS WebService

---

## 📖 概要

**FreeNAS WebService** は Node.js 製の軽量・高機能なWebベースNASシステムです。直感的なWeb UIでファイル管理・共有が可能です。

---

## 🚀 インストール方法

### グローバルインストール（推奨）
```bash
npm install -g freenaswebservice
```

### ローカルインストール
```bash
npm install freenaswebservice
```

### 手動インストール
```bash
git clone https://github.com/cortane/FREENASWEBNET.git
cd FREENASWEBNET
npm install
```

---

## 🖥️ 起動方法

### グローバルインストール後
```bash
freenaswebservice
```

### ローカルインストール後
```bash
npx freenaswebservice
```

### 手動インストール後
```bash
npm start
# または
node server.js
```

### ブラウザでアクセス
- `http://localhost:3000` にアクセス

---

## 🌐 Tailscale Funnelで外部公開

### Tailscale Funnelとは？
Tailscale Funnelを使うと、インターネット経由で安全に自宅サーバーへアクセスできます。

### 使い方（例: Windows）
1. Tailscaleをインストールし、ログイン
2. サーバーを`0.0.0.0`で起動（デフォルトで対応済み）
3. Funnelを有効化
   ```bash
   tailscale funnel 3000
   # または
   tailscale serve 3000
   ```
4. 表示されたURL（例: `https://xxxx.ts.net/`）にアクセス

#### 注意点
- Funnel有効時はHTTPSでアクセスされます
- ファビコンや静的ファイルも自動でプロキシされます
- セキュリティのため、不要時は`tailscale funnel reset`で停止推奨
- 詳細: [Tailscale公式ドキュメント](https://tailscale.com/kb/1247/funnel-serve-use-cases)

---

## 📦 パッケージ情報
- **パッケージ名**: `freenaswebservice`
- **バージョン**: 1.0.0
- **ライセンス**: MIT
- **Node.js要件**: >=14.0.0
- **対応OS**: Windows, Linux, macOS
- **対応CPU**: x64, x86, arm64

---

## 🛠️ 主な機能

### 🔐 認証
- ユーザー登録（パスワード任意）
- パスワード付き/なしユーザー対応
- ユーザー名自動「T-」付与（ご自身のドライブ大文字を付与してください）
- 自動パスワード要否判定

### 📁 ファイル管理
- 階層型ファイル・フォルダ表示
- 複数ファイルアップロード
- ファイルダウンロード
- テキスト/画像プレビュー
- フォルダ作成
- パンくずナビゲーション

### 🔄 リアルタイム
- WebSocketによるファイル変更即時通知
- ユーザーごとの接続管理

### 📊 監視・ログ
- アクセスログ（IP/端末/ユーザー/パスワード2進数）
- サーバー健全性監視（メモリ/CPU/エラー率/接続数）
- 30秒ごとの健全性チェック
- 警告システム（閾値超過時）

### 🎨 UI
- ダークテーマ
- レスポンシブデザイン
- サイドバー・カード表示
- ホバーエフェクト

---

## ⚙️ サーバー設定例
```js
const PORT = 3000;           // ポート番号
const ROOT_DIR = "T:\\Users"; // ルートディレクトリ（お使いのクラウド用HDDのpathに変更してください。）
```

---

## 🔌 API一覧

### 認証API
- `POST /api/check-password` … パスワード要否判定
- `POST /api/register` … ユーザー登録
- `POST /api/login` … ログイン

### ファイルAPI
- `GET /api/files` … ファイル一覧取得
- `GET /api/file-content` … ファイル内容取得（10MB以下）
- `POST /api/upload` … ファイルアップロード（複数対応）
- `GET /api/download` … ファイルダウンロード
- `POST /api/mkdir` … フォルダ作成

### WebSocket
- 接続: `ws://localhost:3000/?username=T-username`
- メッセージ: `{ type: "update", filename, eventType }`

---

## 📁 ディレクトリ構成例
```
FREENASWEBNET/
├── server.js              # メインサーバーファイル
├── index.html             # フロントエンドUI
├── install.js             # インストールスクリプト
├── package.json           # 依存関係定義
├── README.md              # ドキュメント
├── LICENSE                # ライセンス
├── .gitignore             # Git除外設定
├── access.log             # アクセスログ
├── server.log             # サーバーログ
├── FreeNasWebService.ico  # ファビコン
└── T:\Users\              # ユーザーデータ（外部・お使いのクラウド用HDDの）
    ├── T-Admin/
    │   └── UPS/
    │       └── Password.txt
    ├── T-user1/
    └── T-user2/
```

---

## 🔒 セキュリティ
- パスワード2進数変換による平文保護
- ディレクトリトラバーサル防止
- ファイル内容表示は10MB以下のみ
- セッション管理
- 全アクセス詳細ログ

---

## 🧑‍💻 トラブルシューティング

### サーバーが起動しない
```bash
npm install
# ポート競合時
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ログインできない
```bash
# クラウド専用HDDに「Users」フォルダがあるかご確認ください
Test-Path "T:\Users\T-username"
Get-Content "T:\Users\T-username\UPS\Password.txt"
```

### ファイルアップロード失敗
```bash
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace
Get-Acl "T:\Users\T-username"
```

### ログ確認
```bash
Get-Content "access.log" -Tail 20
Get-Content "server.log" -Tail 20
```

---

## 📦 依存パッケージ
- `ws` … WebSocket通信
- `formidable` … ファイルアップロード

---

## 🚀 パッケージ化・配布

### npmパッケージとして公開
```bash
npm pack
npm login
npm publish
npm version patch
npm publish
```

### グローバルインストール
```bash
npm install -g .
npm uninstall -g freenaswebservice
```

---

## 📝 ライセンス
MIT License

---

**FreeNAS WebService** - シンプルで強力なWebベースNASシステム 🚀