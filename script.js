// DOM elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
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
let allMovies = [];
let isSearchMode = false;
let currentSearchTerm = '';

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
    
    return fetch(`https://jsonfakery.com/movies/paginated?page=${page}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            currentPage = data.current_page;
            
            // Use spread operator to add new movies to existing ones
            if (page === 1) {
                allMovies = [...data.data];
            } else {
                allMovies = [...allMovies, ...data.data];
            }
            
            displayMovies(allMovies);
            showStatus('success', `Loaded ${data.data.length} more movies successfully!`);
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

function searchMovies(query) {
    if (!query.trim()) {
        displayMovies(allMovies);
        isSearchMode = false;
        return;
    }
    
    showStatus('loading');
    isSearchMode = true;
    currentSearchTerm = query;
    
    return fetch(`https://jsonfakery.com/movies/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const searchResults = Array.isArray(data) ? data : data.data || [];
            displayMovies(searchResults);
            showStatus('success', `Found ${searchResults.length} movies matching "${query}"`);
            return searchResults;
        })
        .catch(error => {
            showStatus('error', `Search failed: ${error.message}`);
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
                <p>Try a different search term or load more movies!</p>
            </div>`;
        return;
    }

    elements.moviesGrid.innerHTML = movies.map((movie, index) => `
        <div class="movie-card" style="animation-delay: ${index * 0.05}s" data-movie-id="${movie.id || index}">
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

    // Add hover event listeners to movie cards
    addMovieCardListeners(movies);
}

function addMovieCardListeners(movies) {
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            const movie = movies[index];
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

function loadMoreMovies() {
    if (isSearchMode) {
        showStatus('error', 'Cannot load more movies while in search mode. Clear search first.');
        return;
    }
    
    const nextPage = currentPage + 1;
    fetchMovies(nextPage);
}

function handleSearch() {
    const query = elements.searchInput.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        // If search is empty, show all movies
        displayMovies(allMovies);
        isSearchMode = false;
        showStatus('success', 'Showing all movies');
    }
}

// Event listeners
elements.searchBtn.addEventListener('click', handleSearch);

elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

elements.searchInput.addEventListener('input', (e) => {
    if (e.target.value === '') {
        displayMovies(allMovies);
        isSearchMode = false;
        showStatus('success', 'Showing all movies');
    }
});

elements.loadMoreBtn.addEventListener('click', loadMoreMovies);

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

// Load initial movies on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(1);
});