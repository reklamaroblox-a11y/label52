# 🚀 Развертывание LABEL 52 с Clash Royale API

## Проблема с IP ограничениями

Clash Royale API требует указания IP адреса в токене, что делает невозможным прямое использование API из браузера для всех пользователей.

## Решение: Серверный прокси

### Вариант 1: Node.js сервер (Рекомендуется)

#### 1. Установка зависимостей
```bash
npm install
```

#### 2. Настройка API токена
1. Перейдите на https://developer.clashroyale.com/
2. Создайте новый токен или обновите существующий
3. Добавьте IP адрес вашего сервера в список разрешенных
4. Скопируйте токен в файл `server.js`:
```javascript
const CLASH_ROYALE_API_TOKEN = 'YOUR_NEW_TOKEN_HERE';
```

#### 3. Запуск сервера
```bash
# Продакшн
npm start

# Разработка (с автоперезагрузкой)
npm run dev
```

#### 4. Доступ к сайту
- **Сайт**: http://localhost:3000
- **API**: http://localhost:3000/api/

### Вариант 2: Python сервер (Альтернатива)

#### 1. Установка зависимостей
```bash
pip install flask requests
```

#### 2. Запуск
```bash
python proxy_server.py
```

### Вариант 3: Развертывание на хостинге

#### Heroku
1. Создайте аккаунт на Heroku
2. Установите Heroku CLI
3. Создайте приложение:
```bash
heroku create your-app-name
git push heroku main
```

#### Vercel
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения:
   - `CLASH_ROYALE_TOKEN` - ваш API токен
3. Деплой автоматический

#### Netlify Functions
1. Создайте папку `netlify/functions/`
2. Добавьте serverless функции для API
3. Настройте переменные окружения

## Структура проекта

```
label52/
├── server.js              # Node.js сервер
├── package.json           # Зависимости
├── proxy_server.py        # Python альтернатива
├── clash-royale.html      # Страница Clash Royale
├── clash-royale-styles.css
├── clash-royale-script.js
├── index.html             # Главная страница
└── DEPLOYMENT.md          # Этот файл
```

## Безопасность

- ✅ API токен хранится только на сервере
- ✅ CORS настроен для безопасности
- ✅ Обработка ошибок API
- ✅ Логирование запросов

## Мониторинг

Сервер логирует все API запросы:
```
Запрос к API: https://api.clashroyale.com/v1/players/%238J80CR92J
```

## Поддержка

При возникновении проблем:
1. Проверьте правильность API токена
2. Убедитесь, что IP сервера добавлен в разрешенные
3. Проверьте логи сервера
4. Убедитесь, что порт не занят другим процессом
