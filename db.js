const dbName = 'CineWebDB';
const dbVersion = 1;
const storeName = 'movies';

// Inicializar o banco de dados
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = () => {
            reject('Erro ao abrir o banco de dados');
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                // Criar índices para busca rápida
                store.createIndex('title', 'title', { unique: false });
                store.createIndex('dateAdded', 'dateAdded', { unique: false });
            }
        };
    });
}

// Funções para manipular os filmes
const MovieDB = {
    // Converter arquivo para base64
    fileToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsDataURL(file);
        });
    },

    // Adicionar filme
    addMovie: async (movieData) => {
        try {
            const db = await initDB();
            const { title, description, imageFile, videoFile } = movieData;

            // Criar um Blob do vídeo
            const videoBlob = new Blob([videoFile], { type: videoFile.type });
            // Criar uma URL para o Blob
            const videoUrl = URL.createObjectURL(videoBlob);

            const movie = {
                title,
                description,
                image: imageFile,
                video: videoUrl,
                videoType: videoFile.type,
                videoBlob: videoBlob, // Armazenar o Blob também
                dateAdded: new Date().toISOString()
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(movie);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject('Erro ao adicionar filme');
            });
        } catch (error) {
            throw new Error('Erro ao processar arquivos: ' + error);
        }
    },

    // Obter todos os filmes
    getAllMovies: async () => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao obter filmes');
        });
    },

    // Obter filme por ID
    getMovie: async (id) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao obter filme');
        });
    },

    // Atualizar filme
    updateMovie: async (movie) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(movie);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject('Erro ao atualizar filme');
        });
    },

    // Deletar filme
    deleteMovie: async (id) => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject('Erro ao deletar filme');
        });
    }
}; 