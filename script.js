// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;
    let currentPage = 1; // 当前页码
    const itemsPerPage = 9; // 每页显示的指标数量

    // 加载指标数据
    async function loadIndicators() {
        try {
            const response = await fetch('card.json'); // 修改为 card.json
            indicators = await response.json();
            renderIndicators();
            renderPagination(); // 渲染分页按钮
        } catch (error) {
            console.error('数据加载失败:', error);
            alert('指标数据加载失败，请稍后重试！');
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
})();
