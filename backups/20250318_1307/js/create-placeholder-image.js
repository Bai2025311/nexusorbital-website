// 这个脚本用于创建探索者智能体的占位头像
const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG头像
function createExplorerAvatar() {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#1e3c72"/>
        <circle cx="100" cy="80" r="40" fill="#4d76cf"/>
        <path d="M100 130 L60 180 L140 180 Z" fill="#4d76cf"/>
        <circle cx="85" cy="70" r="6" fill="white"/>
        <circle cx="115" cy="70" r="6" fill="white"/>
        <path d="M85 100 Q100 120 115 100" fill="none" stroke="white" stroke-width="3"/>
        <path d="M70 40 L80 30 L90 40" fill="none" stroke="#b3c7ff" stroke-width="2"/>
        <path d="M110 40 L120 30 L130 40" fill="none" stroke="#b3c7ff" stroke-width="2"/>
    </svg>`;

    const outputDir = path.join(__dirname, '../images/agents');
    const outputFile = path.join(outputDir, 'explorer-avatar.svg');
    
    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(outputFile, svgContent);
    console.log(`Created explorer avatar at: ${outputFile}`);
}

createExplorerAvatar();
