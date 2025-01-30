// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;
    let currentPage = 1; // 当前页码
    const itemsPerPage = 9; // 每页显示的指标数量

    // 广告链接配置（新增）
    const adLinks = {
        "vip": "vip.html",      // 春季优惠落地页
        "ad2": "courses.html",        // 专业课程页面
        "ad3": "vip.html",            // VIP会员说明页（核心需求）
        // 可扩展更多广告...
    };

    // 加载指标数据
    async function loadIndicators() {
        try {
            const response = await fetch('card.json'); // 修改为 card.json
            indicators = await response.json();
            renderIndicators();
            renderPagination(); // 渲染分页按钮
            initAdSystem(); // 新增广告系统初始化 
            // 新增广告调整
            adjustAdBanner();
            setupAdTracking();
        } catch (error) {
            console.error('数据加载失败:', error);
            alert('指标数据加载失败，请稍后重试！');
        }
    }

    // 广告系统初始化（新增）
    function initAdSystem() {
        adjustAdBanner();
        setupAdTracking();
    }

    // 广告动态调整
    function adjustAdBanner() {
        const adItems = document.querySelectorAll('.ad-item');
        const banner = document.querySelector('.ad-banner');
        if (adItems.length > 0 && banner) {
            banner.style.width = `${adItems.length * 100}%`;
            adItems.forEach(item => {
                item.style.minWidth = `${100 / adItems.length}%`;
            });
        }
    }

    // 广告点击处理（核心修改）
    function setupAdTracking() {
        document.querySelectorAll('.ad-item').forEach(ad => {
            ad.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 获取广告标识
                const img = ad.querySelector('img');
                const adKey = img.alt.replace(/广告/g, '').trim(); // 从alt提取标识
                
                // 获取对应落地页
                const targetPage = adLinks[adKey.toLowerCase()] || 'default.html';
                
                // 执行跳转（新标签页打开）
                console.log(`广告跳转: ${adKey} -> ${targetPage}`);
                window.open(targetPage, '_blank');
                
                // 可扩展：添加统计代码
                // trackAdClick(adKey); 
            });
        });
    }
    
        // 广告点击统计示例函数
    function trackAdClick(adName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_click', {
                'event_category': 'Advertising',
                'event_label': adName
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        // 获取挂件和二维码元素
        var widget = document.getElementById('floatingWidget');
        var qrCode = document.getElementById('qrCode');

        if (widget && qrCode) { // 确保元素存在
            // 鼠标进入事件监听器
            widget.addEventListener('mouseenter', function() {
                qrCode.style.display = 'block';
            });

            // 鼠标离开事件监听器
            widget.addEventListener('mouseleave', function() {
                qrCode.style.display = 'none';
            });
        }
    });

    // 渲染指标卡片
    function renderIndicators(filter = 'all') {
        const container = document.getElementById('indicatorContainer');
        container.innerHTML = '';

        const filteredIndicators = indicators.filter(indicator => {
            return filter === 'all' || indicator.category.includes(filter);
        });

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedIndicators = filteredIndicators.slice(startIndex, endIndex);

        paginatedIndicators.forEach(indicator => {
            const card = document.createElement('div');
            card.className = 'indicator-card';
            card.innerHTML = `
                <a href="${indicator.image}" data-lightbox="indicator-images" data-title="${indicator.name}">
                    <img src="${indicator.image}" alt="${indicator.name}缩略图" 
                         class="indicator-thumbnail" loading="lazy">
                </a>
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });

        renderPagination(); // 重新渲染分页按钮
    }

    // 渲染分页按钮
    function renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(indicators.length / itemsPerPage);

        const prevButton = document.createElement('button');
        prevButton.textContent = '上一页';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderIndicators();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = '下一页';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderIndicators();
            }
        });

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(nextButton);
    }

    // 在新窗口打开详情页面
    function showDetailInNewWindow(id) {
        const indicator = indicators.find(i => i.id === id);
        if (!indicator) return alert("未找到该指标！");

        // 创建新窗口的 URL
        const detailUrl = `detail.html?id=${id}`;
        window.open(detailUrl, '_blank');
    }

    // 绑定事件：点击卡片按钮
    document.getElementById('indicatorContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-btn')) {
            const id = parseInt(e.target.dataset.id);
            showDetailInNewWindow(id); // 调用新窗口打开函数
        }
    });

    // 绑定事件：分类按钮点击
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPage = 1; // 重置页码
            renderIndicators(btn.dataset.category);
        });
    });

    // 绑定事件：搜索框输入
    document.querySelector('.search-box').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filtered = indicators.filter(indicator => 
                indicator.name.toLowerCase().includes(searchTerm) ||
                indicator.description.toLowerCase().includes(searchTerm)
            );
            currentPage = 1; // 重置页码
            renderIndicatorsBySearch(filtered);
        }, 300);
    });

    // 渲染搜索结果
    function renderIndicatorsBySearch(filtered) {
        const container = document.getElementById('indicatorContainer');
        container.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedIndicators = filtered.slice(startIndex, endIndex);

        paginatedIndicators.forEach(indicator => {
            const card = document.createElement('div');
            card.className = 'indicator-card';
            card.innerHTML = `
                <a href="${indicator.image}" data-lightbox="indicator-images" data-title="${indicator.name}">
                    <img src="${indicator.image}" alt="${indicator.name}缩略图" 
                         class="indicator-thumbnail" loading="lazy">
                </a>
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });

        renderPagination(); // 重新渲染分页按钮
    }

    // 初始化加载数据
    loadIndicators();
    
    // 确保悬浮窗展开时不影响主内容点击
    document.querySelector('.data-sidebar').addEventListener('mouseenter', function() {
        this.style.zIndex = '1000'; // 展开时置顶
    });

    document.querySelector('.data-sidebar').addEventListener('mouseleave', function() {
        this.style.zIndex = '998'; // 收起时恢复
    });

    // 添加以下代码用于处理挂件的鼠标悬停事件
    document.addEventListener("DOMContentLoaded", function() {
        // 获取挂件和二维码元素
        var widget = document.getElementById('floatingWidget');
        var qrCode = document.getElementById('qrCode');

        if (widget && qrCode) { // 确保元素存在
            // 鼠标进入事件监听器
            widget.addEventListener('mouseenter', function() {
                qrCode.style.display = 'block';
            });

            // 鼠标离开事件监听器
            widget.addEventListener('mouseleave', function() {
                qrCode.style.display = 'none';
            });
        }
    });
})();
