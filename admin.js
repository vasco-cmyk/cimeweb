// Verificar se o usuário está logado como admin
if (!sessionStorage.getItem('isAdmin')) {
    window.location.href = 'index.html';
}

// Carregar filmes no painel admin
async function loadAdminMovies() {
    try {
        const movies = await MovieDB.getAllMovies();
        const container = document.getElementById('admin-movies-container');
        container.innerHTML = '';

        if (!movies || movies.length === 0) {
            container.innerHTML = '<p class="no-movies">Nenhum filme cadastrado</p>';
            return;
        }

        movies.forEach((movie) => {
            const movieCard = document.createElement('div');
            movieCard.className = 'admin-movie-card';
            movieCard.innerHTML = `
                <div class="movie-thumbnail">
                    <img src="${movie.image}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                </div>
                <div class="movie-actions">
                    <button onclick="editMovie(${movie.id})" class="edit-btn">Editar</button>
                    <button onclick="confirmDelete(${movie.id})" class="delete-btn">Excluir</button>
                </div>
            `;
            container.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        showErrorMessage('Erro ao carregar lista de filmes');
    }
}

// Função para confirmar exclusão
function confirmDelete(id) {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
        deleteMovie(id);
    }
}

// Função para deletar filme
async function deleteMovie(id) {
    try {
        await MovieDB.deleteMovie(id);
        showNotification('Filme excluído com sucesso!');
        loadAdminMovies(); // Recarregar a lista após excluir
    } catch (error) {
        console.error('Erro ao excluir filme:', error);
        showErrorMessage('Erro ao excluir filme');
    }
}

// Função para adicionar filme
async function addMovie(event) {
    event.preventDefault();
    
    const title = document.getElementById('movie-title').value;
    const description = document.getElementById('movie-description').value;
    const imageUrl = document.getElementById('movie-image-url').value;
    const videoFile = document.getElementById('movie-video').files[0];

    if (!title || !description || !imageUrl || !videoFile) {
        showErrorMessage('Por favor, preencha todos os campos');
        return;
    }

    const loadingNotification = showNotification('Salvando filme...', false);

    try {
        await MovieDB.addMovie({
            title,
            description,
            imageFile: imageUrl,
            videoFile
        });

        closeMovieModal();
        await loadAdminMovies(); // Recarregar a lista após adicionar
        showNotification('Filme adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar filme:', error);
        showErrorMessage('Erro ao salvar filme: ' + error.message);
    } finally {
        loadingNotification.remove();
    }
}

// Funções de notificação
function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = isSuccess ? 'success-notification' : 'loading-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    if (isSuccess) {
        setTimeout(() => notification.remove(), 3000);
    }
    return notification;
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAdminMovies(); // Carregar filmes quando a página carregar
    document.getElementById('movie-form').onsubmit = addMovie;
});

// Funções do modal
function showAddMovieForm() {
    document.getElementById('movie-modal').style.display = 'block';
    document.getElementById('movie-form').reset();
    document.querySelector('.preview-image').innerHTML = '';
}

function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

async function searchTMDB() {
    const searchInput = document.getElementById('movie-search').value;
    if (!searchInput) {
        showErrorMessage('Digite um título para buscar');
        return;
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=03c8493d3b37e6a3c5574063de87e7dd&language=pt-BR&query=${encodeURIComponent(searchInput)}`
        );
        const data = await response.json();
        
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        if (data.results.length === 0) {
            resultsContainer.innerHTML = '<p>Nenhum filme encontrado</p>';
            return;
        }

        data.results.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.className = 'movie-result';
            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                     alt="${movie.title}"
                     onerror="this.src='placeholder.jpg'">
                <h4>${movie.title}</h4>
            `;
            movieElement.onclick = () => selectMovie(movie);
            resultsContainer.appendChild(movieElement);
        });
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        showErrorMessage('Erro ao buscar filmes');
    }
}

async function selectMovie(movie) {
    try {
        const details = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=03c8493d3b37e6a3c5574063de87e7dd&language=pt-BR`
        ).then(res => res.json());

        document.getElementById('movie-title').value = movie.title;
        document.getElementById('movie-description').value = details.overview || movie.overview;
        
        // Salvar a URL da imagem
        const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        document.getElementById('movie-image-url').value = imageUrl;
        
        // Mostrar preview
        const previewContainer = document.querySelector('.preview-image');
        previewContainer.innerHTML = `<img src="${imageUrl}" alt="${movie.title}">`;

        // Limpar resultados da busca
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('movie-search').value = '';

    } catch (error) {
        console.error('Erro ao obter detalhes do filme:', error);
        showErrorMessage('Erro ao carregar detalhes do filme');
    }
}

// Adicionar preview da imagem
document.getElementById('movie-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.querySelector('.preview-image');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}); 