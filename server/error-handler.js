/**
 * NexusOrbital认证系统 - 错误处理模块
 * 提供统一的错误处理机制
 */

// 导入配置
const config = require('./config');

// 自定义错误类型
class ApiError extends Error {
  constructor(message, statusCode, code = 'GENERAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 常见错误类型
const ErrorTypes = {
  BAD_REQUEST: (message = '请求参数错误', code = 'BAD_REQUEST') => 
    new ApiError(message, 400, code),
  
  UNAUTHORIZED: (message = '未授权', code = 'UNAUTHORIZED') => 
    new ApiError(message, 401, code),
  
  FORBIDDEN: (message = '禁止访问', code = 'FORBIDDEN') => 
    new ApiError(message, 403, code),
  
  NOT_FOUND: (message = '资源不存在', code = 'NOT_FOUND') => 
    new ApiError(message, 404, code),
  
  CONFLICT: (message = '资源冲突', code = 'CONFLICT') => 
    new ApiError(message, 409, code),
  
  INTERNAL_ERROR: (message = '服务器内部错误', code = 'INTERNAL_ERROR') => 
    new ApiError(message, 500, code),
  
  VALIDATION_ERROR: (message = '数据验证失败', fields = {}) => 
    new ApiError(
      message, 
      400, 
      'VALIDATION_ERROR',
      { fields }
    )
};

// 中间件：处理请求中的错误
const errorMiddleware = (err, req, res, next) => {
  // 判断错误类型
  if (err instanceof ApiError) {
    // API错误直接返回错误信息
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.data && { data: err.data })
    });
  }
  
  // 记录未知错误到控制台
  console.error('Unhandled error:', err);
  
  // 非开发环境不返回详细错误
  const message = config.get('server.isDevelopment')
    ? err.message || '未知错误'
    : '服务器内部错误';
  
  // 返回通用错误响应
  return res.status(500).json({
    success: false,
    message,
    code: 'INTERNAL_ERROR'
  });
};

// 异步处理器（用于包装异步路由处理函数）
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 导出模块
module.exports = {
  ApiError,
  ErrorTypes,
  errorMiddleware,
  asyncHandler
};
