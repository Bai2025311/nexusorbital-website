// 导航栏响应式处理
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if(hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });
}

// 倒计时功能
function updateCountdown() {
    // 设置目标日期为当前日期后7天
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 7);
    targetDate.setHours(23, 59, 59, 0);
    
    const currentTime = now.getTime();
    const targetTime = targetDate.getTime();
    const remainingTime = targetTime - currentTime;
    
    if (remainingTime <= 0) {
        // 倒计时结束
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }
    
    // 计算剩余天数、小时、分钟和秒数
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    // 更新倒计时显示
    document.getElementById("days").textContent = days.toString().padStart(2, "0");
    document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
}

// 如果存在倒计时元素，每秒更新一次
if(document.getElementById("countdown-timer")) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// 表单提交处理
const newsletterForm = document.getElementById("newsletter-form");
if(newsletterForm) {
    newsletterForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = this.querySelector("input[type='email']").value;
        alert(`感谢订阅！我们会将最新信息发送到 ${email}`);
        this.reset();
    });
}

// 导航栏滚动效果
window.addEventListener("scroll", function() {
    const navbar = document.querySelector(".navbar");
    if(navbar) {
        if(window.scrollY > 50) {
            navbar.style.background = "rgba(0, 0, 0, 0.9)";
            navbar.style.padding = "1rem 0";
        } else {
            navbar.style.background = "transparent";
            navbar.style.padding = "1.5rem 0";
        }
    }
});

// 动态加载更多NFT卡片（示例）
function loadMoreNFTs() {
    const nftGrid = document.getElementById("nft-grid");
    if(!nftGrid) return;
    
    // 这里可以通过API获取更多NFT数据
    // 以下是示例数据
    const additionalNFTs = [
        {
            image: "nft-samples/nft-4.jpg",
            title: "星际公民 #004",
            description: "太空医疗专家身份，拥有实验数据优先访问权",
            price: "¥1,999",
            remaining: "20/50",
            badge: "新品"
        },
        {
            image: "nft-samples/nft-5.jpg",
            title: "星际公民 #005",
            description: "太空结构工程师，拥有实验设计参与权",
            price: "¥1,999",
            remaining: "18/50"
        }
    ];
    
    // 创建并添加NFT卡片
    additionalNFTs.forEach(nft => {
        const nftCard = document.createElement("div");
        nftCard.className = "nft-card";
        
        let badgeHTML = nft.badge ? `<div class="nft-badge">${nft.badge}</div>` : '';
        
        nftCard.innerHTML = `
            <div class="nft-image">
                <img src="${nft.image}" alt="${nft.title}">
                ${badgeHTML}
            </div>
            <div class="nft-info">
                <h3>${nft.title}</h3>
                <p class="nft-description">${nft.description}</p>
                <div class="nft-price">
                    <span class="price">${nft.price}</span>
                    <span class="availability">剩余: ${nft.remaining}</span>
                </div>
                <a href="nft-sale.html" class="btn-primary btn-full">立即购买</a>
            </div>
        `;
        
        nftGrid.appendChild(nftCard);
    });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function() {
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 如果是NFT展示页面，加载初始NFT
    const loadMoreBtn = document.getElementById("load-more-nft");
    if(loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function() {
            loadMoreNFTs();
            // 如果没有更多NFT可加载，隐藏按钮
            this.style.display = "none";
        });
    }
    
    // 模拟NFT购买
    const buyButtons = document.querySelectorAll(".nft-buy-btn");
    buyButtons.forEach(button => {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            const nftId = this.getAttribute("data-nft-id");
            const nftPrice = this.getAttribute("data-nft-price");
            
            // 显示购买确认模态框
            showBuyConfirmation(nftId, nftPrice);
        });
    });
});

// NFT购买确认模态框
function showBuyConfirmation(nftId, nftPrice) {
    // 创建模态框元素
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>确认购买</h2>
            <p>您即将购买 NFT #${nftId}，价格为 ${nftPrice}</p>
            <p>请选择支付方式：</p>
            <div class="payment-options">
                <button class="payment-btn" data-payment="wechat">微信支付</button>
                <button class="payment-btn" data-payment="alipay">支付宝</button>
                <button class="payment-btn" data-payment="crypto">加密货币</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
        modal.style.display = "flex";
    }, 10);
    
    // 关闭模态框
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // 支付按钮点击事件
    const paymentBtns = modal.querySelectorAll(".payment-btn");
    paymentBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const paymentMethod = this.getAttribute("data-payment");
            processPayment(nftId, nftPrice, paymentMethod);
            modal.style.display = "none";
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
}

// 处理支付
function processPayment(nftId, nftPrice, paymentMethod) {
    // 这里应该连接到实际支付处理系统
    // 目前仅显示成功信息
    
    alert(`支付成功！您已成功购买 NFT #${nftId}，支付方式：${paymentMethod}。\n我们将发送购买详情到您的邮箱。`);
    
    // 更新NFT状态为已售出
    // updateNFTStatus(nftId, "sold");
}
