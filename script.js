const elements = {
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    moviesGrid: document.getElementById('moviesGrid'),
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
let isLoading = false;
let hasMorePages = true;

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

function createGhostCards(count = 6) {
    const ghostCards = [];
    for (let i = 0; i < count; i++) {
        ghostCards.push(`
            <div class="movie-card ghost-loading">
                <div class="ghost-poster"></div>
                <div class="movie-info">
                    <div class="ghost-title"></div>
                    <div class="ghost-overview"></div>
                    <div class="ghost-overview"></div>
                    <div class="movie-meta">
                        <div class="ghost-rating"></div>
                        <div class="ghost-date"></div>
                    </div>
                </div>
            </div>
        `);
    }
    return ghostCards.join('');
}

function showGhostLoading() {
    const ghostContainer = document.createElement('div');
    ghostContainer.id = 'ghostContainer';
    ghostContainer.innerHTML = createGhostCards();
    elements.moviesGrid.appendChild(ghostContainer);
}

function removeGhostLoading() {
    const ghostContainer = document.getElementById('ghostContainer');
    if (ghostContainer) {
        ghostContainer.remove();
    }
}

function fetchMovies(page = 1, append = false) {
    if (isLoading) return Promise.resolve();
    
    isLoading = true;
    
    if (!append) {
        showStatus('loading');
    } else {
        showGhostLoading();
    }
    
    return fetch(`https://jsonfakery.com/movies/paginated?page=${page}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (append) {
                // Append new movies to existing array
                currentMovies = [...currentMovies, ...data.data];
                removeGhostLoading();
                appendMovies(data.data);
            } else {
                // Replace movies (initial load)
                currentMovies = data.data;
                displayMovies(currentMovies);
            }
            
            totalPages = data.last_page;
            currentPage = data.current_page;
            hasMorePages = currentPage < totalPages;
            
            if (!append) {
                showStatus('success', `Loaded ${data.data.length} movies`);
            }
            
            return data;
        })
        .catch(error => {
            removeGhostLoading();
            showStatus('error', `Failed to load movies: ${error.message}`);
            throw error;
        })
        .finally(() => {
            isLoading = false;
        });
}

// Display functions
function displayMovies(movies) {
    if (movies.length === 0) {
        elements.moviesGrid.innerHTML = `
            <div class="empty-state">
                <h3>🎬 No movies found</h3>
                <p>Try refreshing the page!</p>
            </div>`;
        return;
    }

    elements.moviesGrid.innerHTML = movies.map((movie, index) => createMovieCard(movie, index)).join('');
    addMovieCardListeners();
}

// Append new movies to existing grid
function appendMovies(movies) {
    const startIndex = currentMovies.length - movies.length;
    const newMoviesHTML = movies.map((movie, index) => 
        createMovieCard(movie, startIndex + index)
    ).join('');
    
    elements.moviesGrid.insertAdjacentHTML('beforeend', newMoviesHTML);
    
    // Add listeners only to new cards
    const newCards = elements.moviesGrid.querySelectorAll('.movie-card:not([data-listener-added])');
    newCards.forEach((card) => {
        card.addEventListener('click', () => {
            const movieIndex = parseInt(card.dataset.movieIndex);
            const movie = currentMovies[movieIndex];
            showMovieModal(movie);
        });
        card.setAttribute('data-listener-added', 'true');
    });
}

function createMovieCard(movie, index) {
    return `
        <div class="movie-card" style="animation-delay: ${(index % 20) * 0.05}s" data-movie-index="${index}">
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
    `;
}

function addMovieCardListeners() {
    const movieCards = document.querySelectorAll('.movie-card:not([data-listener-added])');
    movieCards.forEach((card) => {
        card.addEventListener('click', () => {
            const movieIndex = parseInt(card.dataset.movieIndex);
            const movie = currentMovies[movieIndex];
            showMovieModal(movie);
        });
        card.setAttribute('data-listener-added', 'true');
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

// Infinite scroll functionality
function handleScroll() {
    // Check if user has scrolled near the bottom
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Trigger load when user is 200px from bottom
    if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMoreMovies();
    }
}

function loadMoreMovies() {
    if (!isLoading && hasMorePages) {
        const nextPage = currentPage + 1;
        fetchMovies(nextPage, true);
    }
}

// Throttle scroll event for better performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
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

// Add scroll event listener with throttling
window.addEventListener('scroll', throttle(handleScroll, 100));

// Load initial movies on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(1);
});