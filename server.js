#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");
const WebSocket = require("ws");
const os = require("os");

const PORT = 3000;
const ROOT_DIR = "T:\\Users";

// --- サーバー監視用変数 ---
let serverStartTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let activeConnections = 0;
let memoryUsageHistory = [];
let cpuUsageHistory = [];
let lastHealthCheck = Date.now();

// JSONレスポンス用ヘルパー関数
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 
    "Content-Type": "application/json; charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

// POSTデータ解析
function parsePostData(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (e) {
        // JSONでない場合はクエリパラメータとして解析
        const params = querystring.parse(body);
        resolve(params);
      }
    });
    req.on("error", err => reject(err));
  });
}

// ユーザーディレクトリのパスを取得
function getUserDir(username) {
  // ユーザー名が既に「T-」で始まっている場合はそのまま使用
  const cleanUsername = username.startsWith('T-') ? username : `T-${username}`;
  return path.join(ROOT_DIR, cleanUsername);
}

// パスワードファイルのパスを取得
function getPasswordFile(username) {
  // ユーザー名が既に「T-」で始まっている場合はそのまま使用
  const cleanUsername = username.startsWith('T-') ? username : `T-${username}`;
  return path.join(ROOT_DIR, cleanUsername, "UPS", "Password.txt");
}

// パスワードが必要かチェック
function isPasswordRequired(username) {
  const passwordFile = getPasswordFile(username);
  return fs.existsSync(passwordFile);
}

// ログインページHTML
function loginPage(user, message = "") {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8" /><title>ログイン: ${user}</title></head>
<body>
  <h2>${user}さんのフォルダにアクセスするためログインしてください</h2>
  ${message ? `<p style="color:red;">${message}</p>` : ""}
  <form method="POST" action="/auth?user=${encodeURIComponent(user)}">
    <input type="password" name="pass" placeholder="パスワード" autofocus required>
    <button type="submit">ログイン</button>
  </form>
</body>
</html>`;
}

function showFolderContents(folderPath, baseUrl, res) {
  fs.readdir(folderPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      res.writeHead(500);
      res.end("フォルダ読み込みエラー");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
    res.write(`<h2>📁 ${baseUrl}</h2><ul>`);
    if (baseUrl !== "/") {
      const parentUrl = path.posix.join(baseUrl, "..");
      res.write(`<li><a href="${parentUrl}">⬅ 上へ</a></li>`);
    }

    for (const entry of entries) {
      const name = entry.name;
      const link = path.posix.join(baseUrl, name);
      res.write(`<li><a href="${link}">${name}${entry.isDirectory() ? "/" : ""}</a></li>`);
    }
    res.end("</ul>");
  });
}

// --- WebSocketサーバー追加 ---
const wsServer = new WebSocket.Server({ noServer: true });
// ユーザーごとの接続管理
const userSockets = {};
// ユーザーごとの監視インスタンス管理
const userWatchers = {};

// WebSocket接続時の処理
wsServer.on("connection", (ws, request, user) => {
  if (!user) return;
  if (!userSockets[user]) userSockets[user] = [];
  userSockets[user].push(ws);

  ws.on("close", () => {
    userSockets[user] = userSockets[user].filter(s => s !== ws);
    if (userSockets[user].length === 0 && userWatchers[user]) {
      // 誰も見ていなければ監視を止める
      userWatchers[user].close();
      delete userWatchers[user];
    }
  });

  // 初回接続時に監視開始
  if (!userWatchers[user]) {
    const userDir = getUserDir(user);
    try {
      userWatchers[user] = fs.watch(userDir, { recursive: true }, (eventType, filename) => {
        // 変更があれば全クライアントに通知
        if (userSockets[user]) {
          userSockets[user].forEach(s => {
            if (s.readyState === WebSocket.OPEN) {
              s.send(JSON.stringify({ type: "update", filename, eventType }));
            }
          });
        }
      });
    } catch (e) {
      // 監視失敗（ディレクトリがない等）は無視
    }
  }
});

// --- ログ出力用関数 ---
function passwordToBinary(password) {
  if (!password) return '';
  return password.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function getDeviceType(userAgent) {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad') || ua.includes('mobile')) {
    return 'スマホ';
  }
  return 'PC';
}

function logAccess({ req, username, password }) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const device = getDeviceType(userAgent);
  const pwBin = passwordToBinary(password || '');
  const logLine = `[${new Date().toISOString()}] IP: ${ip}, Device: ${device}, User: ${username || ''}, Password(bin): ${pwBin}\n`;
  fs.appendFile(path.join(__dirname, 'access.log'), logLine, err => { if (err) console.error('ログ書き込み失敗:', err); });
  console.log(logLine.trim());
}

// --- サーバー監視・ログ関数 ---
function logServerEvent(type, message, details = {}) {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const logData = {
    timestamp,
    type,
    message,
    uptime: `${uptime}秒`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    cpu: {
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`
    },
    stats: {
      requestCount,
      errorCount,
      errorRate: requestCount > 0 ? `${((errorCount / requestCount) * 100).toFixed(2)}%` : '0%',
      activeConnections
    },
    details
  };
  
  const logLine = `[${timestamp}] [${type}] ${message} | Uptime: ${logData.uptime} | Memory: ${logData.memory.rss} | CPU: ${logData.cpu.user} | Requests: ${requestCount} | Errors: ${errorCount} | Active: ${activeConnections} | Details: ${JSON.stringify(details)}\n`;
  
  // ログファイルに書き込み
  fs.appendFile(path.join(__dirname, 'server.log'), logLine, err => { 
    if (err) console.error('サーバーログ書き込み失敗:', err); 
  });
  
  // コンソールに出力
  console.log(logLine.trim());
}

// --- サーバー健全性チェック ---
function checkServerHealth() {
  const now = Date.now();
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = memoryUsage.rss / 1024 / 1024;
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  
  // メモリ使用量履歴を更新（最新10件）
  memoryUsageHistory.push(memoryUsageMB);
  if (memoryUsageHistory.length > 10) memoryUsageHistory.shift();
  
  // 警告条件チェック
  const warnings = [];
  
  // メモリ使用量警告（500MB以上）
  if (memoryUsageMB > 500) {
    warnings.push(`メモリ使用量が高い: ${memoryUsageMB.toFixed(1)}MB`);
  }
  
  // エラー率警告（10%以上）
  if (errorRate > 10) {
    warnings.push(`エラー率が高い: ${errorRate.toFixed(2)}%`);
  }
  
  // アクティブ接続数警告（100以上）
  if (activeConnections > 100) {
    warnings.push(`アクティブ接続数が多い: ${activeConnections}`);
  }
  
  // メモリ使用量の急激な増加警告
  if (memoryUsageHistory.length >= 5) {
    const recentAvg = memoryUsageHistory.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const olderAvg = memoryUsageHistory.slice(0, -5).reduce((a, b) => a + b, 0) / 5;
    if (recentAvg > olderAvg * 1.5) {
      warnings.push(`メモリ使用量が急激に増加: ${olderAvg.toFixed(1)}MB → ${recentAvg.toFixed(1)}MB`);
    }
  }
  
  // 警告があればログ出力
  if (warnings.length > 0) {
    logServerEvent('WARNING', 'サーバーが不安定になっています', { warnings });
  }
  
  // 定期的な健全性ログ（1時間ごと）
  if (now - lastHealthCheck > 3600000) {
    logServerEvent('HEALTH', 'サーバー健全性チェック', { 
      memoryUsageMB: memoryUsageMB.toFixed(1),
      errorRate: errorRate.toFixed(2),
      activeConnections
    });
    lastHealthCheck = now;
  }
}

// --- プロセス終了時の処理 ---
process.on('SIGINT', () => {
  logServerEvent('SHUTDOWN', 'サーバーが正常終了します', { reason: 'SIGINT' });
  process.exit(0);
});

process.on('SIGTERM', () => {
  logServerEvent('SHUTDOWN', 'サーバーが終了します', { reason: 'SIGTERM' });
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logServerEvent('CRASH', 'サーバーが予期しないエラーでクラッシュしました', { 
    error: error.message, 
    stack: error.stack,
    reason: 'uncaughtException'
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logServerEvent('CRASH', '未処理のPromise拒否でサーバーが不安定になっています', { 
    reason: reason?.toString() || 'Unknown',
    promise: promise.toString()
  });
});

// --- 定期的な健全性チェック ---
setInterval(checkServerHealth, 30000); // 30秒ごと

const server = http.createServer(async (req, res) => {
  // リクエスト数カウント
  requestCount++;
  activeConnections++;
  
  // 接続終了時の処理
  res.on('close', () => {
    activeConnections--;
  });
  
  // エラーハンドリング
  res.on('error', (error) => {
    errorCount++;
    logServerEvent('ERROR', 'HTTPレスポンスエラー', { 
      error: error.message,
      url: req.url,
      method: req.method
    });
  });
  
  // CORS preflight対応
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // ルートパスでindex.htmlを配信
  if (pathname === "/" || pathname === "/index.html") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        errorCount++;
        logServerEvent('ERROR', 'index.html読み込み失敗', { error: err.message });
        res.writeHead(404);
        res.end("index.html not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
      res.end(data);
    });
    return;
  }

  // ファビコンファイルを配信
  if (pathname === "/FreeNasWebService.ico" || pathname === "/favicon.ico" || pathname === "/icon.ico") {
    fs.readFile("FreeNasWebService.ico", (err, data) => {
      if (err) {
        errorCount++;
        logServerEvent('ERROR', 'ファビコンファイル読み込み失敗', { error: err.message });
        res.writeHead(404);
        res.end("favicon not found");
        return;
      }
      res.writeHead(200, { 
        "Content-Type": "image/x-icon",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(data);
    });
    return;
  }

  // APIエンドポイント
  if (pathname === "/api/check-password" && req.method === "POST") {
    try {
      const data = await parsePostData(req);
      const { username } = data;
      
      console.log(`[DEBUG] check-password called with username: "${username}"`);
      
      if (!username) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名が必要です" });
        return;
      }

      const hasPassword = isPasswordRequired(username);
      console.log(`[DEBUG] User "${username}" hasPassword: ${hasPassword}`);
      sendJsonResponse(res, 200, { hasPassword });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'check-password API エラー', { error: error.message });
      console.error(`[DEBUG] check-password error:`, error);
      sendJsonResponse(res, 500, { error: "サーバーエラー" });
    }
    return;
  }

  if (pathname === "/api/register" && req.method === "POST") {
    try {
      const data = await parsePostData(req);
      const { username, password } = data;
      
      console.log(`[DEBUG] register called with username: "${username}"`);
      
      if (!username) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名が必要です" });
        return;
      }

      const userDir = getUserDir(username);
      console.log(`[DEBUG] User directory path: "${userDir}"`);
      
      // ユーザーディレクトリが既に存在するかチェック
      if (fs.existsSync(userDir)) {
        console.log(`[DEBUG] User directory already exists`);
        errorCount++;
        sendJsonResponse(res, 409, { error: "ユーザーは既に存在します" });
        return;
      }

      console.log(`[DEBUG] Creating user directory: "${userDir}"`);
      // ユーザーディレクトリを作成
      fs.mkdirSync(userDir, { recursive: true });

      // パスワードが指定されている場合はUPSフォルダとPassword.txtを作成
      if (password && password.trim() !== "") {
        const upsDir = path.join(userDir, "UPS");
        console.log(`[DEBUG] Creating UPS directory: "${upsDir}"`);
        fs.mkdirSync(upsDir, { recursive: true });
        fs.writeFileSync(getPasswordFile(username), password.trim());
        console.log(`[DEBUG] Password file created: "${getPasswordFile(username)}"`);
      }

      // --- ログ出力 ---
      logAccess({ req, username, password });

      sendJsonResponse(res, 200, { success: true, message: "アカウントが作成されました" });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'register API エラー', { error: error.message });
      console.error(`[DEBUG] register error:`, error);
      sendJsonResponse(res, 500, { error: "アカウント作成に失敗しました" });
    }
    return;
  }

  if (pathname === "/api/login" && req.method === "POST") {
    try {
      const data = await parsePostData(req);
      const { username, password } = data;
      
      console.log(`[DEBUG] login called with username: "${username}"`);
      
      if (!username) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名が必要です" });
        return;
      }

      const userDir = getUserDir(username);
      console.log(`[DEBUG] User directory path: "${userDir}"`);
      console.log(`[DEBUG] User directory exists: ${fs.existsSync(userDir)}`);
      
      // ユーザーディレクトリが存在するかチェック
      if (!fs.existsSync(userDir)) {
        console.log(`[DEBUG] User directory does not exist`);
        errorCount++;
        sendJsonResponse(res, 404, { error: "ユーザーが存在しません" });
        return;
      }

      const hasPassword = isPasswordRequired(username);
      console.log(`[DEBUG] User "${username}" hasPassword: ${hasPassword}`);
      
      // パスワードが必要な場合
      if (hasPassword) {
        if (!password) {
          errorCount++;
          sendJsonResponse(res, 400, { error: "パスワードが必要です" });
          return;
        }

        const correctPassword = fs.readFileSync(getPasswordFile(username), "utf8").trim();
        console.log(`[DEBUG] Password check: input="${password}", correct="${correctPassword}"`);
        if (password !== correctPassword) {
          errorCount++;
          sendJsonResponse(res, 401, { error: "パスワードが違います" });
          return;
        }
      }

      // --- ログ出力 ---
      logAccess({ req, username, password });

      sendJsonResponse(res, 200, { 
        success: true, 
        message: "ログイン成功",
        username,
        hasPassword
      });
      return;
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'login API エラー', { error: error.message });
      console.error(`[DEBUG] login error:`, error);
      sendJsonResponse(res, 500, { error: "ログインに失敗しました" });
      return;
    }
  }

  if (pathname === "/api/files" && req.method === "GET") {
    try {
      const { username, folder = "" } = parsedUrl.query;
      
      if (!username) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名が必要です" });
        return;
      }

      const userDir = getUserDir(username);
      
      if (!fs.existsSync(userDir)) {
        errorCount++;
        sendJsonResponse(res, 404, { error: "ユーザーが存在しません" });
        return;
      }

      // フォルダパスを構築（セキュリティチェック付き）
      const targetPath = path.join(userDir, folder);
      const normalizedPath = path.normalize(targetPath);
      
      // ユーザーディレクトリ外へのアクセスを防ぐ
      if (!normalizedPath.startsWith(userDir)) {
        errorCount++;
        sendJsonResponse(res, 403, { error: "アクセス拒否" });
        return;
      }

      if (!fs.existsSync(normalizedPath)) {
        errorCount++;
        sendJsonResponse(res, 404, { error: "フォルダが見つかりません" });
        return;
      }

      fs.readdir(normalizedPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
          errorCount++;
          logServerEvent('ERROR', 'files API ディレクトリ読み込みエラー', { error: err.message, path: normalizedPath });
          sendJsonResponse(res, 500, { error: "ファイル一覧の取得に失敗しました" });
          return;
        }

        const files = entries.map(entry => {
          const stats = fs.statSync(path.join(normalizedPath, entry.name));
          return {
            name: entry.name,
            isDirectory: entry.isDirectory(),
            size: entry.isFile() ? stats.size : 0,
            modified: stats.mtime.toISOString(),
            path: folder ? `${folder}/${entry.name}` : entry.name
          };
        });

        // フォルダを先に、ファイルを後にソート
        files.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

        sendJsonResponse(res, 200, { 
          files,
          currentPath: folder,
          parentPath: folder ? path.dirname(folder) : ""
        });
      });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'files API エラー', { error: error.message });
      console.error(`[DEBUG] files error:`, error);
      sendJsonResponse(res, 500, { error: "ファイル一覧の取得に失敗しました" });
    }
    return;
  }

  if (pathname === "/api/file-content" && req.method === "GET") {
    try {
      const { username, filepath } = parsedUrl.query;
      
      if (!username || !filepath) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名とファイルパスが必要です" });
        return;
      }

      const userDir = getUserDir(username);
      const filePath = path.join(userDir, filepath);
      const normalizedPath = path.normalize(filePath);
      
      // セキュリティチェック
      if (!normalizedPath.startsWith(userDir)) {
        errorCount++;
        sendJsonResponse(res, 403, { error: "アクセス拒否" });
        return;
      }

      if (!fs.existsSync(normalizedPath)) {
        errorCount++;
        sendJsonResponse(res, 404, { error: "ファイルが見つかりません" });
        return;
      }

      const stats = fs.statSync(normalizedPath);
      if (!stats.isFile()) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ファイルではありません" });
        return;
      }

      // ファイルサイズチェック（10MB以下のみ表示）
      if (stats.size > 100000 * 1024 * 1024) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ファイルが大きすぎます（10MB以下のみ表示可能）" });
        return;
      }

      const content = fs.readFileSync(normalizedPath, 'utf8');
      sendJsonResponse(res, 200, { 
        content,
        filename: path.basename(filepath),
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'file-content API エラー', { error: error.message });
      console.error(`[DEBUG] file-content error:`, error);
      sendJsonResponse(res, 500, { error: "ファイル内容の取得に失敗しました" });
    }
    return;
  }

  if (pathname === "/api/upload" && req.method === "POST") {
    try {
      // multipart/form-dataの処理
      const formidable = require('formidable');
      const form = new formidable.IncomingForm();
      form.uploadDir = require('os').tmpdir();
      form.keepExtensions = true;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          errorCount++;
          logServerEvent('ERROR', 'upload API フォーム解析エラー', { error: err.message });
          sendJsonResponse(res, 500, { error: "ファイルアップロードに失敗しました" });
          return;
        }

        const { username, folder = "" } = fields;
        const uploadedFiles = files.file;

        // username, folderが配列の場合は先頭要素を使う
        const usernameStr = Array.isArray(username) ? username[0] : username;
        const folderStr = Array.isArray(folder) ? folder[0] : folder;

        if (!usernameStr || !uploadedFiles) {
          errorCount++;
          sendJsonResponse(res, 400, { error: "ユーザー名とファイルが必要です" });
          return;
        }

        const userDir = getUserDir(usernameStr);
        const targetDir = path.join(userDir, folderStr);
        const normalizedTargetDir = path.normalize(targetDir);

        // セキュリティチェック
        if (!normalizedTargetDir.startsWith(userDir)) {
          errorCount++;
          sendJsonResponse(res, 403, { error: "アクセス拒否" });
          return;
        }

        // ターゲットディレクトリが存在しない場合は作成
        if (!fs.existsSync(normalizedTargetDir)) {
          fs.mkdirSync(normalizedTargetDir, { recursive: true });
        }

        console.log('[DEBUG] uploadedFiles:', uploadedFiles);

        // 複数ファイル対応
        const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
        const uploadedFileNames = [];

        for (const fileObj of fileArray) {
          const fileName =
            fileObj.originalFilename ||
            fileObj.name ||
            (fileObj && fileObj.filepath && fileObj.filepath.split(/[\\/]/).pop()) ||
            'uploadedfile';

          const targetPath = path.join(normalizedTargetDir, fileName);
          
          // ファイルを移動
          fs.copyFileSync(fileObj.filepath, targetPath);
          fs.unlinkSync(fileObj.filepath); // 一時ファイルを削除
          
          uploadedFileNames.push(fileName);
        }

        sendJsonResponse(res, 200, { 
          success: true, 
          message: `${uploadedFileNames.length}個のファイルがアップロードされました`,
          filenames: uploadedFileNames,
          count: uploadedFileNames.length
        });
      });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'upload API エラー', { error: error.message });
      console.error(`[DEBUG] upload error:`, error);
      sendJsonResponse(res, 500, { error: "ファイルアップロードに失敗しました" });
    }
    return;
  }

  if (pathname === "/api/download" && req.method === "GET") {
    try {
      const { username, filename } = parsedUrl.query;
      
      if (!username || !filename) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名とファイル名が必要です" });
        return;
      }

      const filePath = path.join(getUserDir(username), filename);
      
      if (!fs.existsSync(filePath)) {
        errorCount++;
        sendJsonResponse(res, 404, { error: "ファイルが見つかりません" });
        return;
      }

      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ファイルではありません" });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": stats.size
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'download API エラー', { error: error.message });
      sendJsonResponse(res, 500, { error: "ファイルダウンロードに失敗しました" });
    }
    return;
  }

  if (pathname === "/api/mkdir" && req.method === "POST") {
    try {
      const data = await parsePostData(req);
      let { username, folder = "", newFolderName } = data;
      // 配列対策
      username = Array.isArray(username) ? username[0] : username;
      folder = Array.isArray(folder) ? folder[0] : folder;
      newFolderName = Array.isArray(newFolderName) ? newFolderName[0] : newFolderName;

      if (!username || !newFolderName) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "ユーザー名と新しいフォルダ名が必要です" });
        return;
      }
      if (/[\\/:*?"<>|]/.test(newFolderName)) {
        errorCount++;
        sendJsonResponse(res, 400, { error: "フォルダ名に使用できない文字が含まれています" });
        return;
      }
      const userDir = getUserDir(username);
      const targetDir = path.join(userDir, folder);
      const normalizedTargetDir = path.normalize(targetDir);
      if (!normalizedTargetDir.startsWith(userDir)) {
        errorCount++;
        sendJsonResponse(res, 403, { error: "アクセス拒否" });
        return;
      }
      const newFolderPath = path.join(normalizedTargetDir, newFolderName);
      if (fs.existsSync(newFolderPath)) {
        errorCount++;
        sendJsonResponse(res, 409, { error: "同名のフォルダが既に存在します" });
        return;
      }
      fs.mkdirSync(newFolderPath);
      sendJsonResponse(res, 200, { success: true, message: "フォルダを作成しました" });
    } catch (error) {
      errorCount++;
      logServerEvent('ERROR', 'mkdir API エラー', { error: error.message });
      console.error(`[DEBUG] mkdir error:`, error);
      sendJsonResponse(res, 500, { error: "フォルダ作成に失敗しました" });
    }
    return;
  }

  // 既存のファイルブラウザ機能（後方互換性のため残す）
  const safePath = path.normalize(path.join(ROOT_DIR, pathname));

  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("アクセス拒否");
    return;
  }

  const segments = pathname.split("/").filter(Boolean);
  const username = segments[0] || "";

  const passwordFile = path.join(ROOT_DIR, username, "UPS", "Password.txt");
  const passwordRequired = fs.existsSync(passwordFile);

  // POST /authで認証処理
  if (req.method === "POST" && pathname === "/auth" && parsedUrl.query.user) {
    try {
      const data = await parsePostData(req);
      const pass = data.pass || "";
      const user = parsedUrl.query.user;

      const pwFile = path.join(ROOT_DIR, user, "UPS", "Password.txt");
      if (!fs.existsSync(pwFile)) {
        res.writeHead(302, { Location: `/${user}/` });
        res.end();
        return;
      }

      const correctPassword = fs.readFileSync(pwFile, "utf8").trim();
      if (pass === correctPassword) {
        // 認証成功 → パスワードをクエリに付けてリダイレクト
        res.writeHead(302, { Location: `/${user}/?pass=${encodeURIComponent(pass)}` });
        res.end();
      } else {
        res.writeHead(401, { "Content-Type": "text/html; charset=UTF-8" });
        res.end(loginPage(user, "パスワードが違います"));
      }
    } catch {
      res.writeHead(500);
      res.end("内部サーバーエラー");
    }
    return;
  }

  // パスワード必須ユーザーフォルダでパスワード付きURLじゃない場合はログイン画面表示
  if (passwordRequired) {
    const reqPass = parsedUrl.query.pass || "";
    if (!reqPass) {
      // パスワードがクエリに無ければログイン画面
      res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
      res.end(loginPage(username));
      return;
    }

    const correctPassword = fs.readFileSync(passwordFile, "utf8").trim();
    if (reqPass !== correctPassword) {
      // クエリのパスワード間違いならログイン画面
      res.writeHead(401, { "Content-Type": "text/html; charset=UTF-8" });
      res.end(loginPage(username, "パスワードが違います"));
      return;
    }
    // パスワード合っていれば、下のファイル・フォルダ表示処理に進む
  }

  // パスワード不要、または認証済みならファイル・フォルダを表示
  fs.stat(safePath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end("ファイルまたはフォルダが見つかりません");
      return;
    }

    if (stats.isDirectory()) {
      showFolderContents(safePath, pathname, res);
    } else {
      const stream = fs.createReadStream(safePath);
      stream.on("error", () => {
        res.writeHead(500);
        res.end("ファイル読み込みエラー");
      });
      res.writeHead(200);
      stream.pipe(res);
    }
  });

  // HTTPサーバーのupgradeイベントでWebSocketに分岐
  if (req.headers.upgrade === "websocket") {
    // クエリからusername取得
    const username = parsedUrl.query.username;
    if (!username) {
      res.end("WebSocket接続に失敗しました");
      return;
    }
    wsServer.handleUpgrade(req, req.socket, req.headers, (ws) => {
      wsServer.emit("connection", ws, req, username);
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  logServerEvent('STARTUP', 'NASサーバーが起動しました', { 
    port: PORT,
    rootDir: ROOT_DIR,
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch()
  });
  console.log(`NASが http://0.0.0.0:${PORT} で起動中 (ROOT=${ROOT_DIR})`);
  console.log(`Tailscaleドメイン: https://nec.tailf3f3f4.ts.net/`);
  console.log(`APIエンドポイント:`);
  console.log(`  POST /api/check-password - パスワード必要判定`);
  console.log(`  POST /api/register - アカウント作成`);
  console.log(`  POST /api/login - ログイン`);
  console.log(`  GET  /api/files - ファイル一覧取得`);
  console.log(`  GET  /api/download - ファイルダウンロード`);
  console.log(`  POST /api/mkdir - フォルダ作成`);
});

function isImageFile(filename) {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename);
}

async function viewFileContent(filepath) {
  const filename = filepath.split('/').pop();
  if (isImageFile(filename)) {
    // 画像ならimgタグで表示
    const url = `/api/download?username=${encodeURIComponent(loggedInUser)}&filename=${encodeURIComponent(filepath)}`;
    document.getElementById("fileContent").innerHTML = `<h3>${filename}</h3><img src="${url}" style="max-width:100%;border-radius:8px;box-shadow:0 2px 12px #0003;">`;
    return;
  }
  // それ以外は従来通り
  try {
    const result = await apiCall(`file-content?username=${encodeURIComponent(loggedInUser)}&filepath=${encodeURIComponent(filepath)}`);
    document.getElementById("fileContent").innerHTML = `<h3>${result.filename}</h3><pre style='background:#f8f9fa;padding:10px;border-radius:5px;max-height:400px;overflow:auto;'>${escapeHtml(result.content)}</pre>`;
  } catch (error) {
    document.getElementById("fileContent").innerHTML = `<div class="error">ファイル内容の取得に失敗しました: ${error.message}</div>`;
  }
}
