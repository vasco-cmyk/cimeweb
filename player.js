// Função para carregar e exibir o filme
async function loadMovie() {
    try {
        // Obter ID do filme da URL
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = parseInt(urlParams.get('id'));

        if (!movieId) {
            throw new Error('ID do filme não encontrado');
        }

        // Buscar filme do banco local
        const movie = await MovieDB.getMovie(movieId);
        if (!movie) {
            throw new Error('Filme não encontrado');
        }

        // Configurar o player de vídeo
        const player = document.getElementById('movie-player');
        if (!player) {
            throw new Error('Player não encontrado');
        }

        // Criar URL do vídeo
        const videoUrl = movie.videoBlob ? 
            URL.createObjectURL(movie.videoBlob) : 
            movie.video;

        // Configurar o vídeo
        player.innerHTML = `
            <source src="${videoUrl}" type="${movie.videoType || 'video/mp4'}">
            Seu navegador não suporta o elemento de vídeo.
        `;
        
        player.controls = true;
        player.style.width = '100%';
        player.style.height = '100%';

        // Limpar a URL do objeto quando o vídeo for descarregado
        player.addEventListener('emptied', () => {
            if (videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoUrl);
            }
        });

        // Debug de erros
        player.addEventListener('error', (e) => {
            console.error('Erro no player:', player.error);
            console.error('Detalhes do erro:', {
                code: player.error.code,
                message: player.error.message,
                videoType: movie.videoType,
                videoUrl: videoUrl
            });
            showErrorMessage(`Erro ao carregar o vídeo: ${player.error.message}`);
        });

        // Confirmar carregamento do vídeo
        player.addEventListener('loadeddata', () => {
            console.log('Vídeo carregado com sucesso');
        });

        // Atualizar apenas a descrição, sem o título
        document.getElementById('movie-description').textContent = movie.description;
        
        // Mostrar poster
        const posterContainer = document.querySelector('.movie-poster');
        if (posterContainer) {
            posterContainer.innerHTML = `<img src="${movie.image}" alt="${movie.title}">`;
        }

        // Buscar informações adicionais do TMDB
        try {
            const tmdbMovie = await TMDB.searchMovie(movie.title);
            if (tmdbMovie) {
                updateMovieInfo(tmdbMovie, movie);
            }
        } catch (tmdbError) {
            console.error('Erro ao buscar dados do TMDB:', tmdbError);
            // Continuar mesmo se o TMDB falhar
        }

    } catch (error) {
        console.error('Erro ao carregar filme:', error);
        showErrorMessage('Erro ao carregar o filme: ' + error.message);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Função para mostrar mensagens de erro
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Função para atualizar as informações do filme
function updateMovieInfo(tmdbMovie, localMovie) {
    if (tmdbMovie) {
        // Atualizar metadados
        if (tmdbMovie.release_date) {
            document.getElementById('movie-year').textContent = new Date(tmdbMovie.release_date).getFullYear();
        }
        if (tmdbMovie.runtime) {
            document.getElementById('movie-runtime').textContent = `${tmdbMovie.runtime}min`;
        }
        if (tmdbMovie.vote_average) {
            document.getElementById('movie-rating').innerHTML = `
                <span class="rating-star">★</span>
                ${tmdbMovie.vote_average.toFixed(1)}
            `;
        }

        // Atualizar gêneros
        if (tmdbMovie.genres) {
            document.getElementById('movie-genres').innerHTML = tmdbMovie.genres
                .map(genre => `<span class="genre-tag">${genre.name}</span>`)
                .join('');
        }

        // Atualizar elenco se disponível
        if (tmdbMovie.credits?.cast) {
            const castContainer = document.getElementById('movie-cast');
            if (castContainer) {
                const castHtml = tmdbMovie.credits.cast
                    .slice(0, 6)
                    .map(actor => `
                        <div class="cast-item">
                            <div class="cast-photo">
                                <img src="${TMDB.getImageUrl(actor.profile_path) || 'placeholder.jpg'}" alt="${actor.name}">
                            </div>
                            <div class="cast-name">${actor.name}</div>
                            <div class="cast-character">${actor.character}</div>
                        </div>
                    `)
                    .join('');
                castContainer.innerHTML = castHtml;
            }
        }
    }
}

// Função para buscar e reproduzir filme similar
async function searchAndPlay(title) {
    showNotification('Buscando filme...');
    // Implementar lógica para buscar e reproduzir filme similar
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = isError ? 'error-notification' : 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Iniciar carregamento quando a página carregar
document.addEventListener('DOMContentLoaded', loadMovie); 