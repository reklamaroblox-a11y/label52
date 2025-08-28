// Конфигурация API - используем Netlify Functions
const API_BASE_URL = '/.netlify/functions/api';

// Элементы DOM
const playerSearch = document.getElementById('playerSearch');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('results');
const loadingSpinner = document.getElementById('loadingSpinner');
const playerProfile = document.getElementById('playerProfile');
const deckSection = document.getElementById('deckSection');
const statsSection = document.getElementById('statsSection');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Элементы профиля игрока
const playerAvatar = document.getElementById('playerAvatar');
const playerLevel = document.getElementById('playerLevel');
const playerName = document.getElementById('playerName');
const playerTag = document.getElementById('playerTag');
const topTrophies = document.getElementById('topTrophies');
const currentTrophies = document.getElementById('currentTrophies');
const playerArena = document.getElementById('playerArena');
const deckGrid = document.getElementById('deckGrid');

// Элементы статистики
const totalWins = document.getElementById('totalWins');
const totalGames = document.getElementById('totalGames');
const winRate = document.getElementById('winRate');
const maxLevel = document.getElementById('maxLevel');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик поиска по кнопке
    searchBtn.addEventListener('click', searchPlayer);
    
    // Обработчик поиска по Enter
    playerSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPlayer();
        }
    });
    
    // Мобильное меню
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Тестируем API при загрузке страницы
    testAPI();
});

// Функция тестирования API
async function testAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/cards`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ API работает корректно');
        } else {
            console.warn('⚠️ API вернул статус:', response.status);
        }
    } catch (error) {
        console.error('❌ Ошибка при тестировании API:', error);
    }
}

// Функция поиска игрока
async function searchPlayer() {
    const playerTag = playerSearch.value.trim();
    
    if (!playerTag) {
        showError('Введите тег игрока');
        return;
    }
    
    // Проверка формата тега
    if (!playerTag.startsWith('#')) {
        showError('Тег игрока должен начинаться с #');
        return;
    }
    
    // Очистка предыдущих результатов
    hideError();
    showLoading();
    
    try {
        // Получение данных игрока
        const playerData = await fetchPlayerData(playerTag);
        
        // Отображение результатов
        displayPlayerProfile(playerData);
        displayPlayerDeck(playerData);
        displayPlayerStats(playerData);
        
        hideLoading();
        showResults();
        
    } catch (error) {
        console.error('Ошибка при поиске игрока:', error);
        hideLoading();
        showError(error.message || 'Произошла ошибка при поиске игрока');
    }
}

// Функция получения данных игрока
async function fetchPlayerData(playerTag) {
    const url = `${API_BASE_URL}/players/${encodeURIComponent(playerTag)}`;
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Добавляем API ключ для прямого вызова прокси
        if (TEMP_API_KEY && TEMP_API_KEY !== 'YOUR_API_KEY_HERE') {
            headers['Authorization'] = `Bearer ${TEMP_API_KEY}`;
        }
        
        const response = await fetch(url, { headers });
        
        const data = await response.json();
        
        // Проверяем, есть ли ошибка в ответе от API
        if (data.reason) {
            throw new Error(data.message || data.reason || 'Произошла ошибка при получении данных');
        }
        
        // Проверяем HTTP статус
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Игрок не найден. Проверьте правильность тега.');
            } else if (response.status === 403) {
                throw new Error('Ошибка доступа к API. Проверьте API ключ и попробуйте позже.');
            } else if (response.status === 429) {
                throw new Error('Превышен лимит запросов к API. Попробуйте позже.');
            } else if (response.status === 503) {
                throw new Error('Сервис временно недоступен. Попробуйте позже.');
            } else {
                throw new Error(`Ошибка API: ${response.status} - ${data.message || data.reason || 'Неизвестная ошибка'}`);
            }
        }
        
        return data;
        
    } catch (error) {
        // Если это наша ошибка, просто пробрасываем её
        if (error.message.includes('Игрок не найден') || 
            error.message.includes('Ошибка доступа') ||
            error.message.includes('Превышен лимит') ||
            error.message.includes('Сервис временно недоступен')) {
            throw error;
        }
        
        // Для других ошибок добавляем контекст
        console.error('Ошибка при запросе к API:', error);
        throw new Error(`Ошибка сети: ${error.message}`);
    }
}

// Функция получения колоды игрока
async function fetchPlayerDeck(playerTag) {
    // Колода игрока уже включена в основные данные игрока
    // Эта функция оставлена для возможного расширения в будущем
    return null;
}

// Функция отображения профиля игрока
function displayPlayerProfile(playerData) {
    // Основная информация
    playerName.textContent = playerData.name;
    playerTag.textContent = playerData.tag;
    playerLevel.textContent = playerData.expLevel;
    
    // Статистика
    topTrophies.textContent = playerData.bestTrophies?.toLocaleString() || '0';
    currentTrophies.textContent = playerData.trophies?.toLocaleString() || '0';
    
    // Определение арены
    const arena = getArenaByTrophies(playerData.trophies);
    playerArena.textContent = arena;
    
    // Аватар (используем заглушку, так как API не предоставляет прямые ссылки на аватары)
    playerAvatar.src = `https://api-assets.clashroyale.com/badges/200/${playerData.clan?.badgeId || 'default'}.png`;
    playerAvatar.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iNjAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmQ3MDA7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmY2YjM1O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjQ3NTc7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+';
    };
}

// Функция отображения колоды игрока
function displayPlayerDeck(playerData) {
    if (!playerData.currentDeck || playerData.currentDeck.length === 0) {
        deckSection.style.display = 'none';
        return;
    }
    
    deckGrid.innerHTML = '';
    
    playerData.currentDeck.forEach(card => {
        const cardElement = createCardElement(card);
        deckGrid.appendChild(cardElement);
    });
    
    deckSection.style.display = 'block';
}

// Функция создания элемента карты
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'deck-card';
    
    const cardId = card.id;
    const cardName = card.name;
    const cardLevel = card.level;
    const cardMaxLevel = card.maxLevel;
    
    cardDiv.innerHTML = `
        <img src="https://api-assets.clashroyale.com/cards/300/${cardId}.png" 
             alt="${cardName}" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZDcwMDtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjZiMzU7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmNDc1NztzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4='">
        <h4>${cardName}</h4>
        <p>Уровень ${cardLevel}/${cardMaxLevel}</p>
    `;
    
    return cardDiv;
}

// Функция отображения статистики игрока
function displayPlayerStats(playerData) {
    // Победы и общая статистика
    const wins = playerData.wins || 0;
    const losses = playerData.losses || 0;
    const draws = playerData.battleDraws || 0;
    const totalGames = wins + losses + draws;
    const winRatePercent = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
    
    // Обновление элементов
    totalWins.textContent = wins.toLocaleString();
    totalGames.textContent = totalGames.toLocaleString();
    winRate.textContent = `${winRatePercent}%`;
    
    // Максимальный уровень карты
    let maxCardLevel = 1;
    if (playerData.currentDeck) {
        maxCardLevel = Math.max(...playerData.currentDeck.map(card => card.level));
    }
    maxLevel.textContent = maxCardLevel;
    
    statsSection.style.display = 'block';
}

// Функция определения арены по количеству кубков
function getArenaByTrophies(trophies) {
    const arenas = [
        { name: 'Тренировочный лагерь', min: 0, max: 399 },
        { name: 'Арена 1: Goblin Stadium', min: 400, max: 799 },
        { name: 'Арена 2: Bone Pit', min: 800, max: 1199 },
        { name: 'Арена 3: Barbarian Bowl', min: 1200, max: 1599 },
        { name: 'Арена 4: P.E.K.K.A\'s Playhouse', min: 1600, max: 1999 },
        { name: 'Арена 5: Spell Valley', min: 2000, max: 2399 },
        { name: 'Арена 6: Builder\'s Workshop', min: 2400, max: 2799 },
        { name: 'Арена 7: Royal Arena', min: 2800, max: 3199 },
        { name: 'Арена 8: Frozen Peak', min: 3200, max: 3599 },
        { name: 'Арена 9: Jungle Arena', min: 3600, max: 3999 },
        { name: 'Арена 10: Hog Mountain', min: 4000, max: 4399 },
        { name: 'Арена 11: Electro Valley', min: 4400, max: 4799 },
        { name: 'Арена 12: Spooky Town', min: 4800, max: 5199 },
        { name: 'Арена 13: Rascal\'s Hideout', min: 5200, max: 5599 },
        { name: 'Арена 14: Serenity Peak', min: 5600, max: 5999 },
        { name: 'Арена 15: Executioner\'s Kitchen', min: 6000, max: 6399 },
        { name: 'Арена 16: Royal Crypt', min: 6400, max: 6799 },
        { name: 'Арена 17: Miner\'s Mine', min: 6800, max: 7199 },
        { name: 'Арена 18: Legendary Arena', min: 7200, max: 7599 },
        { name: 'Арена 19: Legendary Arena', min: 7600, max: 7999 },
        { name: 'Арена 20: Legendary Arena', min: 8000, max: 8399 },
        { name: 'Арена 21: Legendary Arena', min: 8400, max: 8799 },
        { name: 'Арена 22: Legendary Arena', min: 8800, max: 9199 },
        { name: 'Арена 23: Legendary Arena', min: 9200, max: 9599 },
        { name: 'Арена 24: Legendary Arena', min: 9600, max: 9999 },
        { name: 'Арена 25: Legendary Arena', min: 10000, max: 10399 },
        { name: 'Арена 26: Legendary Arena', min: 10400, max: 10799 },
        { name: 'Арена 27: Legendary Arena', min: 10800, max: 11199 },
        { name: 'Арена 28: Legendary Arena', min: 11200, max: 11599 },
        { name: 'Арена 29: Legendary Arena', min: 11600, max: 11999 },
        { name: 'Арена 30: Legendary Arena', min: 12000, max: 12399 },
        { name: 'Арена 31: Legendary Arena', min: 12400, max: 12799 },
        { name: 'Арена 32: Legendary Arena', min: 12800, max: 13199 },
        { name: 'Арена 33: Legendary Arena', min: 13200, max: 13599 },
        { name: 'Арена 34: Legendary Arena', min: 13600, max: 13999 },
        { name: 'Арена 35: Legendary Arena', min: 14000, max: 14399 },
        { name: 'Арена 36: Legendary Arena', min: 14400, max: 14799 },
        { name: 'Арена 37: Legendary Arena', min: 14800, max: 15199 },
        { name: 'Арена 38: Legendary Arena', min: 15200, max: 15599 },
        { name: 'Арена 39: Legendary Arena', min: 15600, max: 15999 },
        { name: 'Арена 40: Legendary Arena', min: 16000, max: 16399 },
        { name: 'Арена 41: Legendary Arena', min: 16400, max: 16799 },
        { name: 'Арена 42: Legendary Arena', min: 16800, max: 17199 },
        { name: 'Арена 43: Legendary Arena', min: 17200, max: 17599 },
        { name: 'Арена 44: Legendary Arena', min: 17600, max: 17999 },
        { name: 'Арена 45: Legendary Arena', min: 18000, max: 18399 },
        { name: 'Арена 46: Legendary Arena', min: 18400, max: 18799 },
        { name: 'Арена 47: Legendary Arena', min: 18800, max: 19199 },
        { name: 'Арена 48: Legendary Arena', min: 19200, max: 19599 },
        { name: 'Арена 49: Legendary Arena', min: 19600, max: 19999 },
        { name: 'Арена 50: Legendary Arena', min: 20000, max: Infinity }
    ];
    
    const arena = arenas.find(a => trophies >= a.min && trophies <= a.max);
    return arena ? arena.name : 'Неизвестная арена';
}

// Функции управления UI
function showLoading() {
    loadingSpinner.style.display = 'flex';
    resultsSection.style.display = 'block';
    playerProfile.style.display = 'none';
    deckSection.style.display = 'none';
    statsSection.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showResults() {
    resultsSection.style.display = 'block';
    playerProfile.style.display = 'block';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Обработка ошибок сети
window.addEventListener('online', function() {
    hideError();
});

window.addEventListener('offline', function() {
    showError('Нет подключения к интернету');
});
