// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;

    // 加载指标数据
    async function loadIndicators() {
        try {
            const response = await fetch('card.json'); // 修改为 card.json
            indicators = await response.json();
            renderIndicators();
        } catch (error) {
            console.error('数据加载失败:', error);
            alert('指标数据加载失败，请稍后重试！');
        }
    }

    // 渲染指标卡片
    function renderIndicators(filter = 'all') {
        const container = document.getElementById('indicatorContainer');
        container.innerHTML = '';

        indicators.forEach(indicator => {
            if (filter !== 'all' && !indicator.category.includes(filter)) return;

            const card = document.createElement('div');
            card.className = 'indicator-card';
            card.innerHTML = `
                <img src="${indicator.image}" alt="${indicator.name}缩略图" 
                     class="indicator-thumbnail" loading="lazy">
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });
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
            renderIndicatorsBySearch(filtered);
        }, 300);
    });

    // 渲染搜索结果
    function renderIndicatorsBySearch(filtered) {
        const container = document.getElementById('indicatorContainer');
        container.innerHTML = '';
        filtered.forEach(indicator => {
            const card = document.createElement('div');
            card.className = 'indicator-card';
            card.innerHTML = `
                <img src="${indicator.image}" alt="${indicator.name}缩略图" 
                     class="indicator-thumbnail" loading="lazy">
                <h3>${indicator.name}</h3>
                <p>${indicator.description}</p>
                <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
            `;
            container.appendChild(card);
        });
    }

    // 初始化加载数据
    loadIndicators();
})();
