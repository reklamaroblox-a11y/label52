// Конфигурация FACEIT API
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const FACEIT_API_KEY = '73782652-2cd5-405b-9c98-d28b2620bd0c'; // Замените на ваш API ключ

// CORS прокси для локальной разработки
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Данные игрока (по умолчанию)
let playerData = {
    nickname: 'NICKNAME',
    name: 'Игрок LABEL 52',
    description: 'Профессиональный игрок CS2',
    faceitNickname: ''
};

// Получение никнейма из URL параметров
function getNicknameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const nickname = urlParams.get('nickname');
    if (nickname) {
        playerData.faceitNickname = decodeURIComponent(nickname);
        playerData.nickname = decodeURIComponent(nickname);
        playerData.name = decodeURIComponent(nickname);
    }
}

// Список известных игроков для тестирования
const KNOWN_PLAYERS = [
    'ZywOo',
    'sh1ro', 
    'ropz',
    'broky',
    'Twistzz',
    'EliGE',
    'NAF',
    'Stewie2K',
    'tarik',
    'coldzera'
];

// Загрузка сохраненных данных
function loadPlayerData() {
    const saved = localStorage.getItem('playerData');
    if (saved) {
        playerData = { ...playerData, ...JSON.parse(saved) };
        updatePlayerInfo();
    }
}

// Сохранение данных
function savePlayerData() {
    localStorage.setItem('playerData', JSON.stringify(playerData));
}

// Обновление информации игрока
function updatePlayerInfo() {
    document.querySelector('.player-name').textContent = playerData.name;
    document.querySelector('.player-description').textContent = playerData.description;
    
    if (playerData.faceitNickname) {
        document.getElementById('faceit-link').href = `https://www.faceit.com/ru/players/${playerData.faceitNickname}`;
    }
}

// FACEIT API функции
async function getPlayerStats(nickname) {
    try {
        console.log('🔍 Запрос данных для игрока:', nickname);
        console.log('🔑 API ключ:', FACEIT_API_KEY);
        
        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('❌ API ключ не настроен, данные недоступны');
            showNotification('API ключ не настроен, данные недоступны!', 'warning');
            return await getEmptyPlayerStats(nickname);
        }
        
        // Сначала попробуем найти игрока через поиск
        const searchUrl = `${FACEIT_API_BASE}/search/players?nickname=${encodeURIComponent(nickname)}&game=cs2&offset=0&limit=1`;
        console.log('🔍 Поиск игрока:', searchUrl);
        
        const searchResponse = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📡 Статус поиска:', searchResponse.status);
        
        let playerData;
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('🔍 Результаты поиска:', searchData);
            
            if (searchData.items && searchData.items.length > 0) {
                // Используем найденного игрока
                playerData = searchData.items[0];
                console.log('✅ Игрок найден через поиск:', playerData);
            } else {
                throw new Error('Игрок не найден в поиске');
            }
        } else {
            // Если поиск не работает, пробуем прямой запрос
            const playerUrl = `${FACEIT_API_BASE}/players/${nickname}`;
            console.log('🌐 Прямой запрос к:', playerUrl);
            
            const response = await fetch(playerUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${FACEIT_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            console.log('📡 Статус ответа:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ошибка API:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            playerData = await response.json();
            console.log('✅ Данные игрока получены:', playerData);
        }
        
        // Получаем статистику CS2
        const statsUrl = `${FACEIT_API_BASE}/players/${playerData.player_id}/stats/cs2`;
        console.log('🌐 Запрос статистики:', statsUrl);
        
        const statsResponse = await fetch(statsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📡 Статус статистики:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Статистика получена:', statsData);
            
            // Проверяем структуру данных и безопасно извлекаем значения
            const cs2Data = playerData.games?.cs2 || {};
            const lifetimeStats = statsData.lifetime || {};
            
            // Объединяем данные игрока и статистику
            const combinedStats = {
                ...playerData,
                games: {
                    cs2: {
                        skill_level: cs2Data.skill_level || 0,
                        elo: cs2Data.faceit_elo || 0,
                        game_player_id: cs2Data.game_player_id || ''
                    }
                },
                games_count: lifetimeStats.Matches || 0,
                wins: lifetimeStats.Wins || 0,
                accuracy: lifetimeStats['Average Headshots %'] || 0,
                win_streak: lifetimeStats['Current Win Streak'] || 0
            };
            
            showNotification('Загружены реальные данные из FACEIT!', 'success');
            return combinedStats;
        } else {
            const errorText = await statsResponse.text();
            console.error('❌ Ошибка API статистики:', errorText);
            throw new Error(`HTTP error! status: ${statsResponse.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Ошибка получения данных игрока:', error);
        showNotification(`Ошибка при загрузке данных: ${error.message}. Данные недоступны.`, 'error');
        console.log('🔄 Возвращаем пустые данные');
        // Возвращаем пустые данные в случае ошибки
        return await getEmptyPlayerStats(nickname);
    }
}

// Функция для обработки отсутствующих данных
async function getEmptyPlayerStats(nickname) {
    console.log('📭 Нет данных для игрока:', nickname);
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const emptyData = {
        player_id: null,
        nickname: nickname,
        games: {
            cs2: {
                skill_level: 0,
                elo: 0,
                game_player_id: ''
            }
        },
        games_count: 0,
        wins: 0,
        accuracy: 0,
        win_streak: 0,
        isEmpty: true // Флаг для определения пустых данных
    };
    
    console.log('📭 Пустые данные созданы:', emptyData);
    return emptyData;
}

// Получение истории матчей
async function getPlayerMatches(playerId, offset = 0, limit = 20) {
    try {
        console.log('🎮 Запрос матчей для игрока:', playerId);
        
        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('❌ API ключ не настроен, данные недоступны');
            showNotification('API ключ не настроен, данные недоступны!', 'warning');
            return [];
        }
        
        // Получаем матчи через FACEIT API
        const matchesUrl = `${FACEIT_API_BASE}/players/${playerId}/history?game=cs2&offset=${offset}&limit=${limit}`;
        console.log('🌐 Запрос матчей:', matchesUrl);
        
        const response = await fetch(matchesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📡 Статус матчей:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка получения матчей:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const matchesData = await response.json();
        console.log('✅ Матчи получены:', matchesData);
        showNotification('Загружены реальные матчи из FACEIT!', 'success');
        return matchesData.items || [];
    } catch (error) {
        console.error('❌ Ошибка получения матчей:', error);
        showNotification(`Ошибка при загрузке матчей: ${error.message}. Данные недоступны.`, 'error');
        console.log('🔄 Возвращаем пустой список матчей');
        // Возвращаем пустой список в случае ошибки
        return [];
    }
}

// Обновление статистики
function updateStats(stats) {
    if (!stats) return;
    
    const eloValue = document.getElementById('elo-value');
    const levelValue = document.getElementById('level-value');
    const matchesValue = document.getElementById('matches-value');
    const winsValue = document.getElementById('wins-value');
    const winRate = document.getElementById('win-rate');
    const accuracy = document.getElementById('accuracy');
    const winStreak = document.getElementById('win-streak');
    
    // Получаем данные CS2 из games объекта
    const cs2Data = stats.games?.cs2;
    
    // Проверяем, есть ли данные
    if (stats.isEmpty) {
        // Показываем "пусто" для всех значений
        eloValue.textContent = 'пусто';
        levelValue.innerHTML = '<span class="level-badge level-0">-</span>';
        matchesValue.textContent = 'пусто';
        winsValue.textContent = 'пусто';
        winRate.textContent = 'пусто';
        accuracy.textContent = 'пусто';
        winStreak.textContent = 'пусто';
    } else {
        // Анимация обновления значений
        animateValueChange(eloValue, cs2Data?.elo || 0);
        
        // Обновляем бейдж уровня
        const skillLevel = cs2Data?.skill_level || 0;
        levelValue.innerHTML = `<span class="level-badge level-${skillLevel}">${skillLevel}</span>`;
        
        animateValueChange(matchesValue, stats.games_count || 0);
        animateValueChange(winsValue, stats.wins || 0);
        
        // Обновление процентов и соотношений
        const winPercentage = stats.games_count ? Math.round((stats.wins / stats.games_count) * 100) : 0;
        winRate.textContent = `${winPercentage}%`;
        accuracy.textContent = `${stats.accuracy || 0}%`;
        winStreak.textContent = stats.win_streak || 0;
    }
    
    // Обновляем ссылку на FACEIT профиль
    if (stats.nickname) {
        document.getElementById('faceit-link').href = `https://www.faceit.com/ru/players/${stats.nickname}`;
    }
    
    // Показываем уведомление в зависимости от типа данных
    if (stats.isEmpty) {
        showNotification('📭 Данные недоступны для этого игрока', 'warning');
    } else {
        showNotification('✅ Загружены реальные данные из FACEIT!', 'success');
    }
}

// Анимация изменения значений
function animateValueChange(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const difference = newValue - currentValue;
    const steps = 20;
    const stepValue = difference / steps;
    let currentStep = 0;
    
    element.classList.add('updating');
    
    const interval = setInterval(() => {
        currentStep++;
        const displayValue = Math.round(currentValue + (stepValue * currentStep));
        element.textContent = displayValue;
        
        if (currentStep >= steps) {
            element.textContent = newValue;
            element.classList.remove('updating');
            clearInterval(interval);
        }
    }, 25);
}

// Обновление списка матчей
function updateMatchesList(matches, currentPlayerId) {
    const matchesList = document.getElementById('matches-list');
    
    if (!matches || matches.length === 0) {
        matchesList.innerHTML = '<div class="no-matches">пусто</div>';
        return;
    }
    
    // Проверяем, есть ли данные
    if (matches.length === 0) {
        showNotification('📭 История матчей недоступна', 'warning');
    }
    
    matchesList.innerHTML = matches.map(match => {
        let isWin = false;
        let playerFaction = '';
        
        // Determine which faction the current player belongs to
        if (match.teams.faction1.players.some(p => p.player_id === currentPlayerId)) {
            playerFaction = 'faction1';
        } else if (match.teams.faction2.players.some(p => p.player_id === currentPlayerId)) {
            playerFaction = 'faction2';
        }
        
        if (playerFaction && match.results.winner === playerFaction) {
            isWin = true;
        }
        
        const matchDate = new Date(match.started_at * 1000).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const matchResultText = isWin ? 'Победа' : 'Поражение';
        const matchResultClass = isWin ? 'win' : 'loss';
        
        return `
            <div class="match-item">
                <div class="match-info">
                    <div class="match-result ${matchResultClass}">
                        ${isWin ? 'W' : 'L'}
                    </div>
                    <div class="match-details">
                        <span class="match-type">${match.game_mode}</span>
                        <span class="match-date">${matchDate}</span>
                        <span class="match-competition">${match.competition_name}</span>
                    </div>
                </div>
                <div class="match-score">
                    <span class="score-faction1">${match.results.score.faction1}</span> - <span class="score-faction2">${match.results.score.faction2}</span>
                </div>
                <div class="match-elo-change">
                    <!-- ELO change is not directly available in match history API -->
                    <span class="elo-placeholder">N/A</span>
                </div>
                <a href="${match.faceit_url.replace('{lang}', 'ru')}" target="_blank" class="match-link">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
    }).join('');
}

// Основная функция загрузки данных
async function loadPlayerStats() {
    if (!playerData.faceitNickname) {
        console.log('FACEIT никнейм не настроен');
        return;
    }
    
    // Показываем загрузку
    document.body.classList.add('loading');
    
    try {
        // Получаем статистику игрока
        const stats = await getPlayerStats(playerData.faceitNickname);
        if (stats) {
            updateStats(stats);
            
            // Получаем матчи только если есть player_id
            if (stats.player_id) {
                const matches = await getPlayerMatches(stats.player_id);
                updateMatchesList(matches, stats.player_id);
            } else {
                // Если нет player_id, показываем пустой список матчей
                updateMatchesList([], null);
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    } finally {
        document.body.classList.remove('loading');
    }
}

// Автообновление данных каждые 5 минут
function startAutoUpdate() {
    setInterval(() => {
        if (playerData.faceitNickname) {
            loadPlayerStats();
        }
    }, 5 * 60 * 1000); // 5 минут
}

// Модальное окно настроек
function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const modalClose = document.getElementById('modal-close');
    const saveBtn = document.getElementById('save-settings');
    
    // Открытие модального окна
    settingsBtn.addEventListener('click', () => {
        document.getElementById('faceit-nickname').value = playerData.faceitNickname;
        modal.classList.add('active');
    });
    
    // Закрытие модального окна
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Обработка кликов по подсказкам
    document.querySelectorAll('.hint-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const nickname = tag.getAttribute('data-nickname');
            document.getElementById('faceit-nickname').value = nickname;
            showNotification(`Выбран игрок: ${nickname}`);
        });
    });
    
    // Сохранение настроек
    saveBtn.addEventListener('click', () => {
        playerData.faceitNickname = document.getElementById('faceit-nickname').value;
        
        savePlayerData();
        updatePlayerInfo();
        
        if (playerData.faceitNickname) {
            loadPlayerStats();
        }
        
        modal.classList.remove('active');
        
        // Показываем уведомление
        showNotification('Настройки сохранены!');
    });
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Определяем цвет в зависимости от типа уведомления
    let backgroundColor;
    switch (type) {
        case 'success':
            backgroundColor = 'linear-gradient(135deg, #4CAF50, #45a049)';
            break;
        case 'error':
            backgroundColor = 'linear-gradient(135deg, #f44336, #d32f2f)';
            break;
        case 'warning':
            backgroundColor = 'linear-gradient(135deg, #ff9800, #f57c00)';
            break;
        default:
            backgroundColor = 'var(--gradient-primary)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Добавление CSS анимаций для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    getNicknameFromUrl(); // Получаем никнейм из URL
    loadPlayerData();
    initSettingsModal();
    
    // Загружаем данные если есть никнейм
    if (playerData.faceitNickname) {
        loadPlayerStats();
    }
    
    // Запускаем автообновление
    startAutoUpdate();
    
    // Показываем инструкцию для настройки
    if (!playerData.faceitNickname) {
        setTimeout(() => {
            showNotification('Нажмите на шестеренку для настройки профиля');
        }, 2000);
    }
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Ошибка на странице деталей игрока:', e.error);
});

// Экспорт функций для возможного использования
window.PlayerDetails = {
    loadPlayerStats,
    updateStats,
    updateMatchesList,
    showNotification
};
