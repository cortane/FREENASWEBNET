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
└── FreeNasWebService.ico  # ファビコン
（外部ストレージ例：T:\\Users\\） # ※このパスはリポジトリ外部。クラウド用HDDやNAS上のユーザーデータ保存先
T:(外部記憶容量装置path)
    ├── T-（username）/
    │   └── UPS/
    │       └── Password.txt(この中にパスワードが記入される、※パスワードがない場合はUPSフォルダ自体が生成されない。)
    ├── T-user1/
    └── T-user2/
```

> **注記:**  
> `T:\Users\`は本リポジトリ内には存在しません。  
> サーバー設定（ROOT_DIR）で指定した「クラウド用HDDやNAS上のユーザーデータ保存先」を指します。  
> 必要に応じてご自身の環境に合わせてパスを設定してください。

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

## 🆕 ファイル内容表示がVSCode風エディタに進化！

- ファイル「内容表示」ボタンで、**Monaco Editor（VSCodeエンジン）**による本格的なエディタUIが利用可能
- **行番号・折り畳み・検索・選択・シンタックスハイライト**すべて対応
- ファイル名の拡張子から自動で言語判定
- 完全なVSCode風の操作感（ただし編集は不可/閲覧専用）
- 推奨ブラウザ: **Google Chrome, Microsoft Edge, Firefox**（モバイルは非推奨）

---

## 🖥️ 使い方（Monaco Editorによる内容表示）

1. ファイル一覧で「内容表示」ボタンをクリック
2. Monaco Editor（VSCode風UI）で内容が表示されます
   - **Ctrl+F**で全文検索
   - **折り畳み**や**行番号ジャンプ**も可能
   - 右上の「…」から各種コマンドも利用可

> **注意:**
> - 編集はできません（閲覧専用）
> - 10MBを超えるファイルは表示できません
> - 画像ファイルは従来通りプレビュー表示されます

---

## ⚠️ パッケージインストール時の注意（index.htmlが無い場合）

まれにnpmパッケージインストール時、`index.html`が正しく含まれない場合があります。

### 対処方法
1. 最新の`index.html`を[GitHubリポジトリ](https://github.com/cortane/FREENASWEBNET)から手動でダウンロード
2. PowerShellまたはコマンドプロンプトで、`index.html`があるディレクトリ（例：NASfolder）に移動
   ```powershell
   cd パス\NASfolder
   ```
3. 下記コマンドでサーバーを起動
   ```bash
   npx freenaswebservice
   ```

これでWeb UIが正しく表示されます。

---

**FreeNAS WebService** - シンプルで強力なWebベースNASシステム 🚀