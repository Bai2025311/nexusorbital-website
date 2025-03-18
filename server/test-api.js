/**
 * API测试脚本
 */
const fetch = require('node-fetch');

// 测试数据
const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
};

console.log('=== 开始API测试 ===');

// 测试GET请求
console.log('1. 测试GET请求...');
fetch('http://localhost:3040/api/test')
    .then(response => response.json())
    .then(data => {
        console.log('GET响应:', data);
        
        // 测试POST请求
        console.log('2. 测试POST请求...');
        return fetch('http://localhost:3040/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('POST响应:', data);
        console.log('=== API测试完成 ===');
    })
    .catch(error => {
        console.error('测试错误:', error);
    });
