# 🎵 LABEL 52 - Музыкальный лейбл

Современный веб-сайт музыкального лейбла LABEL 52 с красивым дизайном в стиле Syntx.ai.

## 🎮 Дополнительные функции

- 🏆 **Clash Royale Stats** - Статистика игроков Clash Royale
- 🎯 **FACEIT Rankings** - Рейтинги игроков FACEIT
- 🎨 **Artist Profiles** - Профили артистов
- 🎵 **Spotify Stats** - Статистика Spotify

## ✨ Особенности

- 🎨 Современный дизайн с градиентами и анимациями
- 📱 Полностью адаптивная верстка
- 🎵 Анимированный музыкальный визуализатор
- ⚡ Плавные переходы и интерактивные элементы
- 🌟 Эффекты стекла (glassmorphism)
- 🎯 Оптимизированная производительность

## 🛠️ Технологии

- HTML5
- CSS3 (с CSS переменными и Grid/Flexbox)
- JavaScript (ES6+)
- Font Awesome для иконок
- Google Fonts (Inter)

## 🚀 Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/label52-website.git
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp env.example .env
# Отредактируйте .env файл, добавив ваш API ключ
```

4. Запустите локальный сервер:
```bash
npm start
```

5. Или откройте `index.html` в браузере для статической версии

## 📁 Структура проекта

```
label52-website/
├── index.html              # Главная страница
├── styles.css              # Основные стили
├── script.js               # Основная JavaScript функциональность
├── functions/
│   └── api.js             # Netlify Functions для API
├── clash-royale.html       # Страница Clash Royale
├── clash-royale-script.js  # Скрипт Clash Royale
├── clash-royale-styles.css # Стили Clash Royale
├── faceit-ranking.html     # Страница FACEIT
├── faceit-ranking-script.js # Скрипт FACEIT
├── faceit-ranking-styles.css # Стили FACEIT
├── artist.html             # Страница артистов
├── artist-script.js        # Скрипт артистов
├── artist-styles.css       # Стили артистов
├── spotify-stats.html      # Страница Spotify
├── netlify.toml           # Конфигурация Netlify
├── package.json           # Зависимости проекта
├── env.example            # Пример переменных окружения
├── ROYALEAPI_SETUP.md     # Настройка RoyaleAPI
└── README.md              # Документация
```

## 🎨 Цветовая схема

- **Основной цвет**: #6366f1 (фиолетовый)
- **Вторичный цвет**: #8b5cf6 (пурпурный)
- **Акцентный цвет**: #06b6d4 (голубой)
- **Фон**: #0f0f23 (темно-синий)

## 📱 Адаптивность

Сайт полностью адаптивен и оптимизирован для:
- 📱 Мобильные устройства
- 📱 Планшеты
- 💻 Десктопы

## 🔧 Настройка API

### Clash Royale API
Для работы с Clash Royale API используется прокси-сервер RoyaleAPI:

1. Создайте API ключ на [Clash Royale Developer Portal](https://developer.clashroyale.com/)
2. Добавьте IP `45.79.218.79` в whitelist вашего ключа
3. Установите переменную окружения `CLASH_ROYALE_API_TOKEN`

Подробные инструкции: [ROYALEAPI_SETUP.md](./ROYALEAPI_SETUP.md)

### FACEIT API
Для работы с FACEIT API требуется API ключ:
1. Получите ключ на [FACEIT Developer Portal](https://developers.faceit.com/)
2. Установите переменную окружения `FACEIT_API_KEY`

## 🌐 Развертывание

Сайт готов к развертыванию на любом статическом хостинге:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

**Для работы с API рекомендуется использовать Netlify с настроенными переменными окружения.**

## 📞 Контакты

- Email: info@label52.com
- Телефон: +7 (XXX) XXX-XX-XX
- Адрес: Москва, Россия

## 📄 Лицензия

© 2024 LABEL 52. Все права защищены.

---

**Создано с ❤️ для музыкальной индустрии**
