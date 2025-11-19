const ACCESS_KEY = 'bnS4WoeNt6nXOh7SzCM2JGNhQRCFHfxbtIW_HzYPQfs';
const API_URL = 'https://api.unsplash.com/search/photos';

const searchInput = document.getElementById('searchInput');
const gallery = document.getElementById('gallery');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const xhrBtn = document.getElementById('xhrBtn');
const promiseBtn = document.getElementById('promiseBtn');
const asyncBtn = document.getElementById('asyncBtn');


function showLoading() {
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    gallery.innerHTML = '';
    disableButtons();
}

function hideLoading() {
    loading.style.display = 'none';
    enableButtons();
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    hideLoading();
}

function disableButtons() {
    xhrBtn.disabled = true;
    promiseBtn.disabled = true;
    asyncBtn.disabled = true;
}

function enableButtons() {
    xhrBtn.disabled = false;
    promiseBtn.disabled = false;
    asyncBtn.disabled = false;
}


function createImageCard(photo, method) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const badgeClass = method === 'XHR' ? 'badge-xhr' : 
                      method === 'Promise' ? 'badge-promise' : 'badge-async';
    
    card.innerHTML = `
        <img src="${photo.urls.small}" alt="${photo.alt_description || 'Unsplash image'}" loading="lazy">
        <div class="image-info">
            <div class="photographer">Photo by ${photo.user.name}</div>
            <div class="description">${photo.alt_description || 'No description'}</div>
            <span class="method-badge ${badgeClass}">${method}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.open(photo.links.html, '_blank');
    });
    
    return card;
}


function displayResults(data, method) {
    hideLoading();
    
    if (data.results.length === 0) {
        gallery.innerHTML = `
            <div class="empty-state">
                <h2>No results found</h2>
                <p>Try searching for something else</p>
            </div>
        `;
        return;
    }
    
    data.results.forEach(photo => {
        const card = createImageCard(photo, method);
        gallery.appendChild(card);
    });
}


function searchWithXHR() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a search term');
        return;
    }
    
    showLoading();
    
    const xhr = new XMLHttpRequest();
    const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=12`;
    
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Authorization', `Client-ID ${ACCESS_KEY}`);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                displayResults(data, 'XHR');
            } catch (error) {
                showError('Error parsing response: ' + error.message);
            }
        } else {
            showError(`Error: ${xhr.status} - ${xhr.statusText}`);
        }
    };
    
    xhr.onerror = function() {
        showError('Network error occurred. Please check your connection.');
    };
    
    xhr.send();
}


function searchWithPromises() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a search term');
        return;
    }
    
    showLoading();
    
    const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=12`;
    
    fetch(url, {
        headers: {
            'Authorization': `Client-ID ${ACCESS_KEY}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayResults(data, 'Promise');
    })
    .catch(error => {
        showError('Error: ' + error.message);
    });
}


async function searchWithAsyncAwait() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a search term');
        return;
    }
    
    showLoading();
    
    try {
        const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=12`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${ACCESS_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data, 'Async/Await');
        
    } catch (error) {
        showError('Error: ' + error.message);
    }
}


xhrBtn.addEventListener('click', searchWithXHR);
promiseBtn.addEventListener('click', searchWithPromises);
asyncBtn.addEventListener('click', searchWithAsyncAwait);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWithAsyncAwait();
    }
});

window.addEventListener('load', () => {
    if (searchInput.value.trim()) {
        searchWithAsyncAwait();
    }
});