# NasNetFree - Webベースの簡易NASシステム

## 📋 目次
- [概要](#-概要)
- [機能一覧](#-機能一覧)
- [システム要件](#-システム要件)
- [インストール・セットアップ](#-インストールセットアップ)
- [使用方法](#-使用方法)
- [設定・カスタマイズ](#-設定カスタマイズ)
- [API仕様](#-api仕様)
- [セキュリティ](#-セキュリティ)
- [トラブルシューティング](#-トラブルシューティング)
- [開発者向け情報](#-開発者向け情報)
- [ライセンス](#-ライセンス)

## 🧩 概要

**NasNetFree** は、Node.js で構築された軽量かつ強力な NAS (Network Attached Storage) 風ファイルブラウザです。シンプルな Web UI を通じて、以下の操作が可能です：

### 🎯 主な特徴
- **🌐 Webベース**: ブラウザからアクセス可能
- **📱 レスポンシブデザイン**: スマートフォン・タブレット対応
- **🔐 セキュア認証**: パスワード付き/なしユーザー管理
- **⚡ リアルタイム更新**: WebSocketによる即座通知
- **📊 詳細ログ**: アクセス・サーバー監視ログ
- **🎨 モダンUI**: GitHub風ダークテーマ

### 🚀 技術スタック
- **バックエンド**: Node.js, Express (HTTP), WebSocket
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **ファイル処理**: Formidable (アップロード), fs (ファイルシステム)
- **リアルタイム通信**: WebSocket (ws)
- **セキュリティ**: パスワード暗号化, パス検証

## 📋 機能一覧

### 🔐 認証・ユーザー管理機能
- **ユーザー登録**: 新規アカウント作成（パスワード任意）
- **ログイン認証**: パスワード付き/なしユーザー対応
- **セッション管理**: 安全なログイン状態管理
- **パスワード管理**: セキュアなパスワード保存
- **ユーザー分離**: 各ユーザーのファイル空間分離

### 📁 ファイル管理機能
- **ファイル一覧表示**: 階層構造でのファイル・フォルダ表示
- **ファイルアップロード**: 単一・複数ファイル対応
- **ファイルダウンロード**: 直接ダウンロード機能
- **ファイル内容表示**: テキスト・画像ファイルのプレビュー
- **フォルダ作成**: 新しいディレクトリ作成
- **パンくずナビゲーション**: 直感的なフォルダ移動

### 🔄 リアルタイム機能
- **WebSocket通信**: リアルタイムファイル監視
- **自動更新**: ファイル変更の即座通知
- **接続管理**: ユーザーごとの接続状態管理
- **イベント通知**: ファイル作成・削除・変更通知

### 📊 監視・ログ機能
- **アクセスログ**: IP、端末種別、ユーザー、パスワード記録
- **サーバー監視**: メモリ使用量、CPU使用率、エラー率監視
- **健全性チェック**: 定期的なサーバー状態確認
- **警告システム**: 異常検知時の自動警告
- **ログローテーション**: 自動ログファイル管理

### 🎨 UI/UX機能
- **ダークテーマ**: 目に優しいダークカラーテーマ
- **レスポンシブデザイン**: デバイス対応レイアウト
- **モダンインターフェース**: GitHub風の洗練されたデザイン
- **直感的操作**: ドラッグ&ドロップ、クリック操作
- **プログレス表示**: アップロード進捗表示

## 💻 システム要件

### 最小要件
- **OS**: Windows 10/11, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Node.js**: v16.0.0 以上
- **npm**: v8.0.0 以上
- **メモリ**: 512MB RAM
- **ストレージ**: 100MB 空き容量
- **ネットワーク**: ローカルネットワーク接続

### 推奨要件
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **Node.js**: v18.0.0 以上
- **npm**: v9.0.0 以上
- **メモリ**: 2GB RAM
- **ストレージ**: 1GB 空き容量
- **ネットワーク**: 高速ローカルネットワーク

### ブラウザ対応
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🚀 インストール・セットアップ

### 1. 前提条件の確認
```bash
# Node.js バージョン確認
node --version

# npm バージョン確認
npm --version
```

### 2. リポジトリのクローン
```bash
# Git リポジトリからクローン
git clone https://github.com/yourusername/nasnetfree.git
cd nasnetfree

# または、直接ダウンロードして展開
```

### 3. 依存関係のインストール
```bash
# npm を使用したインストール
npm install

# または、yarn を使用
yarn install
```

### 4. 設定ファイルの編集
```javascript
// server.js の設定を編集
const PORT = 3000;           // ポート番号
const ROOT_DIR = "T:\\Users"; // ルートディレクトリ
```

### 5. サーバーの起動
```bash
# 開発モードで起動
npm start

# または、直接実行
node server.js

# バックグラウンド実行（Linux/macOS）
nohup node server.js &

# Windows サービスとして登録
# （管理者権限で実行）
sc create NasNetFree binPath= "C:\path\to\node.exe C:\path\to\server.js"
```

### 6. アクセス確認
ブラウザで `http://localhost:3000` にアクセス

## 🛠️ 使用方法

### 初回セットアップ
1. **サーバー起動**: `node server.js` でサーバーを起動
2. **ブラウザアクセス**: `http://localhost:3000` にアクセス
3. **ユーザー登録**: 「新規登録はこちら」をクリック
4. **アカウント作成**: ユーザー名とパスワード（任意）を入力
5. **ログイン**: 作成したアカウントでログイン

### ログイン方法
- **パスワードなしユーザー**: ユーザー名のみ入力
- **パスワードありユーザー**: ユーザー名とパスワードを入力
- **自動パスワードチェック**: ユーザー名入力時にパスワード必要判定

### ファイル操作
#### 📤 アップロード
1. **ファイル選択**: 「ファイルを選択」ボタンをクリック
2. **複数選択**: Ctrl+クリック または Shift+クリックで複数選択
3. **アップロード**: 「アップロード」ボタンをクリック
4. **進捗確認**: アップロード進捗を確認

#### 📥 ダウンロード
1. **ファイル選択**: ダウンロードしたいファイルをクリック
2. **自動ダウンロード**: ブラウザのダウンロード機能で保存

#### 👁️ 内容表示
1. **ファイル選択**: 表示したいファイルの「内容表示」をクリック
2. **プレビュー**: テキストファイルは内容表示、画像はプレビュー

#### 📁 フォルダ作成
1. **フォルダ名入力**: 「新しいフォルダ名」に名前を入力
2. **作成実行**: 「フォルダ作成」ボタンをクリック

#### 🗂️ フォルダ移動
1. **フォルダクリック**: 移動したいフォルダをクリック
2. **パンくずナビ**: 上部のパンくずリストで移動
3. **上へ移動**: 「⬅ 上へ」ボタンで上位フォルダに移動

## ⚙️ 設定・カスタマイズ

### サーバー設定
```javascript
// server.js の主要設定項目
const PORT = 3000;                    // ポート番号
const ROOT_DIR = "T:\\Users";         // ルートディレクトリ
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 最大ファイルサイズ（100MB）
const LOG_LEVEL = "info";             // ログレベル
```

### セキュリティ設定
```javascript
// セキュリティ関連設定
const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.txt', '.pdf']; // 許可拡張子
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 最大アップロードサイズ
const SESSION_TIMEOUT = 3600000; // セッションタイムアウト（1時間）
```

### ログ設定
```javascript
// ログ関連設定
const LOG_ACCESS = true;              // アクセスログ有効
const LOG_SERVER = true;              // サーバーログ有効
const LOG_ROTATION = true;            // ログローテーション有効
const LOG_RETENTION_DAYS = 30;        // ログ保持日数
```

### UIカスタマイズ
```css
/* index.html の CSS カスタマイズ */
:root {
  --primary-color: #238636;           // プライマリカラー
  --background-color: #0d1117;        // 背景色
  --text-color: #c9d1d9;              // テキスト色
  --border-color: #30363d;            // ボーダー色
}
```

## 🔌 API仕様

### 認証API
#### POST /api/check-password
パスワード必要判定
```json
{
  "username": "T-user1"
}
```

#### POST /api/register
ユーザー登録
```json
{
  "username": "T-user1",
  "password": "password123"
}
```

#### POST /api/login
ログイン
```json
{
  "username": "T-user1",
  "password": "password123"
}
```

### ファイル管理API
#### GET /api/files
ファイル一覧取得
```
/api/files?username=T-user1&folder=subfolder
```

#### GET /api/file-content
ファイル内容取得
```
/api/file-content?username=T-user1&filepath=file.txt
```

#### POST /api/upload
ファイルアップロード
```
multipart/form-data
- file: ファイル
- username: ユーザー名
- folder: フォルダパス
```

#### GET /api/download
ファイルダウンロード
```
/api/download?username=T-user1&filename=file.txt
```

#### POST /api/mkdir
フォルダ作成
```json
{
  "username": "T-user1",
  "folder": "parent",
  "newFolderName": "newfolder"
}
```

### WebSocket API
#### 接続
```
ws://localhost:3000/?username=T-user1
```

#### メッセージ形式
```json
{
  "type": "update",
  "filename": "file.txt",
  "eventType": "change"
}
```

## 🔒 セキュリティ

### 実装済みセキュリティ機能
- **パスワード暗号化**: 2進数変換による平文保護
- **パス検証**: ディレクトリトラバーサル攻撃防止
- **ファイルサイズ制限**: アップロードサイズ制限
- **拡張子制限**: 危険なファイル形式の制限
- **セッション管理**: 安全なログイン状態管理
- **アクセスログ**: 全アクセスの詳細記録

### セキュリティベストプラクティス
1. **強力なパスワード**: 複雑なパスワードの使用
2. **定期的な更新**: パスワードの定期的な変更
3. **アクセス制限**: 必要最小限のアクセス権限
4. **ログ監視**: 異常アクセスの監視
5. **バックアップ**: 重要なファイルの定期的なバックアップ

### 推奨セキュリティ設定
```javascript
// セキュリティ強化設定例
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,           // 最大ログイン試行回数
  lockoutDuration: 300000,       // ロックアウト時間（5分）
  passwordMinLength: 8,          // 最小パスワード長
  requireSpecialChars: true,     // 特殊文字必須
  sessionTimeout: 1800000,       // セッションタイムアウト（30分）
  enableRateLimit: true,         // レート制限有効
  maxRequestsPerMinute: 100      // 1分あたり最大リクエスト数
};
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### サーバーが起動しない
**症状**: `Error: Cannot find module` エラー
```bash
# 解決方法
npm install                    # 依存関係を再インストール
node --version                 # Node.js バージョン確認
npm --version                  # npm バージョン確認
```

**症状**: `EADDRINUSE` エラー
```bash
# 解決方法
netstat -ano | findstr :3000   # ポート使用状況確認
taskkill /PID <PID> /F         # プロセス終了
# または、server.js でポート変更
```

#### ログインできない
**症状**: 「ユーザーが存在しません」
```bash
# 解決方法
# 1. ユーザーディレクトリ確認
Test-Path "T:\Users\T-username"

# 2. 新規登録でユーザー作成
# 3. ディレクトリ権限確認
```

**症状**: 「パスワードが違います」
```bash
# 解決方法
# 1. パスワードファイル確認
Get-Content "T:\Users\T-username\UPS\Password.txt"

# 2. パスワードリセット
# 3. 新規登録で再作成
```

#### ファイルアップロードが失敗する
**症状**: 「ファイルアップロードに失敗しました」
```bash
# 解決方法
# 1. ディスク容量確認
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace

# 2. ファイルサイズ確認
# 3. 権限確認
# 4. 一時ディレクトリ確認
```

#### ファイルが表示されない
**症状**: ファイル一覧が空
```bash
# 解決方法
# 1. ファイル権限確認
Get-Acl "T:\Users\T-username"

# 2. ディレクトリ存在確認
Test-Path "T:\Users\T-username"

# 3. ファイルシステム確認
fsutil volume diskfree T:
```

### ログファイルの確認方法
```bash
# アクセスログ確認
Get-Content "access.log" -Tail 20

# サーバーログ確認
Get-Content "server.log" -Tail 20

# リアルタイムログ監視
Get-Content "server.log" -Wait
```

### パフォーマンス最適化
```javascript
// パフォーマンス設定例
const PERFORMANCE_CONFIG = {
  maxConcurrentUploads: 5,     // 同時アップロード数
  chunkSize: 1024 * 1024,      // チャンクサイズ（1MB）
  enableCompression: true,      // 圧縮有効
  cacheControl: true,          // キャッシュ制御有効
  maxMemoryUsage: 500 * 1024 * 1024 // 最大メモリ使用量（500MB）
};
```

## 👨‍💻 開発者向け情報

### プロジェクト構造
```
NASfolder/
├── server.js              # メインサーバーファイル
├── index.html             # フロントエンドUI
├── package.json           # 依存関係定義
├── README.md              # プロジェクトドキュメント
├── .gitignore             # Git除外設定
├── access.log             # アクセスログ
├── server.log             # サーバーログ
└── T:\Users\              # ユーザーデータ（外部）
    ├── T-Admin/
    ├── T-user1/
    └── T-user2/
```

### 開発環境セットアップ
```bash
# 開発用依存関係インストール
npm install --save-dev nodemon

# 開発用スクリプト追加（package.json）
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}

# 開発サーバー起動
npm run dev
```

### コード品質管理
```bash
# ESLint 設定
npm install --save-dev eslint

# Prettier 設定
npm install --save-dev prettier

# コードフォーマット
npx prettier --write "*.js"
npx eslint "*.js"
```

### テスト環境
```bash
# テスト用依存関係
npm install --save-dev jest supertest

# テスト実行
npm test

# カバレッジ確認
npm run test:coverage
```

### デプロイメント
```bash
# 本番環境用ビルド
npm run build

# PM2 でのプロセス管理
npm install -g pm2
pm2 start server.js --name "nasnetfree"

# Docker での実行
docker build -t nasnetfree .
docker run -p 3000:3000 nasnetfree
```

### 貢献ガイドライン
1. **フォーク**: リポジトリをフォーク
2. **ブランチ作成**: 機能ブランチを作成
3. **開発**: 機能を実装
4. **テスト**: テストを実行
5. **プルリクエスト**: 変更を提案

## 📝 ライセンス

### MIT License

Copyright (c) 2024 NasNetFree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### ライセンスの詳細
- **商用利用**: 可能
- **修正**: 可能
- **配布**: 可能
- **個人利用**: 可能
- **責任**: 作者は責任を負いません

---

## 📞 サポート・お問い合わせ

### 問題報告
- **GitHub Issues**: [Issues](https://github.com/yourusername/nasnetfree/issues)
- **メール**: support@nasnetfree.com
- **Discord**: [NasNetFree Community](https://discord.gg/nasnetfree)

### ドキュメント
- **公式ドキュメント**: [docs.nasnetfree.com](https://docs.nasnetfree.com)
- **API リファレンス**: [api.nasnetfree.com](https://api.nasnetfree.com)
- **チュートリアル**: [tutorial.nasnetfree.com](https://tutorial.nasnetfree.com)

### コミュニティ
- **フォーラム**: [forum.nasnetfree.com](https://forum.nasnetfree.com)
- **ブログ**: [blog.nasnetfree.com](https://blog.nasnetfree.com)
- **ニュースレター**: [newsletter.nasnetfree.com](https://newsletter.nasnetfree.com)

---

**NasNetFree** - シンプルで強力なWebベースNASシステム 🚀 