// This file only handles DOM manipulation and communication with Python backend

const API_BASE_URL = window.location.origin;

// DOM Elements
const searchForm = document.getElementById('searchForm');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const noResults = document.getElementById('noResults');
const articlesGrid = document.getElementById('articlesGrid');
const articlesList = document.getElementById('articlesList');
const articleCount = document.getElementById('articleCount');
const modal = document.getElementById('articleModal');
const modalContent = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const viewBtns = document.querySelectorAll('.view-btn');

// State
let currentArticles = [];
let currentView = 'grid';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('NewsFlow app initialized');
    setupEventListeners();
    checkServerHealth();
});

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    searchForm.addEventListener('submit', handleSearch);

    // View toggle buttons
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            toggleView(currentView);
        });
    });

    // Modal close button
    modalCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();

        if (data.status === 'success') {
            console.log('✓ Server is healthy');
            if (data.api_status === 'not configured') {
                showToast('Warning: News API key not configured on server', 'warning');
            }
        }
    } catch (error) {
        console.error('Server health check failed:', error);
        showToast('Unable to connect to server. Please check if the server is running.', 'error');
    }
}

async function handleSearch(e) {
    e.preventDefault();

    // Get form values
    const keyword = document.getElementById('keyword').value.trim();
    const language = document.getElementById('language').value;
    const category = document.getElementById('category').value;
    const country = document.getElementById('country').value;
    const pagesize = document.getElementById('pagesize').value;

    // Validate keyword
    if (!keyword) {
        showToast('Please enter a search keyword', 'error');
        return;
    }

    // Prepare search data
    const searchData = {
        keyword: keyword,
        language: language,
        category: category,
        country: country,
        pagesize: parseInt(pagesize) || 20
    };

    console.log('Searching with params:', searchData);

    // Show loading state
    showLoading();

    try {
        // Call Python backend API
        const response = await fetch(`${API_BASE_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayArticles(data.articles);
        } else {
            hideLoading();
            showToast(data.message || 'Failed to fetch news', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showToast('Network error. Please check your connection and try again.', 'error');
    }
}

// Show Loading State
function showLoading() {
    loading.classList.add('active');
    results.classList.remove('active');
    noResults.classList.remove('active');
}

// Hide Loading State
function hideLoading() {
    loading.classList.remove('active');
}

// Display Articles
function displayArticles(articles) {
    hideLoading();
    currentArticles = articles;

    if (!articles || articles.length === 0) {
        noResults.classList.add('active');
        return;
    }

    // Show results section
    results.classList.add('active');
    articleCount.textContent = articles.length;

    // Clear previous results
    articlesGrid.innerHTML = '';
    articlesList.innerHTML = '';

    // Create article cards
    articles.forEach((article, index) => {
        // Create card for grid view
        const gridCard = createArticleCard(article, index);
        gridCard.addEventListener('click', () => openModal(article));
        articlesGrid.appendChild(gridCard);

        // Create card for list view
        const listCard = createArticleCard(article, index);
        listCard.classList.add('list-item');
        listCard.addEventListener('click', () => openModal(article));
        articlesList.appendChild(listCard);
    });

    // Apply current view
    toggleView(currentView);
}

// Create Article Card Element
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.style.animationDelay = `${index * 0.05}s`;

    // Format published date
    const publishedDate = formatDate(article.publishedAt);

    // Create image element or placeholder
    let imageHTML;
    if (article.urlToImage) {
        imageHTML = `<img src="${escapeHtml(article.urlToImage)}" 
                         alt="${escapeHtml(article.title)}" 
                         class="article-image" 
                         onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>📰</div>'">`;
    } else {
        imageHTML = `<div class="image-placeholder">📰</div>`;
    }

    // Build card HTML
    card.innerHTML = `
        ${imageHTML}
        <div class="article-content">
            <div class="article-meta">
                <span class="source-tag">${escapeHtml(article.source?.name || 'Unknown')}</span>
                <span class="date-tag">${publishedDate}</span>
            </div>
            <h3 class="article-title">${escapeHtml(article.title || 'No title')}</h3>
            ${article.description ? `<p class="article-description">${escapeHtml(article.description)}</p>` : ''}
            ${article.author ? `<p class="article-author">By ${escapeHtml(article.author)}</p>` : ''}
        </div>
    `;

    return card;
}

// Toggle View (Grid/List)
function toggleView(view) {
    if (view === 'grid') {
        articlesGrid.style.display = 'grid';
        articlesList.style.display = 'none';
    } else {
        articlesGrid.style.display = 'none';
        articlesList.style.display = 'flex';
    }
}

// Open Article Modal
function openModal(article) {
    const publishedDate = formatDateTime(article.publishedAt);

    // Build modal content
    let modalHTML = `
        <button class="modal-close" id="modalCloseBtn">×</button>
    `;

    // Add image if available
    if (article.urlToImage) {
        modalHTML += `
            <img src="${escapeHtml(article.urlToImage)}" 
                 alt="${escapeHtml(article.title)}" 
                 class="modal-image" 
                 onerror="this.remove()">
        `;
    }

    // Add title and metadata
    modalHTML += `
        <h2 class="modal-title">${escapeHtml(article.title || 'No title')}</h2>
        <div class="modal-meta">
            <div><strong>Source:</strong> ${escapeHtml(article.source?.name || 'Unknown')}</div>
            <div><strong>Published:</strong> ${publishedDate}</div>
            ${article.author ? `<div><strong>Author:</strong> ${escapeHtml(article.author)}</div>` : ''}
        </div>
    `;

    // Add description
    if (article.description) {
        modalHTML += `<p class="modal-description">${escapeHtml(article.description)}</p>`;
    }

    // Add additional details
    modalHTML += `<div style="margin: 2rem 0;">`;

    if (article.content) {
        modalHTML += `
            <div class="info-row">
                <div class="info-label">Content</div>
                <div class="info-value">${escapeHtml(article.content)}</div>
            </div>
        `;
    }

    if (article.url) {
        modalHTML += `
            <div class="info-row">
                <div class="info-label">URL</div>
                <div class="info-value">
                    <a href="${escapeHtml(article.url)}" target="_blank" 
                       style="color: var(--accent); word-break: break-all;">
                        ${escapeHtml(article.url)}
                    </a>
                </div>
            </div>
        `;
    }

    modalHTML += `</div>`;

    // Add link to full article
    if (article.url) {
        modalHTML += `
            <a href="${escapeHtml(article.url)}" 
               target="_blank" 
               class="modal-link">
                Read Full Article →
            </a>
        `;
    }

    // Update modal content
    modalContent.innerHTML = modalHTML;

    // Re-attach close button event listener
    const newCloseBtn = document.getElementById('modalCloseBtn');
    if (newCloseBtn) {
        newCloseBtn.addEventListener('click', closeModal);
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show Toast Notification
function showToast(message, type = 'error') {
    toastMessage.textContent = message;
    toast.className = `toast ${type} active`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// Utility Functions

// Format date to readable string
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time to readable string
function formatDateTime(dateString) {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Log app info
console.log('%c NewsFlow ', 'background: #e94560; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');
console.log('Frontend initialized and ready');
