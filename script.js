// DOM elements
const elements = {
    loadMoviesBtn: document.getElementById('loadMoviesBtn'),
    loadRandomMovieBtn: document.getElementById('loadRandomMovieBtn'),
    clearMoviesBtn: document.getElementById('clearMoviesBtn'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    promiseLog: document.getElementById('promiseLog'),
    moviesGrid: document.getElementById('moviesGrid'),
    pagination: document.getElementById('pagination')
};

let currentPage = 1;

// Utility functions
function log(message, type = 'info') {
    const logEntry = document.createElement('p');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    elements.promiseLog.appendChild(logEntry);
    elements.promiseLog.scrollTop = elements.promiseLog.scrollHeight;
}

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
    log(` Starting promise to fetch movies (page ${page})`, 'info');
    showStatus('loading');
    
    return fetch(`https://jsonfakery.com/movies/paginated?page=${page}`)
        .then(response => {
            log(` Promise resolved - HTTP ${response.status}`, 'success');
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            log(` Successfully fetched ${data.data.length} movies`, 'success');
            currentPage = data.current_page;
            displayMovies(data.data);
            setupPagination(data);
            showStatus('success', `Loaded ${data.data.length} movies successfully!`);
            return data;
        })
        .catch(error => {
            log(` Promise rejected: ${error.message}`, 'error');
            showStatus('error', `Failed to load movies: ${error.message}`);
            throw error;
        })
        .finally(() => {
            log(' Promise finally block executed - cleanup complete', 'warning');
            setTimeout(() => log(' Finally always runs regardless of success/failure', 'info'), 1000);
        });
}

function fetchRandomMovie() {
    log(' Fetching random movie using promise chain', 'info');
    showStatus('loading');
    
    return fetch('https://jsonfakery.com/movies/random')
        .then(response => {
            log(' Random movie API responded', 'success');
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
            return response.json();
        })
        .then(movieData => {
            log(' Random movie data processed', 'success');
            elements.moviesGrid.innerHTML = '';
            displayMovies([movieData]);
            elements.pagination.classList.add('hidden');
            showStatus('success', 'Random movie loaded successfully!');
            return movieData;
        })
        .catch(error => {
            log(` Random movie fetch failed: ${error.message}`, 'error');
            showStatus('error', `Failed to load random movie: ${error.message}`);
        })
        .finally(() => {
            log(' Random movie promise completed (finally)', 'warning');
        });
}

// Display functions
function displayMovies(movies) {
    if (movies.length === 0) {
        elements.moviesGrid.innerHTML = `
            <div class="empty-state">
                <h3> No movies found</h3>
                <p>Click "Load Movies" to fetch some movies!</p>
            </div>`;
        return;
    }

    elements.moviesGrid.innerHTML = movies.map((movie, index) => `
        <div class="movie-card" style="animation-delay: ${index * 0.1}s">
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
}

function setupPagination(data) {
    if (data.last_page <= 1) {
        elements.pagination.classList.add('hidden');
        return;
    }

    const maxVisible = 5;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(data.last_page, start + maxVisible - 1);
    let html = '';

    if (currentPage > 1) html += `<button class="page-btn" onclick="changePage(${currentPage - 1})">« Previous</button>`;
    
    for (let i = start; i <= end; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (currentPage < data.last_page) html += `<button class="page-btn" onclick="changePage(${currentPage + 1})">Next »</button>`;

    elements.pagination.innerHTML = html;
    elements.pagination.classList.remove('hidden');
}

function changePage(page) {
    if (page !== currentPage) {
        log(` Navigating to page ${page}`, 'info');
        fetchMovies(page)
            .then(() => log(` Successfully loaded page ${page}`, 'success'))
            .catch(error => log(` Failed to load page ${page}: ${error.message}`, 'error'));
    }
}

function clearMovies() {
    log('🧹 Clearing movies display', 'info');
    elements.moviesGrid.innerHTML = '';
    elements.pagination.classList.add('hidden');
    showStatus();
    log('✨ Display cleared - ready for new content', 'success');
}

// Event listeners
elements.loadMoviesBtn.addEventListener('click', () => {
    fetchMovies(1)
        .then(() => log(' Movie loading promise chain completed!', 'success'))
        .catch(() => log(' Movie loading promise chain failed', 'error'));
});

elements.loadRandomMovieBtn.addEventListener('click', () => {
    fetchRandomMovie()
        .then(() => log(' Random movie promise executed successfully!', 'success'))
        .catch(() => log(' Random movie promise failed', 'error'));
});

elements.clearMoviesBtn.addEventListener('click', clearMovies);

// Make changePage globally accessible
window.changePage = changePage;

// Welcome message
setTimeout(() => {
    log(' Welcome! This demo shows JavaScript promises with then(), catch(), and finally()', 'info');
    log(' Click buttons above to see promises in action with real API calls', 'info');
}, 1000);