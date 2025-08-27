// Конфигурация FACEIT API
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const FACEIT_API_KEY = '73782652-2cd5-405b-9c98-d28b2620bd0c'; // Замените на ваш API ключ

// Данные артиста (по умолчанию)
let artistData = {
    nickname: 'NICKNAME',
    name: 'Артист LABEL 52',
    description: 'Профессиональный игрок и музыкант',
    faceitNickname: ''
};

// Загрузка сохраненных данных
function loadArtistData() {
    const saved = localStorage.getItem('artistData');
    if (saved) {
        artistData = { ...artistData, ...JSON.parse(saved) };
        updateArtistInfo();
    }
}

// Сохранение данных
function saveArtistData() {
    localStorage.setItem('artistData', JSON.stringify(artistData));
}

// Обновление информации артиста
function updateArtistInfo() {
    document.querySelector('.artist-name').textContent = artistData.name;
    document.querySelector('.artist-description').textContent = artistData.description;
    
    if (artistData.faceitNickname) {
        document.getElementById('faceit-link').href = `https://www.faceit.com/ru/players/${artistData.faceitNickname}`;
    }
}

// FACEIT API функции
async function getPlayerStats(nickname) {
    try {
        console.log('🔍 Запрос данных для игрока:', nickname);
        console.log('🔑 API ключ:', FACEIT_API_KEY);
        
        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('❌ API ключ не настроен, используем моковые данные');
            return await getMockPlayerStats(nickname);
        }
        
        // Получаем данные игрока через FACEIT API
        const playerUrl = `${FACEIT_API_BASE}/players/${nickname}`;
        console.log('🌐 Запрос к:', playerUrl);
        
        const response = await fetch(playerUrl, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Статус ответа:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка API:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const playerData = await response.json();
        console.log('✅ Данные игрока получены:', playerData);
        
        // Получаем статистику CS2
        const statsUrl = `${FACEIT_API_BASE}/players/${playerData.player_id}/stats/cs2`;
        console.log('🌐 Запрос статистики:', statsUrl);
        
        const statsResponse = await fetch(statsUrl, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Статус статистики:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Статистика получена:', statsData);
            return {
                ...playerData,
                ...statsData
            };
        } else {
            console.log('⚠️ Статистика недоступна, используем только данные игрока');
        }
        
        return playerData;
    } catch (error) {
        console.error('❌ Ошибка получения данных игрока:', error);
        console.log('🔄 Возвращаем моковые данные');
        // Возвращаем моковые данные в случае ошибки
        return await getMockPlayerStats(nickname);
    }
}

// Моковые данные для демонстрации
async function getMockPlayerStats(nickname) {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseElo = 1500 + Math.floor(Math.random() * 1000);
    const baseLevel = 5 + Math.floor(Math.random() * 15);
    const baseMatches = 100 + Math.floor(Math.random() * 900);
    
    return {
        player_id: 'mock_player_id',
        nickname: nickname,
        games: {
            cs2: {
                skill_level: baseLevel,
                elo: baseElo,
                game_player_id: 'mock_steam_id'
            }
        },
        games_count: baseMatches,
        wins: Math.floor(baseMatches * (0.4 + Math.random() * 0.3)),
        kd_ratio: (0.8 + Math.random() * 0.8).toFixed(2),
        accuracy: Math.floor(40 + Math.random() * 30),
        win_streak: Math.floor(Math.random() * 10)
    };
}

// Получение истории матчей
async function getPlayerMatches(playerId, offset = 0, limit = 20) {
    try {
        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('API ключ не настроен, используем моковые данные');
            return await getMockMatches(playerId, offset, limit);
        }
        
        // Получаем матчи через FACEIT API
        const response = await fetch(`${FACEIT_API_BASE}/players/${playerId}/history?game=cs2&offset=${offset}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const matchesData = await response.json();
        return matchesData.items || [];
    } catch (error) {
        console.error('Ошибка получения матчей:', error);
        // Возвращаем моковые данные в случае ошибки
        return await getMockMatches(playerId, offset, limit);
    }
}

// Моковые данные матчей
async function getMockMatches(playerId, offset, limit) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const matches = [];
    const maps = ['de_dust2', 'de_mirage', 'de_inferno', 'de_overpass', 'de_nuke', 'de_ancient'];
    const results = ['win', 'loss'];
    
    for (let i = 0; i < limit; i++) {
        const isWin = Math.random() > 0.5;
        const eloChange = isWin ? Math.floor(Math.random() * 25) + 5 : -(Math.floor(Math.random() * 20) + 5);
        
        matches.push({
            match_id: `match_${Date.now()}_${i}`,
            game_id: 'cs2',
            region: 'EU',
            match_type: '5v5',
            game_mode: 'Standard',
            max_players: 10,
            teams_size: 5,
            teams: {
                faction1: {
                    team_id: 'team1',
                    nickname: 'Team A',
                    avatar: '',
                    type: 'Team',
                    players: []
                },
                faction2: {
                    team_id: 'team2',
                    nickname: 'Team B',
                    avatar: '',
                    type: 'Team',
                    players: []
                }
            },
            voting: {},
            organizer_id: 'organizer_id',
            status: 'finished',
            started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            finished_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            results: {
                winner: isWin ? 'faction1' : 'faction2',
                score: {
                    faction1: isWin ? 16 : Math.floor(Math.random() * 15),
                    faction2: isWin ? Math.floor(Math.random() * 15) : 16
                }
            },
            map: maps[Math.floor(Math.random() * maps.length)],
            elo_change: eloChange,
            elo_before: 1500 + Math.floor(Math.random() * 500),
            elo_after: 1500 + Math.floor(Math.random() * 500)
        });
    }
    
    return matches;
}

// Обновление статистики
function updateStats(stats) {
    if (!stats) return;
    
    const eloValue = document.getElementById('elo-value');
    const levelValue = document.getElementById('level-value');
    const matchesValue = document.getElementById('matches-value');
    const winsValue = document.getElementById('wins-value');
    const winRate = document.getElementById('win-rate');
    const kdRatio = document.getElementById('kd-ratio');
    const accuracy = document.getElementById('accuracy');
    const winStreak = document.getElementById('win-streak');
    
    // Получаем данные CS2 из games объекта
    const cs2Data = stats.games?.cs2;
    
    // Анимация обновления значений
    animateValueChange(eloValue, cs2Data?.elo || 0);
    animateValueChange(levelValue, cs2Data?.skill_level || 0);
    animateValueChange(matchesValue, stats.games_count || 0);
    animateValueChange(winsValue, stats.wins || 0);
    
    // Обновление процентов и соотношений
    const winPercentage = stats.games_count ? Math.round((stats.wins / stats.games_count) * 100) : 0;
    winRate.textContent = `${winPercentage}%`;
    kdRatio.textContent = stats.kd_ratio || '0.00';
    accuracy.textContent = `${stats.accuracy || 0}%`;
    winStreak.textContent = stats.win_streak || 0;
    
    // Обновляем ссылку на FACEIT профиль
    if (stats.nickname) {
        document.getElementById('faceit-link').href = `https://www.faceit.com/ru/players/${stats.nickname}`;
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
function updateMatchesList(matches) {
    const matchesList = document.getElementById('matches-list');
    
    if (!matches || matches.length === 0) {
        matchesList.innerHTML = '<div class="no-matches">Нет данных о матчах</div>';
        return;
    }
    
    matchesList.innerHTML = matches.map(match => {
        // Определяем, в какой команде играл наш игрок
        const playerTeam = match.teams.faction1?.roster?.some(player => 
            player.nickname === artistData.faceitNickname
        ) ? 'faction1' : 'faction2';
        
        const isWin = match.results.winner === playerTeam;
        const eloChange = match.elo_change || 0;
        const eloChangeClass = eloChange > 0 ? 'change-positive' : eloChange < 0 ? 'change-negative' : '';
        const eloChangeText = eloChange > 0 ? `+${eloChange}` : eloChange.toString();
        
        // Получаем счет из результатов
        const score = match.results.score;
        const scoreText = score ? `${score.faction1 || 0} - ${score.faction2 || 0}` : 'N/A';
        
        return `
            <div class="match-item">
                <div class="match-info">
                    <div class="match-result ${isWin ? 'win' : 'loss'}">
                        ${isWin ? 'W' : 'L'}
                    </div>
                    <div class="match-details">
                        <h4>${match.game || 'CS2'}</h4>
                        <p>${new Date(match.finished_at * 1000).toLocaleDateString('ru-RU')}</p>
                    </div>
                </div>
                <div class="match-stats">
                    <div class="match-elo ${eloChangeClass}">${eloChangeText}</div>
                    <div class="match-score">${scoreText}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Основная функция загрузки данных
async function loadPlayerData() {
    if (!artistData.faceitNickname) {
        console.log('FACEIT никнейм не настроен');
        return;
    }
    
    // Показываем загрузку
    document.body.classList.add('loading');
    
    try {
        // Получаем статистику игрока
        const stats = await getPlayerStats(artistData.faceitNickname);
        if (stats) {
            updateStats(stats);
            
            // Получаем матчи
            const matches = await getPlayerMatches(stats.player_id);
            updateMatchesList(matches);
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
        if (artistData.faceitNickname) {
            loadPlayerData();
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
        document.getElementById('faceit-nickname').value = artistData.faceitNickname;
        document.getElementById('artist-name').value = artistData.name;
        document.getElementById('artist-description').value = artistData.description;
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
    
    // Сохранение настроек
    saveBtn.addEventListener('click', () => {
        artistData.faceitNickname = document.getElementById('faceit-nickname').value;
        artistData.name = document.getElementById('artist-name').value;
        artistData.description = document.getElementById('artist-description').value;
        
        saveArtistData();
        updateArtistInfo();
        
        if (artistData.faceitNickname) {
            loadPlayerData();
        }
        
        modal.classList.remove('active');
        
        // Показываем уведомление
        showNotification('Настройки сохранены!');
    });
}

// Показ уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
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
    loadArtistData();
    initSettingsModal();
    
    // Загружаем данные если есть никнейм
    if (artistData.faceitNickname) {
        loadPlayerData();
    }
    
    // Запускаем автообновление
    startAutoUpdate();
    
    // Показываем инструкцию для настройки
    if (!artistData.faceitNickname) {
        setTimeout(() => {
            showNotification('Нажмите на шестеренку для настройки профиля');
        }, 2000);
    }
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Ошибка на странице артиста:', e.error);
});

// Экспорт функций для возможного использования
window.ArtistPage = {
    loadPlayerData,
    updateStats,
    updateMatchesList,
    showNotification
};
