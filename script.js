// DOM elements
const elements = {
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    moviesGrid: document.getElementById('moviesGrid'),
    pagination: document.getElementById('pagination'),
    movieModal: document.getElementById('movieModal'),
    closeModal: document.getElementById('closeModal'),
    modalPoster: document.getElementById('modalPoster'),
    modalTitle: document.getElementById('modalTitle'),
    modalRating: document.getElementById('modalRating'),
    modalDate: document.getElementById('modalDate'),
    modalOverview: document.getElementById('modalOverview'),
    modalReleaseDate: document.getElementById('modalReleaseDate'),
    modalVoteCount: document.getElementById('modalVoteCount')
};

let currentPage = 1;
let totalPages = 1;
let currentMovies = [];

// Utility functions
function showStatus(type, message) {
    elements.loadingIndicator.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
    elements.successMessage.classList.add('hidden');
    
    if (type === 'loading') elements.loadingIndicator.classList.remove('hidden');
    if (type === 'error') {
        elements.errorMessage.textContent = message;
        elements.errorMessage.classList.remove('hidden');
    }
    if (type === 'success') {
        elements.successMessage.textContent = message;
        elements.successMessage.classList.remove('hidden');
    }
}

// API functions demonstrating JavaScript promises
function fetchMovies(page = 1) {
    showStatus('loading');
    currentPage = page;
    
    return fetch(`https://jsonfakery.com/movies/paginated?page=${page}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            currentMovies = data.data;
            totalPages = data.last_page;
            currentPage = data.current_page;
            
            displayMovies(currentMovies);
            setupPagination(data);
            showStatus('success', `Loaded ${data.data.length} movies from page ${currentPage}`);
            return data;
        })
        .catch(error => {
            showStatus('error', `Failed to load movies: ${error.message}`);
            throw error;
        })
        .finally(() => {
            // Promise finally block - cleanup operations can go here
        });
}

// Display functions
function displayMovies(movies) {
    if (movies.length === 0) {
        elements.moviesGrid.innerHTML = `
            <div class="empty-state">
                <h3>🎬 No movies found</h3>
                <p>Try loading a different page!</p>
            </div>`;
        return;
    }

    elements.moviesGrid.innerHTML = movies.map((movie, index) => `
        <div class="movie-card" style="animation-delay: ${index * 0.05}s" data-movie-index="${index}">
            <img src="${movie.poster_path || 'https://via.placeholder.com/280x200?text=No+Image'}" 
                 alt="${movie.original_title}" class="movie-poster"
                 onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.original_title}</h3>
                <p class="movie-overview">${movie.overview || 'No description available.'}</p>
                <div class="movie-meta">
                    <span class="movie-rating">⭐ ${movie.vote_average}/10</span>
                    <span class="movie-date">${new Date(movie.release_date).getFullYear() || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listeners to movie cards
    addMovieCardListeners();
}

function addMovieCardListeners() {
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach((card) => {
        card.addEventListener('click', () => {
            const movieIndex = parseInt(card.dataset.movieIndex);
            const movie = currentMovies[movieIndex];
            showMovieModal(movie);
        });
    });
}

function showMovieModal(movie) {
    elements.modalPoster.src = movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Image';
    elements.modalTitle.textContent = movie.original_title;
    elements.modalRating.textContent = `⭐ ${movie.vote_average}/10`;
    elements.modalDate.textContent = new Date(movie.release_date).getFullYear() || 'N/A';
    elements.modalOverview.textContent = movie.overview || 'No description available.';
    elements.modalReleaseDate.textContent = movie.release_date || 'N/A';
    elements.modalVoteCount.textContent = movie.vote_count || 'N/A';
    
    elements.movieModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideMovieModal() {
    elements.movieModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function setupPagination(data) {
    if (data.last_page <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    const maxVisible = 5;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(data.last_page, start + maxVisible - 1);
    let html = '';

    // Previous button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">« Previous</button>`;
    }
    
    // First page
    if (start > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (start > 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = start; i <= end; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Last page
    if (end < data.last_page) {
        if (end < data.last_page - 1) {
            html += `<span class="page-dots">...</span>`;
        }
        html += `<button class="page-btn" onclick="changePage(${data.last_page})">${data.last_page}</button>`;
    }
    
    // Next button
    if (currentPage < data.last_page) {
        html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next »</button>`;
    }

    elements.pagination.innerHTML = html;
}

function changePage(page) {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
        fetchMovies(page);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Event listeners
elements.closeModal.addEventListener('click', hideMovieModal);

elements.movieModal.addEventListener('click', (e) => {
    if (e.target === elements.movieModal || e.target.classList.contains('modal-backdrop')) {
        hideMovieModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.movieModal.classList.contains('hidden')) {
        hideMovieModal();
    }
});

// Make changePage globally accessible
window.changePage = changePage;

// Load initial movies on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(1);
});