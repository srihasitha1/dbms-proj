// DOM Elements
const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// State
let recipes = [];
let currentUser = null;

// Event Listeners
searchInput.addEventListener('input', filterRecipes);
categoryFilter.addEventListener('change', filterRecipes);
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Functions
async function fetchRecipes() {
    try {
        const response = await fetch('/api/recipes.php');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        
        recipes = await response.json();
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        showToast('Error loading recipes', 'error');
    }
}

function renderRecipes(recipesToRender) {
    recipeGrid.innerHTML = recipesToRender.map(recipe => `
        <div class="col-md-4">
            <div class="card recipe-card h-100">
                <img src="${recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}" 
                     class="card-img-top" alt="${recipe.title}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text text-muted">${recipe.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-clock me-1"></i>
                            <small>${recipe.cooking_time}</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-people me-1"></i>
                            <small>${recipe.servings} servings</small>
                        </div>
                        <span class="difficulty-badge difficulty-${recipe.difficulty.toLowerCase()}">
                            ${recipe.difficulty}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) ||
                            recipe.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || recipe.category === category;
        return matchesSearch && matchesCategory;
    });

    renderRecipes(filtered);
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = { email: formData.get('email') };
            showToast('Logged in successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            updateAuthUI();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showToast(error.message || 'Error logging in', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (formData.get('password') !== formData.get('confirmPassword')) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Registration successful! You can now log in.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error registering:', error);
        showToast(error.message || 'Error during registration', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            showToast('Logged out successfully', 'success');
            updateAuthUI();
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Error logging out:', error);
        showToast('Error logging out', 'error');
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.navbar .d-flex');
    if (currentUser) {
        authButtons.innerHTML = `
            <button class="btn btn-warning" onclick="handleLogout()">
                <i class="bi bi-box-arrow-right me-1"></i> Logout
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline-warning" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-box-arrow-in-right me-1"></i> Login
            </button>
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#registerModal">
                <i class="bi bi-person-plus me-1"></i> Register
            </button>
        `;
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '1rem';
    toastContainer.style.right = '1rem';
    toastContainer.style.zIndex = '1050';

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toastContainer);
    });
}

// Initialize
fetchRecipes();