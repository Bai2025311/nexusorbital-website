// 设计工具模块
window.NexusOrbital = window.NexusOrbital || {};

// 设计工具模块
NexusOrbital.DesignTool = (function() {
  // 私有变量
  let canvas;
  let ctx;
  let currentShape = null;
  let currentMaterial = null;
  let currentColor = '#FFFFFF';
  let designHistory = [];
  let currentHistoryIndex = -1;
  let isAdvancedMode = false;
  
  // 可用形状定义
  const shapes = [
    {
      id: 'cube',
      name: '立方体',
      tier: 'basic',
      render: function(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // 3D效果
        ctx.fillStyle = adjustColorBrightness(color, -20);
        ctx.beginPath();
        ctx.moveTo(x - size/2, y - size/2);
        ctx.lineTo(x - size/2 + size/4, y - size/2 - size/4);
        ctx.lineTo(x - size/2 + size/4 + size, y - size/2 - size/4);
        ctx.lineTo(x - size/2 + size, y - size/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = adjustColorBrightness(color, -40);
        ctx.beginPath();
        ctx.moveTo(x - size/2 + size, y - size/2);
        ctx.lineTo(x - size/2 + size/4 + size, y - size/2 - size/4);
        ctx.lineTo(x - size/2 + size/4 + size, y - size/2 - size/4 + size);
        ctx.lineTo(x - size/2 + size, y - size/2 + size);
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      id: 'sphere',
      name: '球体',
      tier: 'basic',
      render: function(ctx, x, y, size, color) {
        // 主圆形
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光效果
        const gradient = ctx.createRadialGradient(
          x - size/5, y - size/5, 0, 
          x, y, size/2
        );
        gradient.addColorStop(0, adjustColorBrightness(color, 30));
        gradient.addColorStop(0.5, adjustColorBrightness(color, 0));
        gradient.addColorStop(1, adjustColorBrightness(color, -20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'cylinder',
      name: '圆柱体',
      tier: 'basic',
      render: function(ctx, x, y, size, color) {
        // 底部椭圆
        ctx.fillStyle = adjustColorBrightness(color, -20);
        ctx.beginPath();
        ctx.ellipse(x, y + size/3, size/3, size/6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 主体矩形
        ctx.fillStyle = color;
        ctx.fillRect(x - size/3, y - size/3, size/1.5, size/1.5);
        
        // 顶部椭圆
        ctx.fillStyle = adjustColorBrightness(color, 10);
        ctx.beginPath();
        ctx.ellipse(x, y - size/3, size/3, size/6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'cone',
      name: '圆锥体',
      tier: 'pro',
      render: function(ctx, x, y, size, color) {
        // 底部椭圆
        ctx.fillStyle = adjustColorBrightness(color, -20);
        ctx.beginPath();
        ctx.ellipse(x, y + size/3, size/3, size/6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 圆锥
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - size/2);
        ctx.lineTo(x - size/3, y + size/3);
        ctx.lineTo(x + size/3, y + size/3);
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      id: 'torus',
      name: '环形体',
      tier: 'pro',
      render: function(ctx, x, y, size, color) {
        // 外圆
        ctx.strokeStyle = color;
        ctx.lineWidth = size/4;
        ctx.beginPath();
        ctx.arc(x, y, size/3, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内部效果
        ctx.strokeStyle = adjustColorBrightness(color, 20);
        ctx.lineWidth = size/12;
        ctx.beginPath();
        ctx.arc(x, y, size/3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  ];
  
  // 可用材质定义
  const materials = [
    {
      id: 'basic',
      name: '基础材质',
      tier: 'basic',
      applyEffect: function(ctx, shape, x, y, size, color) {
        // 基础材质不添加特殊效果
        return color;
      }
    },
    {
      id: 'metal',
      name: '金属材质',
      tier: 'basic',
      applyEffect: function(ctx, shape, x, y, size, color) {
        // 金属效果 - 添加渐变
        return createMetalGradient(ctx, x, y, size, color);
      }
    },
    {
      id: 'glass',
      name: '玻璃材质',
      tier: 'pro',
      applyEffect: function(ctx, shape, x, y, size, color) {
        // 玻璃效果 - 半透明
        return adjustColorOpacity(color, 0.6);
      }
    },
    {
      id: 'carbon',
      name: '碳纤维材质',
      tier: 'pro',
      applyEffect: function(ctx, shape, x, y, size, color) {
        // 碳纤维效果 - 添加花纹
        createCarbonPattern(ctx, x, y, size);
        return 'pattern';
      }
    }
  ];
  
  // 辅助函数 - 调整颜色亮度
  function adjustColorBrightness(color, percent) {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;  
    G = (G < 255) ? G : 255;  
    B = (B < 255) ? B : 255;  

    R = (R > 0) ? R : 0;  
    G = (G > 0) ? G : 0;  
    B = (B > 0) ? B : 0;  

    const RR = ((R.toString(16).length === 1) ? `0${R.toString(16)}` : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? `0${G.toString(16)}` : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? `0${B.toString(16)}` : B.toString(16));

    return `#${RR}${GG}${BB}`;
  }
  
  // 辅助函数 - 调整颜色透明度
  function adjustColorOpacity(color, opacity) {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);
    
    return `rgba(${R}, ${G}, ${B}, ${opacity})`;
  }
  
  // 辅助函数 - 创建金属渐变
  function createMetalGradient(ctx, x, y, size, color) {
    const gradient = ctx.createLinearGradient(
      x - size/2, y - size/2, 
      x + size/2, y + size/2
    );
    gradient.addColorStop(0, adjustColorBrightness(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -30));
    
    return gradient;
  }
  
  // 辅助函数 - 创建碳纤维图案
  function createCarbonPattern(ctx, x, y, size) {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    const patternCtx = patternCanvas.getContext('2d');
    
    // 绘制碳纤维图案
    patternCtx.fillStyle = '#111';
    patternCtx.fillRect(0, 0, 20, 20);
    
    patternCtx.strokeStyle = '#333';
    patternCtx.lineWidth = 1;
    
    patternCtx.beginPath();
    patternCtx.moveTo(0, 0);
    patternCtx.lineTo(20, 20);
    patternCtx.stroke();
    
    patternCtx.beginPath();
    patternCtx.moveTo(20, 0);
    patternCtx.lineTo(0, 20);
    patternCtx.stroke();
    
    ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
  }
  
  // 初始化设计工具
  function init(canvasId = 'design-canvas') {
    canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error('Design canvas not found:', canvasId);
      return false;
    }
    
    ctx = canvas.getContext('2d');
    
    // 设置默认形状和材质
    currentShape = shapes[0]; // 立方体
    currentMaterial = materials[0]; // 基础材质
    
    // 设置高级模式
    checkAdvancedMode();
    
    // 添加事件监听
    setupEventListeners();
    
    // 初始化UI
    setupToolbar();
    
    // 清除画布
    clearCanvas();
    
    console.log('NexusOrbital Design Tool initialized');
    return true;
  }
  
  // 设置高级模式
  function checkAdvancedMode() {
    if (NexusOrbital.Membership) {
      isAdvancedMode = NexusOrbital.Membership.checkFeatureAccess('advanced_design');
    } else {
      isAdvancedMode = false;
    }
    
    console.log('Advanced design mode:', isAdvancedMode ? 'enabled' : 'disabled');
  }
  
  // 设置工具栏
  function setupToolbar() {
    const shapesContainer = document.getElementById('shape-options');
    const materialsContainer = document.getElementById('material-options');
    const colorPicker = document.getElementById('color-picker');
    
    // 清空容器
    if (shapesContainer) shapesContainer.innerHTML = '';
    if (materialsContainer) materialsContainer.innerHTML = '';
    
    // 添加形状选项
    if (shapesContainer) {
      shapes.forEach(shape => {
        const requiresUpgrade = shape.tier !== 'basic' && !isAdvancedMode;
        
        const shapeBtn = document.createElement('button');
        shapeBtn.className = `shape-btn ${shape.id} ${requiresUpgrade ? 'locked' : ''}`;
        shapeBtn.setAttribute('data-shape', shape.id);
        shapeBtn.title = shape.name;
        
        if (requiresUpgrade) {
          shapeBtn.innerHTML = `
            <span class="shape-icon">${shape.id}</span>
            <span class="lock-icon">🔒</span>
          `;
        } else {
          shapeBtn.innerHTML = `<span class="shape-icon">${shape.id}</span>`;
        }
        
        shapeBtn.addEventListener('click', function() {
          if (requiresUpgrade) {
            if (NexusOrbital.Membership) {
              NexusOrbital.Membership.showUpgradePrompt('pro', '高级形状');
            } else {
              alert('此形状需要专业版会员才能使用');
            }
            return;
          }
          
          selectShape(shape.id);
        });
        
        shapesContainer.appendChild(shapeBtn);
      });
    }
    
    // 添加材质选项
    if (materialsContainer) {
      materials.forEach(material => {
        const requiresUpgrade = material.tier !== 'basic' && !isAdvancedMode;
        
        const materialBtn = document.createElement('button');
        materialBtn.className = `material-btn ${material.id} ${requiresUpgrade ? 'locked' : ''}`;
        materialBtn.setAttribute('data-material', material.id);
        materialBtn.title = material.name;
        
        if (requiresUpgrade) {
          materialBtn.innerHTML = `
            <span class="material-icon">${material.id}</span>
            <span class="lock-icon">🔒</span>
          `;
        } else {
          materialBtn.innerHTML = `<span class="material-icon">${material.id}</span>`;
        }
        
        materialBtn.addEventListener('click', function() {
          if (requiresUpgrade) {
            if (NexusOrbital.Membership) {
              NexusOrbital.Membership.showUpgradePrompt('pro', '高级材质');
            } else {
              alert('此材质需要专业版会员才能使用');
            }
            return;
          }
          
          selectMaterial(material.id);
        });
        
        materialsContainer.appendChild(materialBtn);
      });
    }
    
    // 设置颜色选择器
    if (colorPicker) {
      colorPicker.value = currentColor;
      colorPicker.addEventListener('input', function() {
        currentColor = this.value;
        renderPreview();
      });
    }
    
    // 添加历史按钮事件
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      undoBtn.addEventListener('click', undoDesign);
    }
    
    if (redoBtn) {
      redoBtn.addEventListener('click', redoDesign);
    }
    
    // 添加导出按钮事件
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportDesign);
    }
    
    // 添加清除按钮事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearCanvas);
    }
  }
  
  // 设置事件监听
  function setupEventListeners() {
    if (!canvas) return;
    
    // 添加画布点击事件
    canvas.addEventListener('click', function(e) {
      if (!currentShape) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 绘制形状
      drawShape(x, y);
      
      // 记录历史
      addToHistory();
      
      // 跟踪事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('design_shape_placed', {
          shape: currentShape.id,
          material: currentMaterial.id,
          color: currentColor
        });
      }
    });
    
    // 添加预览效果
    canvas.addEventListener('mousemove', function(e) {
      if (!currentShape) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      renderPreview(x, y);
    });
    
    // 离开画布时清除预览
    canvas.addEventListener('mouseleave', function() {
      redrawCanvas();
    });
  }
  
  // 选择形状
  function selectShape(shapeId) {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    currentShape = shape;
    
    // 更新UI
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.shape-btn[data-shape="${shapeId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('design_shape_selected', {
        shape: shapeId
      });
    }
  }
  
  // 选择材质
  function selectMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    currentMaterial = material;
    
    // 更新UI
    document.querySelectorAll('.material-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.material-btn[data-material="${materialId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('design_material_selected', {
        material: materialId
      });
    }
  }
  
  // 绘制形状
  function drawShape(x, y, size = 100) {
    if (!ctx || !currentShape || !currentMaterial) return;
    
    // 应用材质效果
    const effectiveColor = currentMaterial.applyEffect(ctx, currentShape, x, y, size, currentColor);
    
    // 绘制形状
    currentShape.render(ctx, x, y, size, effectiveColor);
  }
  
  // 渲染预览
  function renderPreview(x, y) {
    if (!ctx || !currentShape) return;
    
    // 重绘画布
    redrawCanvas();
    
    // 如果有鼠标位置，绘制预览
    if (x !== undefined && y !== undefined) {
      // 绘制半透明预览
      ctx.globalAlpha = 0.6;
      drawShape(x, y);
      ctx.globalAlpha = 1.0;
    }
  }
  
  // 重绘画布
  function redrawCanvas() {
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 画表格线（辅助设计）
    drawGrid();
    
    // 如果有历史，重绘当前状态
    if (designHistory.length > 0 && currentHistoryIndex >= 0) {
      const currentState = designHistory[currentHistoryIndex];
      ctx.drawImage(currentState, 0, 0);
    }
  }
  
  // 绘制网格
  function drawGrid() {
    if (!ctx) return;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  
  // 清除画布
  function clearCanvas() {
    if (!ctx || !canvas) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 重置历史
    designHistory = [];
    currentHistoryIndex = -1;
    
    // 添加初始空白状态到历史
    addToHistory();
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('design_canvas_cleared');
    }
  }
  
  // 添加到历史
  function addToHistory() {
    if (!canvas) return;
    
    // 如果当前不是最新状态，删除后面的历史
    if (currentHistoryIndex < designHistory.length - 1) {
      designHistory = designHistory.slice(0, currentHistoryIndex + 1);
    }
    
    // 创建当前状态的图像
    const imageData = new Image();
    imageData.src = canvas.toDataURL();
    
    // 添加到历史
    designHistory.push(imageData);
    currentHistoryIndex = designHistory.length - 1;
    
    // 限制历史长度
    if (designHistory.length > 20) {
      designHistory.shift();
      currentHistoryIndex--;
    }
    
    // 更新UI状态
    updateHistoryButtonsState();
  }
  
  // 更新历史按钮状态
  function updateHistoryButtonsState() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      undoBtn.disabled = currentHistoryIndex <= 0;
    }
    
    if (redoBtn) {
      redoBtn.disabled = currentHistoryIndex >= designHistory.length - 1;
    }
  }
  
  // 撤销
  function undoDesign() {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      redrawCanvas();
      updateHistoryButtonsState();
      
      // 跟踪事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('design_undo');
      }
    }
  }
  
  // 重做
  function redoDesign() {
    if (currentHistoryIndex < designHistory.length - 1) {
      currentHistoryIndex++;
      redrawCanvas();
      updateHistoryButtonsState();
      
      // 跟踪事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('design_redo');
      }
    }
  }
  
  // 导出设计
  function exportDesign() {
    if (!canvas) return;
    
    // 检查是否有高级设计权限
    if (NexusOrbital.Membership && !NexusOrbital.Membership.checkFeatureAccess('export_design')) {
      NexusOrbital.Membership.showUpgradePrompt('pro', '设计导出');
      return;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'nexusorbital-design.png';
    link.href = canvas.toDataURL('image/png');
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('design_exported');
    }
  }
  
  // 公共API
  return {
    init: init,
    getShapes: function() { return shapes.map(s => ({...s})); },
    getMaterials: function() { return materials.map(m => ({...m})); },
    selectShape: selectShape,
    selectMaterial: selectMaterial,
    clearCanvas: clearCanvas,
    exportDesign: exportDesign
  };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  const canvasEl = document.getElementById('design-canvas');
  if (canvasEl) {
    NexusOrbital.DesignTool.init();
  }
});
