// zhibiao.js - 专门用于 zhibiao.html
let indicators = [];
let currentPage = 1;
const itemsPerPage = 15; // zhibiao.html 每页显示15个
let timeout;

// 加载指标数据
async function loadIndicators() {
    try {
        const response = await fetch('card.json');
        indicators = await response.json();
        renderIndicators();
        renderPagination();
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
            <img src="${indicator.image || 'image/default.png'}" alt="${indicator.name}缩略图" 
                 class="indicator-thumbnail" loading="lazy">
            <h3>${indicator.name}</h3>
            <p>${indicator.description}</p>
            <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
        `;
        container.appendChild(card);
    });

    renderPagination();
}

// 修改渲染分页按钮函数
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

// 绑定事件：点击卡片按钮
document.getElementById('indicatorContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('detail-btn')) {
        const id = parseInt(e.target.dataset.id);
        window.location.href = `detail.html?id=${id}`;
    }
});

// 绑定事件：分类按钮点击
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPage = 1;
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
        currentPage = 1;
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
            <img src="${indicator.image || 'image/default.png'}" alt="${indicator.name}缩略图" 
                 class="indicator-thumbnail" loading="lazy">
            <h3>${indicator.name}</h3>
            <p>${indicator.description}</p>
            <button data-id="${indicator.id}" class="detail-btn">查看详情</button>
        `;
        container.appendChild(card);
    });

    renderPagination();
}

// 初始化加载数据
loadIndicators(); 
