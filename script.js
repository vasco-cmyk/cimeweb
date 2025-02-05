// Armazenar usuários no localStorage
const users = JSON.parse(localStorage.getItem('users')) || {
    admin: {
        username: 'admin',
        password: '123',
        isAdmin: true
    },
    user: {
        username: 'user',
        password: '123',
        isAdmin: false
    }
};

// Lista de filmes
// const movies = [ ... ]; // Remover esta parte

let currentTab = 'user';

function switchTab(tab) {
    currentTab = tab;
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Limpar campos
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showLoginForm() {
    document.getElementById('login-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('login-modal').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('register-modal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
    document.getElementById('register-form').reset();
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

// Cadastrar novo usuário
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Remover mensagem de erro anterior
    const oldError = document.querySelector('.error-message');
    if (oldError) oldError.remove();

    // Validações
    if (password !== confirmPassword) {
        showErrorMessage('As senhas não coincidem', 'register-form');
        return;
    }

    if (users[username]) {
        showErrorMessage('Este usuário já existe', 'register-form');
        return;
    }

    // Adicionar novo usuário
    users[username] = {
        username: username,
        password: password,
        isAdmin: false
    };

    // Salvar no localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Mostrar mensagem de sucesso e fechar modal
    showSuccessMessage('Cadastro realizado com sucesso!');
    closeRegisterModal();
});

// Verificar login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users[username];

    if (user && user.password === password) {
        if (user.isAdmin) {
            sessionStorage.setItem('isAdmin', 'true');
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
    } else {
        showErrorMessage('Usuário ou senha inválidos', 'login-form');
    }
});

function showErrorMessage(message, formId) {
    const form = document.getElementById(formId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.appendChild(errorDiv);
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Carregar filmes
async function loadMovies() {
    const container = document.getElementById('movies-container');
    container.innerHTML = '';

    try {
        const movies = await MovieDB.getAllMovies();

        if (movies.length === 0) {
            container.innerHTML = '<p class="no-movies">Nenhum filme disponível no momento.</p>';
            return;
        }

        movies.forEach((movie) => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.image}" alt="${movie.title}">
                <h3>${movie.title}</h3>
            `;
            movieCard.onclick = () => {
                window.location.href = `player.html?id=${movie.id}`;
            };
            container.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        container.innerHTML = '<p class="error">Erro ao carregar filmes</p>';
    }
}

// Fechar modal quando clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('login-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }

    const registerModal = document.getElementById('register-modal');
    if (event.target === registerModal) {
        closeRegisterModal();
    }
}

// Carregar filmes quando a página carregar
loadMovies(); 