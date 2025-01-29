// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;

    // 加载指标数据
    async function loadIndicators() {
        try {
            const response = await fetch('card.json');
            indicators = await response.json();
            
            // 判断当前页面类型
            if (isZhibiaoPage()) {
                renderAllIndicators(); // 指标大全页面：渲染全部
            } else {
                initHomePage(); // 首页：初始化搜索和分类
                renderIndicators();
            }
        } catch (error) {
            handleLoadError(error);
        }
    }

    // 判断是否是 zhibiao.html 页面
    function isZhibiaoPage() {
        return window.location.pathname.includes('zhibiao.html');
    }

    // 首页初始化逻辑
    function initHomePage() {
        // 绑定搜索事件
        document.querySelector('.search-box').addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase().trim();
                const filtered = indicators.filter(indicator => 
                    indicator.name.toLowerCase().includes(searchTerm) ||
                    indicator.description.toLowerCase().includes(searchTerm)
                );
                renderIndicatorsBySearch(filtered);
            }, 300);
        });

        // 绑定分类事件
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderIndicators(btn.dataset.category);
            });
        });
    }

    // 渲染所有指标（无过滤）
    function renderAllIndicators() {
        const container = document.getElementById('indicatorContainer');
        container.innerHTML = '';
        indicators.forEach(indicator => {
            container.appendChild(createCardElement(indicator));
        });
    }

    // 通用卡片渲染逻辑
    function createCardElement(indicator) {
        const card = document.createElement('div');
        card.className = 'indicator-card';
        card.innerHTML = `
            <img src="${indicator.image}" alt="${indicator.name}缩略图" 
                 class="indicator-thumbnail" loading="lazy">
            <h3>${indicator.name}</h3>
            <p>${indicator.description}</p>
            <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
        `;
        return card;
    }

    // 详情页跳转（统一处理）
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-btn')) {
            const id = parseInt(e.target.dataset.id);
            const indicator = indicators.find(i => i.id === id);
            if (indicator) {
                window.open(`detail.html?id=${id}`, '_blank');
            } else {
                alert("未找到该指标！");
            }
        }
    });

    // 错误处理
    function handleLoadError(error) {
        console.error('数据加载失败:', error);
        alert('数据加载失败，请检查网络或文件路径！');
    }

    // 初始化加载
    loadIndicators();
})();
