// script.js
(function () {
    'use strict';

    let indicators = [];
    let timeout;

    async function loadIndicators() {
        try {
            const response = await fetch('indicators.json');
            indicators = await response.json();
            renderIndicators();
        } catch (error) {
            console.error('数据加载失败:', error);
            alert('指标数据加载失败，请稍后重试！');
        }
    }

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

    function showDetail(id) {
        const indicator = indicators.find(i => i.id === id);
        if (!indicator) return alert("未找到该指标！");

        history.pushState({ page: 'detail', id }, '', `#detail=${id}`);
        document.getElementById('indicatorContainer').style.display = 'none';
        document.getElementById('detailPage').style.display = 'block';
        
        document.getElementById('detailTitle').textContent = indicator.name;
        document.getElementById('detailImage').src = indicator.image;
        document.getElementById('detailContent').innerHTML = indicator.content;
        document.getElementById('detailDownload').href = indicator.download;
    }

    function showListPage() {
        history.back();
    }

    // 暴露到全局
    window.showListPage = showListPage;

    document.getElementById('indicatorContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('detail-btn')) {
            const id = parseInt(e.target.dataset.id);
            showDetail(id);
        }
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderIndicators(btn.dataset.category);
        });
    });

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

    window.addEventListener('popstate', (e) => {
        if (e.state?.page === 'detail') {
            showDetail(e.state.id);
        } else {
            document.getElementById('indicatorContainer').style.display = 'grid';
            document.getElementById('detailPage').style.display = 'none';
        }
    });

    loadIndicators();
})();
