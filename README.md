# FreeNAS WebService - Webベースの簡易NASシステム

## 📋 概要

**FreeNAS WebService** は、Node.js で構築された軽量な NAS (Network Attached Storage) 風ファイルブラウザです。シンプルな Web UI を通じて、ファイル管理が可能です。

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

## 🚀 起動方法

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

### 3. ブラウザでアクセス
`http://localhost:3000` にアクセス

## 📦 パッケージ情報

### npmパッケージとして配布
- **パッケージ名**: `freenaswebservice`
- **バージョン**: 1.0.0
- **ライセンス**: MIT
- **Node.js要件**: >=14.0.0
- **対応OS**: Windows, Linux, macOS
- **対応CPU**: x64, x86, arm64

### インストール時の自動設定
- 設定ディレクトリ: `~/.freenaswebservice/`
- 設定ファイル: `~/.freenaswebservice/config.json`
- デフォルトルート: `~/FreeNASWebService/`

## 📋 実装済み機能

### 🔐 認証機能
- **ユーザー登録**: 新規アカウント作成（パスワード任意）
- **ログイン認証**: パスワード付き/なしユーザー対応
- **自動パスワードチェック**: ユーザー名入力時にパスワード必要判定
- **T-プレフィックス**: ユーザー名に自動的に「T-」を付与

### 📁 ファイル管理機能
- **ファイル一覧表示**: 階層構造でのファイル・フォルダ表示
- **ファイルアップロード**: 複数ファイル対応（multiple属性）
- **ファイルダウンロード**: 直接ダウンロード機能
- **ファイル内容表示**: テキストファイルの内容表示、画像ファイルのプレビュー
- **フォルダ作成**: 新しいディレクトリ作成
- **パンくずナビゲーション**: 直感的なフォルダ移動

### 🔄 リアルタイム機能
- **WebSocket通信**: リアルタイムファイル監視
- **自動更新**: ファイル変更の即座通知
- **接続管理**: ユーザーごとの接続状態管理

### 📊 監視・ログ機能
- **アクセスログ**: IP、端末種別（PC/スマホ）、ユーザー、パスワード（2進数変換）
- **サーバー監視**: メモリ使用量、CPU使用率、エラー率監視
- **健全性チェック**: 30秒ごとのサーバー状態確認
- **警告システム**: メモリ使用量500MB以上、エラー率10%以上、接続数100以上で警告

### 🎨 UI機能
- **ダークテーマ**: GitHub風のダークカラーテーマ
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **サイドバー**: ユーザー情報とログアウトボタン
- **カード表示**: ファイル・フォルダのカード形式表示
- **ホバーエフェクト**: インタラクティブな要素

## ⚙️ 設定

### サーバー設定（server.js）
```javascript
const PORT = 3000;           // ポート番号
const ROOT_DIR = "T:\\Users"; // ルートディレクトリ
```

### 監視設定
- **メモリ警告**: 500MB以上
- **エラー率警告**: 10%以上
- **接続数警告**: 100以上
- **健全性チェック間隔**: 30秒
- **ログ出力間隔**: 1時間

## 🔌 API仕様

### 認証API
- `POST /api/check-password` - パスワード必要判定
- `POST /api/register` - ユーザー登録
- `POST /api/login` - ログイン

### ファイル管理API
- `GET /api/files` - ファイル一覧取得
- `GET /api/file-content` - ファイル内容取得（10MB以下）
- `POST /api/upload` - ファイルアップロード（複数対応）
- `GET /api/download` - ファイルダウンロード
- `POST /api/mkdir` - フォルダ作成

### WebSocket API
- 接続: `ws://localhost:3000/?username=T-username`
- メッセージ: `{ type: "update", filename, eventType }`

## 📁 ファイル構造

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
└── T:\Users\              # ユーザーデータ（外部）
    ├── T-Admin/
    │   └── UPS/
    │       └── Password.txt
    ├── T-user1/
    └── T-user2/
```

## 🔒 セキュリティ機能

### 実装済み
- **パスワード暗号化**: 2進数変換による平文保護
- **パス検証**: ディレクトリトラバーサル攻撃防止
- **ファイルサイズ制限**: 10MB以下のファイルのみ内容表示
- **セッション管理**: 安全なログイン状態管理
- **アクセスログ**: 全アクセスの詳細記録

### ログ出力例
```
[2024-06-18T12:34:56.789Z] IP: 192.168.1.2, Device: PC, User: T-Admin, Password(bin): 0110101001100001011100000110000101101110
```

## 🔧 トラブルシューティング

### よくある問題

#### サーバーが起動しない
```bash
# 依存関係を再インストール
npm install

# ポートが使用中の場合
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### ログインできない
```bash
# ユーザーディレクトリ確認
Test-Path "T:\Users\T-username"

# パスワードファイル確認
Get-Content "T:\Users\T-username\UPS\Password.txt"
```

#### ファイルアップロードが失敗
```bash
# ディスク容量確認
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace

# 権限確認
Get-Acl "T:\Users\T-username"
```

### ログ確認
```bash
# アクセスログ確認
Get-Content "access.log" -Tail 20

# サーバーログ確認
Get-Content "server.log" -Tail 20
```

## 📦 必要なパッケージ

- `ws` - WebSocket通信
- `formidable` - ファイルアップロード処理

## 🚀 パッケージ化・配布

### npmパッケージとして公開
```bash
# パッケージの準備
npm pack

# npmに公開（初回のみ）
npm login
npm publish

# バージョン更新
npm version patch
npm publish
```

### グローバルインストール
```bash
# グローバルインストール
npm install -g .

# アンインストール
npm uninstall -g freenaswebservice
```

## 📝 ライセンス

MIT License

---

**FreeNAS WebService** - シンプルで強力なWebベースNASシステム 🚀 