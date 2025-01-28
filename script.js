// 模拟指标数据
const indicators = [
    {
        id: 1,
        name: "布林带通道",
        category: ["trend", "volatility"],
        description: "经典波动率通道指标，识别超买超卖区域",
        image: "bollinger.png",
        download: "assets/downloads/bollinger.zip",
        content: `<h3>使用说明</h3>
                 <p>1. 价格触及上轨时可能出现回调</p>
                 <p>2. 通道收窄预示即将突破</p>
                 <p>3. 结合RSI指标确认信号</p>`
    },
    {
        id: 2,
        name: "MACD指标",
        category: ["trend", "oscillator"],
        description: "趋势跟踪动量指标，识别买卖信号",
        image: "macd.png",
        download: "assets/downloads/macd.zip",
        content: `<h3>使用技巧</h3>
                 <p>1. 观察快慢线交叉</p>
                 <p>2. 关注柱状图变化</p>
                 <p>3. 结合零轴判断趋势方向</p>`
    }
];

// 初始化渲染
function renderIndicators(filter = 'all') {
    const container = document.getElementById('indicatorContainer');
    container.innerHTML = '';

    indicators.forEach(indicator => {
        if (filter !== 'all' && !indicator.category.includes(filter)) return;

        const card = document.createElement('div');
        card.className = 'indicator-card';
        card.innerHTML = `
            <img src="${indicator.image}" class="indicator-thumbnail">
            <h3>${indicator.name}</h3>
            <p>${indicator.description}</p>
            <button onclick="showDetail(${indicator.id})" class="download-btn">查看详情</button>
        `;
        container.appendChild(card);
    });
}

// 显示详情页
function showDetail(id) {
    const indicator = indicators.find(i => i.id === id);
    document.getElementById('indicatorContainer').style.display = 'none';
    document.getElementById('detailPage').style.display = 'block';
    
    document.getElementById('detailTitle').textContent = indicator.name;
    document.getElementById('detailImage').src = indicator.image;
    document.getElementById('detailContent').innerHTML = indicator.content;
    document.getElementById('detailDownload').href = indicator.download;
}

// 返回列表页
function showListPage() {
    document.getElementById('indicatorContainer').style.display = 'grid';
    document.getElementById('detailPage').style.display = 'none';
}

// 分类筛选
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderIndicators(btn.dataset.category);
    });
});

// 搜索功能
document.querySelector('.search-box').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = indicators.filter(indicator => 
        indicator.name.toLowerCase().includes(searchTerm) ||
        indicator.description.toLowerCase().includes(searchTerm)
    );
    renderIndicatorsBySearch(filtered);
});

function renderIndicatorsBySearch(filtered) {
    const container = document.getElementById('indicatorContainer');
    container.innerHTML = '';
    filtered.forEach(indicator => {
        const card = document.createElement('div');
        card.className = 'indicator-card';
        card.innerHTML = `
            <img src="${indicator.image}" class="indicator-thumbnail">
            <h3>${indicator.name}</h3>
            <p>${indicator.description}</p>
            <button onclick="showDetail(${indicator.id})" class="download-btn">查看详情</button>
        `;
        container.appendChild(card);
    });
}

// 初始加载
renderIndicators();
