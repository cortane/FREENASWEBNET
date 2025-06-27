#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 FreeNAS WebService インストーラー');
console.log('====================================');

// デフォルト設定
const defaultConfig = {
  port: 3000,
  rootDir: path.join(os.homedir(), 'FreeNASWebService')
};

// 設定ファイルのパス
const configPath = path.join(os.homedir(), '.freenaswebservice', 'config.json');

// 設定ディレクトリを作成
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log(`✅ 設定ディレクトリを作成: ${configDir}`);
}

// 設定ファイルを作成
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log(`✅ 設定ファイルを作成: ${configPath}`);
}

// ルートディレクトリを作成
if (!fs.existsSync(defaultConfig.rootDir)) {
  fs.mkdirSync(defaultConfig.rootDir, { recursive: true });
  console.log(`✅ ルートディレクトリを作成: ${defaultConfig.rootDir}`);
}

console.log('\n🎉 インストール完了！');
console.log('\n使用方法:');
console.log('  freenaswebservice                    # デフォルト設定で起動');
console.log('  freenaswebservice --port 8080        # ポート指定で起動');
console.log('  freenaswebservice --root /path/to/dir # ルートディレクトリ指定');
console.log('\n設定ファイル: ' + configPath);
console.log('ルートディレクトリ: ' + defaultConfig.rootDir); 