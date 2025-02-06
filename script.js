// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;
    let currentPage = 1; // 当前页码
    const itemsPerPage = 12; // 每页显示的指标数量

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
                <img src="${indicator.image || 'image/default.png'}" 
                     alt="${indicator.name}缩略图" 
                     class="indicator-thumbnail" 
                     loading="lazy"
                     data-id="${indicator.id}">
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });

        renderPagination();
    }

    // 渲染分页按钮
    function renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(indicators.length / itemsPerPage);
        let paginationHTML = `
            <button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
        `;

        // 添加页码按钮
        const maxVisiblePages = 5; // 最多显示5个页码
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // 调整startPage，确保显示足够的页码
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // 添加第一页和省略号
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }

        // 添加页码按钮
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }

        // 添加最后一页和省略号
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // 添加下一页按钮和跳转输入框
        paginationHTML += `
            <button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
            <div class="page-jump">
                <span>跳转到第</span>
                <input type="number" min="1" max="${totalPages}" class="page-input" value="${currentPage}">
                <span>页</span>
                <button class="jump-btn">GO</button>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;

        // 绑定事件
        paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('prev-btn')) {
                    if (currentPage > 1) {
                        currentPage--;
                        renderIndicators();
                    }
                } else if (btn.classList.contains('next-btn')) {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderIndicators();
                    }
                } else {
                    const page = parseInt(btn.dataset.page);
                    if (page !== currentPage) {
                        currentPage = page;
                        renderIndicators();
                    }
                }
            });
        });

        // 确保跳转按钮和输入框的事件绑定
        const jumpBtn = paginationContainer.querySelector('.jump-btn');
        const pageInput = paginationContainer.querySelector('.page-input');
        
        if (jumpBtn && pageInput) {
            // 跳转按钮点击事件
            jumpBtn.addEventListener('click', () => {
                const targetPage = parseInt(pageInput.value);
                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                    currentPage = targetPage;
                    renderIndicators();
                }
            });

            // 输入框回车事件
            pageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    jumpBtn.click();
                }
            });

            // 输入框验证
            pageInput.addEventListener('input', () => {
                let value = parseInt(pageInput.value);
                if (value < 1) pageInput.value = 1;
                if (value > totalPages) pageInput.value = totalPages;
            });
        }
    }

    // 在新窗口打开详情页面
    function showDetailInNewWindow(id) {
        const indicator = indicators.find(i => i.id === id);
        if (!indicator) return alert("未找到该指标！");

        // 创建新窗口的 URL
        const detailUrl = `detail.html?id=${id}`;
        window.open(detailUrl, '_blank');
    }

    // 修改事件监听，添加图片点击事件
    document.getElementById('indicatorContainer').addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (!id) return;

        if (e.target.classList.contains('indicator-thumbnail') || e.target.classList.contains('detail-btn')) {
            showDetailInNewWindow(id);
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
                <img src="${indicator.image || 'image/default.png'}" 
                     alt="${indicator.name}缩略图" 
                     class="indicator-thumbnail" 
                     loading="lazy"
                     data-id="${indicator.id}">
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });

        renderPagination(); // 重新渲染分页按钮
    }

    // 添加到 script.js
    function initFloatingWidget() {
        const widget = document.getElementById('floatingWidget');
        const qrCode = document.getElementById('qrCode');
        const widgetIcon = document.getElementById('widgetIcon');

        if (widget && qrCode) {
            widget.addEventListener('mouseenter', () => qrCode.style.display = 'block');
            widget.addEventListener('mouseleave', () => qrCode.style.display = 'none');
        }

        if (widgetIcon) {
            widgetIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                window.open("image/ewm.png", '_blank');
            });
        }
    }

    document.addEventListener("DOMContentLoaded", initFloatingWidget);

    // 初始化加载数据
    loadIndicators();
})();
