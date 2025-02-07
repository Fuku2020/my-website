(function() {
    'use strict';

    let articles = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    let currentCategory = 'all';

    // 加载文章数据
    async function loadArticles() {
        try {
            const response = await fetch('articles.json');
            const data = await response.json();
            articles = data.articles;
            renderArticles();
            renderPagination();
        } catch (error) {
            console.error('文章加载失败:', error);
            alert('文章加载失败，请稍后重试！');
        }
    }

    // 渲染文章列表
    function renderArticles() {
        const container = document.getElementById('articleContainer');
        if (!container) return;

        const filteredArticles = currentCategory === 'all' 
            ? articles 
            : articles.filter(article => article.category === currentCategory);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

        container.innerHTML = paginatedArticles.map(article => `
            <article class="article-card" onclick="window.location.href='article-detail.html?id=${article.id}'">
                <div class="article-image">
                    <img src="${article.heroImage}" alt="${article.title}">
                </div>
                <div class="article-content">
                    <div>
                        <div class="article-meta">
                            <span class="article-author">
                                <img src="${article.author.avatar}" alt="${article.author.name}" class="author-avatar">
                                ${article.author.name}
                            </span>
                            <span class="article-date">${article.date}</span>
                        </div>
                        <h2 class="article-title">${article.title}</h2>
                        <p class="article-excerpt">${article.sharing ? article.sharing.description : article.content[0].content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}</p>
                        <div class="article-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // 渲染分页
    function renderPagination() {
        const container = document.getElementById('articlePagination');
        if (!container) return;

        const filteredArticles = currentCategory === 'all' 
            ? articles 
            : articles.filter(article => article.category === currentCategory);

        const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

        let paginationHTML = `
            <button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
        `;

        // 添加页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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

        paginationHTML += `
            <button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        `;

        container.innerHTML = paginationHTML;

        // 绑定分页按钮事件
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                
                if (btn.classList.contains('prev-btn')) {
                    if (currentPage > 1) {
                        currentPage--;
                    }
                } else if (btn.classList.contains('next-btn')) {
                    if (currentPage < totalPages) {
                        currentPage++;
                    }
                } else {
                    const page = parseInt(btn.dataset.page);
                    if (page !== currentPage) {
                        currentPage = page;
                    }
                }
                renderArticles();
                renderPagination();
            });
        });
    }

    // 绑定分类按钮事件
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            renderArticles();
            renderPagination();
        });
    });

    // 初始化加载
    document.addEventListener('DOMContentLoaded', loadArticles);
})(); 
