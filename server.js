const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8082;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // 解析URL
    const parsedUrl = url.parse(req.url, true);
    
    // 处理favicon.ico请求
    if (parsedUrl.pathname === '/favicon.ico') {
        res.statusCode = 204;
        res.end();
        return;
    }
    
    // 规范化路径名
    let pathname = parsedUrl.pathname;
    
    // 默认首页
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // 检查路径是否以.html/结尾，这是一种错误的请求模式
    if (pathname.endsWith('.html/')) {
        pathname = pathname.substring(0, pathname.length - 1);
    } else {
        // 修复其他资源路径中包含.html/的情况
        pathname = pathname.replace(/\.html\/(.+)/, '/$1');
    }
    
    // 将路径映射到实际文件
    const filePath = path.join(__dirname, pathname);
    
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    
    // 设置内容类型
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件未找到
                console.log(`文件未找到: ${filePath}`);
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    if (err) {
                        // 没有找到404页面
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // 服务器错误
                console.error(`服务器错误: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // 成功
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
    console.log(`访问桌面版社区: http://localhost:${PORT}/community.html`);
    console.log(`访问移动版社区: http://localhost:${PORT}/community-mobile.html`);
});
