const TMDB_API_KEY = '03c8493d3b37e6a3c5574063de87e7dd';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const TMDB = {
    // Buscar filme por título
    searchMovie: async (title) => {
        try {
            console.log('Searching for movie:', title);
            const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(title)}`;
            console.log('Request URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('TMDB search response:', data);
            return data.results[0]; // Retorna o primeiro resultado
        } catch (error) {
            console.error('Error in searchMovie:', error);
            return null;
        }
    },

    // Obter detalhes do filme
    getMovieDetails: async (tmdbId) => {
        try {
            console.log('Getting details for movie ID:', tmdbId);
            const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=credits,reviews,similar`;
            console.log('Request URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('TMDB details response:', data);
            return data;
        } catch (error) {
            console.error('Error in getMovieDetails:', error);
            return null;
        }
    },

    // Obter URL da imagem
    getImageUrl: (path, size = 'w500') => {
        if (!path) return null;
        return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
    }
}; 