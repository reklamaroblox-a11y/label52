// Конфигурация FACEIT API
const FACEIT_API_BASE = 'https://open.faceit.com/data/v4';
const FACEIT_API_KEY = '73782652-2cd5-405b-9c98-d28b2620bd0c';

// Данные игроков
let playersList = [];
let filteredPlayers = [];
let currentFilter = 'all';

// faceit-ranking-script.js

// 1) Инициализация клиента
const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

// 2) Получаем общий рейтинг из БД
async function fetchGlobalRating() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'faceit_rating')
    .single();

  if (error) {
    console.error('Failed to load rating:', error);
    // запасное значение, если БД недоступна
    return 1500;
  }
  const val = parseInt(data?.value, 10);
  return Number.isFinite(val) ? val : 1500;
}

// 3) Применяем рейтинг ко всем игрокам на странице
async function applyGlobalRating() {
  const rating = await fetchGlobalRating();

  // Найди элементы, где должен отображаться рейтинг.
  // Пример: у каждого игрока есть span с классом .player-rating
  const ratingEls = document.querySelectorAll('.player-rating');
  ratingEls.forEach(el => {
    el.textContent = rating;
    el.setAttribute('aria-label', `FACEIT рейтинг: ${rating}`);
  });
}

// 4) Запуск
document.addEventListener('DOMContentLoaded', applyGlobalRating);


// Переменные для сортировки
let currentSortField = 'elo';
let currentSortDirection = 'desc'; // desc - по убыванию, asc - по возрастанию

// Загрузка сохраненных игроков
function loadPlayersList() {
    console.log('📂 Загружаем список игроков из localStorage');
    const saved = localStorage.getItem('faceitPlayers');
    if (saved) {
        playersList = JSON.parse(saved);
        console.log('✅ Загружено игроков из localStorage:', playersList.length);
        console.log('📋 Список загруженных игроков:', playersList);
    } else {
        console.log('⚠️ В localStorage нет сохраненных игроков');
    }
    
    // Обновляем отображение статистики
    updateStatsDisplay();
    
    console.log('✅ Загрузка списка игроков завершена');
}

// Сохранение списка игроков
function savePlayersList() {
    console.log('💾 Сохраняем список игроков в localStorage:', playersList);
    localStorage.setItem('faceitPlayers', JSON.stringify(playersList));
    console.log('✅ Список игроков сохранен');
    console.log('💾 Данные записаны в localStorage');
}

// Добавление нового игрока
async function addPlayer(nickname, group = '') {
    if (!nickname.trim()) {
        showNotification('Введите никнейм игрока', 'error');
        return;
    }

    // Проверяем, не добавлен ли уже этот игрок
    if (playersList.some(player => player.nickname.toLowerCase() === nickname.toLowerCase())) {
        showNotification('Этот игрок уже добавлен', 'warning');
        return;
    }

    // Добавляем игрока в список
    const newPlayer = {
        nickname: nickname.trim(),
        group: group,
        addedAt: new Date().toISOString(),
        lastUpdated: null,
        stats: null
    };

    console.log('➕ Добавляем нового игрока:', newPlayer);
    playersList.push(newPlayer);
    savePlayersList();
    
    const groupText = group ? ` (группа: ${getGroupDisplayName(group)})` : '';
    showNotification(`Игрок ${nickname} добавлен${groupText}`, 'success');
    
    console.log('📋 Список игроков после добавления:', playersList);
    
    // Обновляем отображение
    updatePlayersListDisplay();
    loadRankingData();
    
    console.log('🔄 Отображение и данные обновлены для addPlayer');
}

// Функция для получения отображаемого названия группы
function getGroupDisplayName(group) {
    const displayName = (() => {
        switch (group) {
            case 'music': return 'Музыка';
            case 'black': return 'Черные';
            default: return 'Без группы';
        }
    })();
    
    console.log(`🏷️ Название группы "${group}" -> "${displayName}"`);
    return displayName;
}

// Удаление игрока
function removePlayer(nickname) {
    console.log(`🗑️ Удаляем игрока: ${nickname}`);
    
    playersList = playersList.filter(player => player.nickname !== nickname);
    console.log(`📋 Список игроков после удаления:`, playersList);
    
    savePlayersList();
    
    showNotification(`Игрок ${nickname} удален`, 'success');
    
    // Обновляем отображение
    updatePlayersListDisplay();
    loadRankingData();
    
    console.log('🔄 Отображение и данные обновлены для removePlayer');
}

// Обновление отображения списка игроков в настройках
function updatePlayersListDisplay() {
    console.log('🔄 Обновляем отображение списка игроков в настройках');
    console.log('📋 Текущий список игроков:', playersList);
    
    const container = document.getElementById('players-list-container');
    
    if (playersList.length === 0) {
        console.log('📭 Список игроков пуст, показываем сообщение');
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Нет добавленных игроков</p>';
        return;
    }

    console.log(`📝 Отображаем ${playersList.length} игроков в настройках`);
    
    container.innerHTML = playersList.map(player => `
        <div class="player-item">
            <div class="player-item-info">
                <div class="player-item-avatar">
                    ${player.nickname.charAt(0).toUpperCase()}
                </div>
                <div class="player-item-details">
                    <span class="player-item-name">${player.nickname}</span>
                    ${player.group ? `<span class="player-item-group group-${player.group}">${getGroupDisplayName(player.group)}</span>` : ''}
                </div>
            </div>
            <div class="player-item-actions">
                <button class="edit-group-btn" onclick="editPlayerGroup('${player.nickname}')" title="Изменить группу">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="remove-player-btn" onclick="removePlayer('${player.nickname}')" title="Удалить игрока">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Список игроков в настройках обновлен');
    console.log('📋 HTML обновлен для', playersList.length, 'игроков');
}

// Функция для редактирования группы игрока
function editPlayerGroup(nickname) {
    console.log(`✏️ Редактируем группу для игрока: ${nickname}`);
    
    const player = playersList.find(p => p.nickname === nickname);
    if (!player) {
        console.log('❌ Игрок не найден:', nickname);
        return;
    }
    
    console.log('👤 Найден игрок для редактирования:', player);
    
    // Создаем модальное окно для выбора группы
    const groupModal = document.createElement('div');
    groupModal.className = 'modal active';
    groupModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Изменить группу для ${nickname}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="group-selector">
                    <label for="edit-player-group">Выберите группу:</label>
                    <select id="edit-player-group" class="group-select">
                        <option value="" ${!player.group ? 'selected' : ''}>Без группы</option>
                        <option value="music" ${player.group === 'music' ? 'selected' : ''}>🎵 Музыка</option>
                        <option value="black" ${player.group === 'black' ? 'selected' : ''}>⚫ Черные</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Отмена</button>
                <button class="btn btn-primary" onclick="savePlayerGroup('${nickname}', this.closest('.modal'))">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(groupModal);
    
    console.log('✅ Модальное окно редактирования группы создано');
    console.log('📋 Модальное окно добавлено в DOM');
}

// Функция для сохранения группы игрока
function savePlayerGroup(nickname, modal) {
    console.log(`💾 Сохраняем группу для игрока: ${nickname}`);
    
    const player = playersList.find(p => p.nickname === nickname);
    if (!player) {
        console.log('❌ Игрок не найден:', nickname);
        return;
    }
    
    const groupSelect = document.getElementById('edit-player-group');
    const selectedGroup = groupSelect.value;
    
    console.log(`🏷️ Выбранная группа: "${selectedGroup}"`);
    console.log(`👤 Игрок до изменения:`, player);
    
    // Обновляем группу игрока
    player.group = selectedGroup;
    console.log(`👤 Игрок после изменения:`, player);
    
    savePlayersList();
    
    const groupText = selectedGroup ? ` (группа: ${getGroupDisplayName(selectedGroup)})` : ' (без группы)';
    showNotification(`Группа игрока ${nickname} изменена${groupText}`, 'success');
    
    // Закрываем модальное окно
    modal.remove();
    
    // Обновляем отображение
    updatePlayersListDisplay();
    loadRankingData();
    
    console.log('✅ Группа игрока успешно сохранена');
    console.log('🔄 Отображение и данные обновлены');
}

// FACEIT API функции
async function getPlayerStats(nickname) {
    try {
        console.log('🔍 Запрос данных для игрока:', nickname);
        console.log('🔑 API ключ настроен:', !!FACEIT_API_KEY && FACEIT_API_KEY !== 'YOUR_API_KEY_HERE');
        
        if (!FACEIT_API_KEY || FACEIT_API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('❌ API ключ не настроен, данные недоступны');
            return null;
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
        
        // Также получаем полную информацию об игроке
        const playerDetailsUrl = `${FACEIT_API_BASE}/players/${playerData.player_id}`;
        console.log('👤 Запрос деталей игрока:', playerDetailsUrl);
        
        // Получаем историю матчей для определения даты последнего матча
        const matchesUrl = `${FACEIT_API_BASE}/players/${playerData.player_id}/history?game=cs2&offset=0&limit=1`;
        console.log('🎮 Запрос истории матчей:', matchesUrl);
        
        const playerDetailsResponse = await fetch(playerDetailsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        if (playerDetailsResponse.ok) {
            const playerDetails = await playerDetailsResponse.json();
            console.log('✅ Детали игрока получены:', playerDetails);
            // Обновляем playerData с полной информацией
            playerData = { ...playerData, ...playerDetails };
        }
        
        // Получаем историю матчей
        console.log('🎮 Начинаем запрос истории матчей...');
        const matchesResponse = await fetch(matchesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        });
        
        let lastMatchDate = null;
        if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json();
            console.log('🎮 История матчей получена:', matchesData);
            
            if (matchesData.items && matchesData.items.length > 0) {
                const lastMatch = matchesData.items[0];
                // Согласно Swagger, используем finished_at или started_at
                let rawTimestamp = lastMatch.finished_at || lastMatch.started_at || lastMatch.created_at;
                console.log('📅 Дата последнего матча (raw):', rawTimestamp);
                console.log('📊 Детали последнего матча:', lastMatch);
                
                // Дополнительная отладка для понимания структуры данных
                console.log('🔍 Доступные поля в матче:', Object.keys(lastMatch));
                console.log('⏰ finished_at:', lastMatch.finished_at);
                console.log('🚀 started_at:', lastMatch.started_at);
                console.log('📝 created_at:', lastMatch.created_at);
                
                // FACEIT API возвращает timestamp в секундах, конвертируем в миллисекунды
                if (rawTimestamp) {
                    // Проверяем, это секунды или миллисекунды
                    if (rawTimestamp < 10000000000) { // Если меньше 10^10, то это секунды
                        lastMatchDate = rawTimestamp * 1000;
                        console.log('✅ Конвертировали секунды в миллисекунды:', rawTimestamp, '->', lastMatchDate);
                    } else {
                        lastMatchDate = rawTimestamp;
                        console.log('✅ Используем как есть (уже в миллисекундах):', rawTimestamp);
                    }
                } else {
                    // Если дата не найдена, попробуем другие поля
                    console.log('⚠️ Стандартные поля даты не найдены, ищем альтернативы...');
                    // Проверяем все возможные поля с датами
                    const dateFields = ['date', 'timestamp', 'time', 'match_date', 'game_date'];
                    for (const field of dateFields) {
                        if (lastMatch[field]) {
                            rawTimestamp = lastMatch[field];
                            console.log(`✅ Найдена дата в поле ${field}:`, rawTimestamp);
                            break;
                        }
                    }
                    
                    // Если все еще не найдена дата, используем время последнего обновления
                    if (!rawTimestamp) {
                        console.log('⚠️ Дата матча не найдена, используем время обновления данных');
                        lastMatchDate = new Date().toISOString();
                    } else {
                        // Конвертируем найденную дату
                        if (rawTimestamp < 10000000000) {
                            lastMatchDate = rawTimestamp * 1000;
                        } else {
                            lastMatchDate = rawTimestamp;
                        }
                    }
                }
            } else {
                console.log('⚠️ История матчей пуста или нет элементов');
            }
        } else {
            const errorText = await matchesResponse.text();
            console.log('⚠️ Не удалось получить историю матчей, статус:', matchesResponse.status);
            console.log('❌ Ошибка:', errorText);
        }
        
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
            
            // Ищем сегмент CS2 в массиве segments
            const cs2Segment = statsData.segments?.find(segment => segment.game_id === 'cs2');
            
            console.log('🎮 CS2 данные игрока (из playerData.games?.cs2):', cs2Data);
            console.log('📈 Пожизненная статистика:', lifetimeStats);
            console.log('📊 Найденный CS2 сегмент:', cs2Segment);
            console.log('👤 Полные данные игрока:', playerData);
            
            // Извлекаем данные согласно официальной документации FACEIT API
            // skill_level находится в playerData напрямую
            const skillLevel = playerData.skill_level || 0;
            
            // ELO может быть в разных местах, пробуем найти
            let elo = 0;
            if (cs2Segment?.stats?.elo) {
                elo = cs2Segment.stats.elo;
            } else if (cs2Segment?.stats?.faceit_elo) {
                elo = cs2Segment.stats.faceit_elo;
            } else if (playerData.games?.cs2?.elo) {
                elo = playerData.games.cs2.elo;
            } else if (playerData.games?.cs2?.faceit_elo) {
                elo = playerData.games.cs2.faceit_elo;
            }

            // Функция для расчета уровня на основе ELO
            function calculateSkillLevel(elo) {
                console.log(`🧮 Расчет уровня для ELO: ${elo}`);
                
                let level;
                if (elo >= 2001) level = 10;
                else if (elo >= 1751) level = 9;
                else if (elo >= 1531) level = 8;
                else if (elo >= 1351) level = 7;
                else if (elo >= 1201) level = 6;
                else if (elo >= 1051) level = 5;
                else if (elo >= 901) level = 4;
                else if (elo >= 751) level = 3;
                else if (elo >= 501) level = 2;
                else if (elo >= 100) level = 1;
                else level = 0; // Если ELO меньше 100
                
                console.log(`✅ Рассчитанный уровень: ${level} для ELO: ${elo}`);
                return level;
            }

            // Используем рассчитанный уровень, если API не предоставил его
            const finalSkillLevel = skillLevel > 0 ? skillLevel : calculateSkillLevel(elo);

            console.log('🎯 Найденный ELO:', elo);
            console.log('📈 Найденный уровень из API:', skillLevel);
            console.log('📊 Рассчитанный уровень по ELO:', calculateSkillLevel(elo));
            console.log('🏆 Финальный уровень:', finalSkillLevel);
            
            // Объединяем данные игрока и статистику
            const combinedStats = {
                ...playerData,
                games: {
                    cs2: {
                        skill_level: finalSkillLevel,
                        elo: elo,
                        game_player_id: cs2Segment?.game_player_id || '',
                        last_match_date: lastMatchDate
                    }
                },
                games_count: lifetimeStats.Matches || 0,
                wins: lifetimeStats.Wins || 0,
                accuracy: lifetimeStats['Average Headshots %'] || 0,
                win_streak: lifetimeStats['Current Win Streak'] || 0,
                last_match_date: lastMatchDate
            };
            
            console.log('📊 Объединенные данные:', combinedStats);
            console.log('🎯 ELO:', combinedStats.games.cs2.elo);
            console.log('📈 Уровень:', combinedStats.games.cs2.skill_level);
            console.log('📅 last_match_date в combinedStats:', combinedStats.last_match_date);
            console.log('📅 last_match_date в games.cs2:', combinedStats.games.cs2.last_match_date);
            
            return combinedStats;
        } else {
            const errorText = await statsResponse.text();
            console.error('❌ Ошибка API статистики:', errorText);
            throw new Error(`HTTP error! status: ${statsResponse.status}, message: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Ошибка получения данных игрока:', error);
        console.error('📋 Детали ошибки:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Загрузка данных рейтинга
async function loadRankingData() {
    console.log('🔄 Начинаем загрузку данных рейтинга');
    console.log('📋 Список игроков:', playersList);
    
    if (playersList.length === 0) {
        console.log('❌ Нет игроков для загрузки');
        showEmptyState();
        return;
    }

    showLoadingState();
    
    try {
        // Загружаем данные для всех игроков
        const playersWithStats = [];
        
        for (const player of playersList) {
            console.log(`🔍 Загружаем данные для игрока: ${player.nickname}`);
            const stats = await getPlayerStats(player.nickname);
            if (stats) {
                console.log(`✅ Данные получены для ${player.nickname}:`, stats);
                console.log(`📅 last_match_date для ${player.nickname}:`, stats.games?.cs2?.last_match_date);
                playersWithStats.push({
                    ...player,
                    stats: stats,
                    lastUpdated: new Date().toISOString()
                });
            } else {
                console.log(`❌ Не удалось получить данные для ${player.nickname}`);
                playersWithStats.push({
                    ...player,
                    stats: null,
                    lastUpdated: new Date().toISOString()
                });
            }
        }
        
        console.log('📊 Игроки с данными:', playersWithStats);
        
        // Обновляем список игроков с новыми данными
        playersList = playersWithStats;
        savePlayersList();
        
        // Применяем сортировку
        filteredPlayers = sortPlayers(playersWithStats);
        
        console.log('🏆 Отфильтрованные игроки:', filteredPlayers);
        
        // Применяем текущий фильтр
        applyFilter(currentFilter);
        
        // Обновляем отображение
        updateRankingTable();
        updateStatsDisplay();
        
        // Инициализируем иконки сортировки
        updateSortIcons();
        
        hideLoadingState();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных рейтинга:', error);
        console.error('📋 Детали ошибки:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showNotification('Ошибка при загрузке данных', 'error');
        hideLoadingState();
    }
}

// Применение фильтров
function applyFilter(filter) {
    currentFilter = filter;
    console.log('🔍 Применяем фильтр:', filter);
    
    // Показываем уведомление о фильтре
    const filterText = getFilterDisplayName(filter);
    showNotification(`Фильтр: ${filterText}`, 'success');
    
    switch (filter) {
        case 'all':
            filteredPlayers = playersList; // Показываем всех игроков
            break;
        case 'music':
            filteredPlayers = playersList.filter(player => player.group === 'music');
            break;
        case 'black':
            filteredPlayers = playersList.filter(player => player.group === 'black');
            break;
    }
    
    console.log('👥 Игроки после фильтрации:', filteredPlayers);
    
    // Применяем сортировку к отфильтрованным игрокам
    filteredPlayers = sortPlayers(filteredPlayers);
    
    console.log('🔄 Игроки после сортировки:', filteredPlayers);
    
    updateRankingTable();
    
    console.log('✅ Фильтр применен, таблица обновлена');
}

// Обновление таблицы рейтинга
function updateRankingTable() {
    const tbody = document.getElementById('ranking-tbody');
    
    console.log('📋 Обновляем таблицу рейтинга');
    console.log('👥 Отфильтрованные игроки:', filteredPlayers);
    
    if (filteredPlayers.length === 0) {
        console.log('❌ Нет игроков для отображения');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Нет данных для отображения
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredPlayers.map((player, index) => {
        const stats = player.stats;
        const place = index + 1;
        const placeClass = place <= 3 ? `top-${place}` : '';
        
        console.log(`👤 Обрабатываем игрока ${player.nickname}:`, stats);
        
        // Если у игрока нет статистики, показываем "пусто"
        if (!stats) {
            console.log(`⚠️ У игрока ${player.nickname} нет статистики`);
            return `
                <tr>
                    <td class="ranking-place ${placeClass}">${place}</td>
                    <td>
                        <div class="player-info">
                            <div class="player-details">
                                <h4>${player.nickname}</h4>
                            </div>
                        </div>
                    </td>
                    <td class="stats-cell">
                        <span class="elo-value">пусто</span>
                    </td>
                    <td class="stats-cell">
                        <span class="level-badge level-0">-</span>
                    </td>
                    <td class="stats-cell">пусто</td>
                    <td class="stats-cell">пусто</td>
                    <td class="stats-cell">пусто</td>
                    <td class="stats-cell">пусто</td>
                    <td class="actions-cell">
                        <a href="player-details.html?nickname=${encodeURIComponent(player.nickname)}" class="action-btn">
                            <i class="fas fa-chart-line"></i>
                            Подробнее
                        </a>
                    </td>
                </tr>
            `;
        }
        
        console.log(`📊 Данные для отображения ${player.nickname}:`);
        console.log('  - ELO:', stats.games?.cs2?.elo);
        console.log('  - Уровень:', stats.games?.cs2?.skill_level);
        console.log('  - Матчи:', stats.games_count);
        console.log('  - Победы:', stats.wins);
        console.log('  - Дата последнего матча (raw):', stats.games?.cs2?.last_match_date);
        console.log('  - Тип даты:', typeof stats.games?.cs2?.last_match_date);
        
        return `
            <tr>
                <td class="ranking-place ${placeClass}">${place}</td>
                <td>
                    <div class="player-info">
                        <div class="player-details">
                            <h4>${player.nickname}</h4>
                        </div>
                    </div>
                </td>
                <td class="stats-cell">
                    <span class="elo-value">${stats.games.cs2.elo || 0}</span>
                </td>
                <td class="stats-cell">
                    <span class="level-badge level-${stats.games.cs2.skill_level || 0}">${stats.games.cs2.skill_level || 0}</span>
                </td>
                <td class="stats-cell">${stats.games_count || 0}</td>
                                    <td class="stats-cell">${stats.wins || 0}</td>
                    <td class="stats-cell last-match-cell">${formatLastMatchDate(stats.games.cs2.last_match_date)}</td>
                <td class="actions-cell">
                    <a href="player-details.html?nickname=${encodeURIComponent(player.nickname)}" class="action-btn">
                        <i class="fas fa-chart-line"></i>
                        Подробнее
                    </a>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Таблица рейтинга обновлена');
}

// Обновление статистики
function updateStatsDisplay() {
    const totalPlayers = document.getElementById('total-players');
    
    totalPlayers.textContent = playersList.length;
    
    console.log('📊 Обновление статистики:');
    console.log('  - Всего игроков:', playersList.length);
    console.log('  - Отфильтрованных игроков:', filteredPlayers.length);
    console.log('  - Текущий фильтр:', currentFilter);
    console.log('  - Текущая сортировка:', currentSortField, currentSortDirection);
    
    console.log('✅ Статистика обновлена');
}

// Поиск игроков
function searchPlayers(query) {
    console.log('🔍 Поиск игроков по запросу:', query);
    
    if (!query.trim()) {
        console.log('🔍 Пустой запрос, применяем текущий фильтр');
        applyFilter(currentFilter);
        return;
    }
    
    const searchQuery = query.toLowerCase();
    const searchResults = playersList.filter(player => 
        player.nickname.toLowerCase().includes(searchQuery)
    );
    
    console.log('🔍 Результаты поиска:', searchResults);
    
    // Применяем текущий фильтр к результатам поиска
    switch (currentFilter) {
        case 'music':
            filteredPlayers = searchResults.filter(player => player.group === 'music');
            break;
        case 'black':
            filteredPlayers = searchResults.filter(player => player.group === 'black');
            break;
        default:
            filteredPlayers = searchResults;
    }
    
    console.log('🔍 Результаты после фильтрации:', filteredPlayers);
    
    // Применяем текущую сортировку
    filteredPlayers = sortPlayers(filteredPlayers);
    
    updateRankingTable();
    
    // Показываем уведомление о результатах поиска
    if (searchResults.length > 0) {
        showNotification(`Найдено игроков: ${filteredPlayers.length}`, 'success');
        console.log('✅ Поиск завершен успешно, найдено игроков:', filteredPlayers.length);
    } else {
        showNotification('Игроки не найдены', 'warning');
        console.log('⚠️ Поиск завершен, игроки не найдены');
    }
}

// Состояния загрузки
function showLoadingState() {
    console.log('⏳ Показываем состояние загрузки');
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('empty-state').style.display = 'none';
    document.querySelector('.ranking-table-container').style.display = 'none';
    console.log('✅ Состояние загрузки показано');
}

function hideLoadingState() {
    console.log('✅ Скрываем состояние загрузки');
    document.getElementById('loading-spinner').style.display = 'none';
    document.querySelector('.ranking-table-container').style.display = 'block';
    console.log('✅ Состояние загрузки скрыто, таблица показана');
}

function showEmptyState() {
    console.log('📭 Показываем пустое состояние');
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    document.querySelector('.ranking-table-container').style.display = 'none';
    console.log('✅ Пустое состояние показано');
}

// Модальное окно настроек
function initSettingsModal() {
    console.log('⚙️ Инициализация модального окна настроек');
    
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const modalClose = document.getElementById('modal-close');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const addPlayerInput = document.getElementById('add-player-nickname');
    
    console.log('🔍 Найденные элементы:', {
        modal: !!modal,
        settingsBtn: !!settingsBtn,
        modalClose: !!modalClose,
        addPlayerBtn: !!addPlayerBtn,
        addPlayerInput: !!addPlayerInput
    });
    
    // Открытие модального окна
    settingsBtn.addEventListener('click', () => {
        console.log('🔘 Нажата кнопка настроек');
        updatePlayersListDisplay();
        modal.classList.add('active');
        console.log('✅ Модальное окно настроек открыто');
    });
    
    // Закрытие модального окна
    modalClose.addEventListener('click', () => {
        console.log('🔘 Нажата кнопка закрытия');
        modal.classList.remove('active');
        console.log('✅ Модальное окно настроек закрыто');
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('🔘 Клик вне модального окна');
            modal.classList.remove('active');
            console.log('✅ Модальное окно настроек закрыто по клику вне');
        }
    });
    
    // Добавление игрока
    addPlayerBtn.addEventListener('click', async () => {
        console.log('🔘 Нажата кнопка добавления игрока');
        const nickname = addPlayerInput.value.trim();
        const groupSelect = document.getElementById('add-player-group');
        const group = groupSelect.value;
        
        console.log('📝 Данные для добавления:', { nickname, group });
        
        if (nickname) {
            await addPlayer(nickname, group);
            addPlayerInput.value = '';
            groupSelect.value = '';
            console.log('✅ Игрок добавлен, поля очищены');
        } else {
            console.log('⚠️ Никнейм пустой, игрок не добавлен');
        }
    });
    
    // Добавление игрока по Enter
    addPlayerInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            console.log('⌨️ Нажата клавиша Enter для добавления игрока');
            const nickname = addPlayerInput.value.trim();
            const groupSelect = document.getElementById('add-player-group');
            const group = groupSelect.value;
            
            console.log('📝 Данные для добавления (Enter):', { nickname, group });
            
            if (nickname) {
                await addPlayer(nickname, group);
                addPlayerInput.value = '';
                groupSelect.value = '';
                console.log('✅ Игрок добавлен по Enter, поля очищены');
            } else {
                console.log('⚠️ Никнейм пустой, игрок не добавлен по Enter');
            }
        }
    });
    
    // Обработка кликов по подсказкам
    document.querySelectorAll('.hint-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const nickname = tag.getAttribute('data-nickname');
            console.log('🏷️ Клик по подсказке:', nickname);
            addPlayerInput.value = nickname;
            addPlayerInput.focus();
            console.log('✅ Подсказка применена и фокус установлен');
        });
    });
    
    console.log('✅ Модальное окно настроек инициализировано');
    console.log('🔧 Все обработчики событий настроены');
}

// Глобальная функция для открытия настроек
function openSettings() {
    console.log('🔘 Вызов функции openSettings');
    document.getElementById('settings-modal').classList.add('active');
    updatePlayersListDisplay();
    console.log('✅ Настройки открыты через openSettings');
    console.log('🔧 Функция openSettings выполнена успешно');
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    console.log(`🔔 Показываем уведомление: ${message} (тип: ${type})`);
    
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
        console.log('⏰ Скрываем уведомление через 3 секунды');
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
            console.log('✅ Уведомление удалено из DOM');
        }, 300);
    }, 3000);
    
    console.log('✅ Уведомление показано и будет скрыто через 3 секунды');
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

// Функция сортировки игроков
function sortPlayers(players) {
    console.log('🔄 Сортировка игроков по полю:', currentSortField, 'направление:', currentSortDirection);
    
    return players.sort((a, b) => {
        // Игроки без статистики всегда идут в конец
        if (!a.stats && !b.stats) return 0;
        if (!a.stats) return 1;
        if (!b.stats) return -1;
        
        let aValue, bValue;
        
        switch (currentSortField) {
            case 'elo':
                aValue = a.stats.games?.cs2?.elo || 0;
                bValue = b.stats.games?.cs2?.elo || 0;
                break;
            case 'matches':
                aValue = a.stats.games_count || 0;
                bValue = b.stats.games_count || 0;
                break;
            case 'wins':
                aValue = a.stats.wins || 0;
                bValue = b.stats.wins || 0;
                break;
            case 'lastMatch':
                // Используем дату последнего матча для сортировки
                aValue = a.stats.games?.cs2?.last_match_date || a.lastUpdated || 0;
                bValue = b.stats.games?.cs2?.last_match_date || b.lastUpdated || 0;
                console.log(`📅 Сортировка по дате: ${a.nickname}(${aValue}) vs ${b.nickname}(${bValue})`);
                break;
            default:
                aValue = a.stats.games?.cs2?.elo || 0;
                bValue = b.stats.games?.cs2?.elo || 0;
        }
        
        if (currentSortDirection === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });
}

// Функция для изменения сортировки
function changeSort(field) {
    console.log('🔄 Изменение сортировки:', field);
    
    // Если кликаем на то же поле, меняем направление
    if (currentSortField === field) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        console.log('🔄 Изменяем направление сортировки на:', currentSortDirection);
    } else {
        // Если кликаем на новое поле, устанавливаем по убыванию
        currentSortField = field;
        currentSortDirection = 'desc';
        console.log('🔄 Устанавливаем новое поле сортировки:', field, 'направление:', currentSortDirection);
    }
    
    // Обновляем иконки сортировки
    updateSortIcons();
    
    // Применяем сортировку
    filteredPlayers = sortPlayers(filteredPlayers);
    updateRankingTable();
    
    // Показываем уведомление о сортировке
    const directionText = currentSortDirection === 'asc' ? 'по возрастанию' : 'по убыванию';
    const fieldText = getFieldDisplayName(field);
    showNotification(`Сортировка: ${fieldText} ${directionText}`, 'success');
    
    console.log(`📊 Сортировка: ${currentSortField} ${currentSortDirection}`);
    console.log('✅ Сортировка применена и таблица обновлена');
}

// Функция для получения отображаемого названия поля
function getFieldDisplayName(field) {
    const displayName = (() => {
        switch (field) {
            case 'elo': return 'ELO';
            case 'matches': return 'Матчи';
            case 'wins': return 'Победы';
            case 'lastMatch': return 'Последний матч';
            default: return field;
        }
    })();
    
    console.log(`🏷️ Название поля "${field}" -> "${displayName}"`);
    return displayName;
}

// Функция для получения отображаемого названия фильтра
function getFilterDisplayName(filter) {
    const displayName = (() => {
        switch (filter) {
            case 'all': return 'Все игроки';
            case 'music': return 'Группа: Музыка';
            case 'black': return 'Группа: Черные';
            default: return filter;
        }
    })();
    
    console.log(`🏷️ Название фильтра "${filter}" -> "${displayName}"`);
    return displayName;
}

// Функция для обновления иконок сортировки
function updateSortIcons() {
    console.log('🎯 Обновляем иконки сортировки для поля:', currentSortField, 'направление:', currentSortDirection);
    
    // Убираем все классы сортировки
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Добавляем классы для текущего поля сортировки
    const currentSortHeader = document.querySelector(`[data-sort="${currentSortField}"]`);
    if (currentSortHeader) {
        currentSortHeader.classList.add(`sort-${currentSortDirection}`);
        console.log('✅ Иконка сортировки обновлена для:', currentSortField);
    } else {
        console.log('⚠️ Не найден заголовок для сортировки:', currentSortField);
    }
    
    console.log('✅ Иконки сортировки обновлены');
}

// Функция для форматирования даты последнего матча
function formatLastMatchDate(lastMatch) {
    if (!lastMatch) return 'пусто';
    
    console.log('🔧 formatLastMatchDate вызвана с:', lastMatch);
    
    try {
        const date = new Date(lastMatch);
        console.log('📅 Создан объект Date:', date);
        console.log('⏰ Timestamp объекта Date:', date.getTime());
        
        // Проверяем, что дата валидна
        if (isNaN(date.getTime())) {
            console.log('⚠️ Некорректная дата:', lastMatch);
            return 'пусто';
        }
        
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        console.log('⏱️ Разница в часах:', diffInHours);
        
        let result;
        
        // Если матч был сегодня
        if (diffInHours < 24) {
            result = `Сегодня - ${date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
        // Если матч был вчера
        else if (diffInHours < 48) {
            result = `Вчера - ${date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
        // Если матч был на этой неделе
        else if (diffInHours < 168) {
            const days = Math.floor(diffInHours / 24);
            result = `${days}д назад - ${date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
        // Если матч был давно, показываем дату и время
        else {
            result = `${date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short'
            })} - ${date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
        
        console.log('✅ Результат форматирования:', result);
        return result;
        
    } catch (error) {
        console.log('❌ Ошибка форматирования даты:', error);
        return 'пусто';
    }
}



// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Инициализация страницы FACEIT рейтинга');
    
    loadPlayersList();
    initSettingsModal();
    
    // Инициализация поиска
    const searchInput = document.getElementById('player-search');
    searchInput.addEventListener('input', (e) => {
        searchPlayers(e.target.value);
    });
    
    // Инициализация фильтров
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            btn.classList.add('active');
            // Применяем фильтр
            applyFilter(btn.getAttribute('data-filter'));
        });
    });
    
    // Инициализация сортировки
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const sortField = th.getAttribute('data-sort');
            changeSort(sortField);
        });
    });
    
    console.log('🔄 Начинаем загрузку данных рейтинга...');
    
    // Загружаем данные рейтинга
    loadRankingData();
    
    // Автообновление каждые 5 минут
    setInterval(() => {
        console.log('🔄 Автообновление данных рейтинга...');
        loadRankingData();
    }, 5 * 60 * 1000);
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('❌ Ошибка на странице рейтинга:', e.error);
    console.error('📍 Место ошибки:', e.filename, 'строка:', e.lineno, 'колонка:', e.colno);
    console.error('📋 Стек вызовов:', e.error?.stack);
});

// Экспорт функций для возможного использования
window.FaceitRanking = {
    loadRankingData,
    addPlayer,
    removePlayer,
    editPlayerGroup,
    applyFilter,
    changeSort,
    showNotification
};

console.log('🌐 Функции FACEIT рейтинга экспортированы в window.FaceitRanking');
console.log('📋 Доступные функции:', Object.keys(window.FaceitRanking));
