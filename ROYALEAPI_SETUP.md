# Настройка прокси-сервера RoyaleAPI для Clash Royale

## Что это такое?

RoyaleAPI предоставляет прокси-сервер для доступа к официальным API Supercell (Clash Royale, Clash of Clans, Brawl Stars) без необходимости иметь статический IP-адрес.

## Как это работает?

1. **Прокси-сервер**: `https://proxy.royaleapi.dev`
2. **Официальный API**: `https://api.clashroyale.com/v1`
3. **Замена**: Просто замените базовый URL на прокси-сервер

## Пошаговая настройка

### 1. Создание API ключа
1. Перейдите на [Clash Royale Developer Portal](https://developer.clashroyale.com/)
2. Создайте новый API ключ
3. **ВАЖНО**: В whitelist добавьте IP адрес: `45.79.218.79`

### 2. Настройка переменных окружения
```bash
# В файле .env или переменных окружения
CLASH_ROYALE_API_TOKEN=your_api_token_here
```

### 3. Использование в коде
```javascript
// Старый способ (прямой API)
const API_URL = 'https://api.clashroyale.com/v1/players/%23C0G20PR2';

// Новый способ (через прокси)
const API_URL = 'https://proxy.royaleapi.dev/v1/players/%23C0G20PR2';
```

## Преимущества

✅ **Нет необходимости в статическом IP**
✅ **Простая настройка**
✅ **Надежный доступ к API**
✅ **Поддержка всех официальных эндпоинтов**

## Примеры запросов

### Получение профиля игрока
```
GET https://proxy.royaleapi.dev/v1/players/%23C0G20PR2
Authorization: Bearer YOUR_API_TOKEN
```

### Получение клана
```
GET https://proxy.royaleapi.dev/v1/clans/%232L0LJPY
Authorization: Bearer YOUR_API_TOKEN
```

### Получение карт
```
GET https://proxy.royaleapi.dev/v1/cards
Authorization: Bearer YOUR_API_TOKEN
```

## Обработка ошибок

- **403**: Проверьте API ключ и whitelist IP
- **429**: Превышен лимит запросов
- **404**: Ресурс не найден

## Поддержка

- [RoyaleAPI Documentation](https://docs.royaleapi.com/)
- [Clash Royale Developer Portal](https://developer.clashroyale.com/)
- [RoyaleAPI Discord](https://discord.gg/royaleapi)

## Примечания

- Прокси-сервер автоматически обрабатывает CORS
- Все запросы проходят через IP `45.79.218.79`
- API ключ должен быть добавлен в whitelist этого IP
- Лимиты запросов соответствуют официальным ограничениям Supercell
