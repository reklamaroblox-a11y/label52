# 🚀 Развертывание на Vercel

## Шаг 1: Подготовка проекта

✅ Проект уже готов к развертыванию:
- `server.js` - Node.js сервер
- `package.json` - зависимости
- `vercel.json` - конфигурация Vercel

## Шаг 2: Подключение к Vercel

### Вариант A: Через веб-интерфейс (Рекомендуется)

1. **Перейдите на https://vercel.com**
2. **Войдите в аккаунт**
3. **Нажмите "New Project"**
4. **Выберите ваш GitHub репозиторий** `label52`
5. **Настройте проект:**
   - Framework Preset: `Node.js`
   - Root Directory: `./` (оставьте пустым)
   - Build Command: оставьте пустым
   - Output Directory: оставьте пустым

### Вариант B: Через CLI

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Развертывание
vercel
```

## Шаг 3: Настройка переменных окружения

### В веб-интерфейсе Vercel:

1. **Перейдите в настройки проекта**
2. **Выберите "Environment Variables"**
3. **Добавьте переменную:**
   - **Name:** `CLASH_ROYALE_API_TOKEN`
   - **Value:** ваш API токен
   - **Environment:** Production, Preview, Development

### Или через CLI:

```bash
vercel env add CLASH_ROYALE_API_TOKEN
```

## Шаг 4: Получение нового API токена

1. **Перейдите на https://developer.clashroyale.com/**
2. **Войдите в аккаунт**
3. **Создайте новый токен или обновите существующий**
4. **Добавьте IP адрес Vercel:**
   - IP будет предоставлен после первого деплоя
   - Или используйте `0.0.0.0/0` для всех IP (менее безопасно)

## Шаг 5: Деплой

После настройки переменных окружения:

1. **Перейдите в "Deployments"**
2. **Нажмите "Redeploy"** (если нужно)
3. **Или сделайте новый коммит в GitHub** - деплой произойдет автоматически

## Шаг 6: Проверка работы

1. **Откройте ваш сайт** (URL будет предоставлен Vercel)
2. **Перейдите на страницу Clash Royale**
3. **Попробуйте найти игрока** (например: `#8J80CR92J`)

## 🔧 Устранение проблем

### Ошибка 403 Forbidden:
- Проверьте правильность API токена
- Убедитесь, что IP Vercel добавлен в разрешенные

### Ошибка 404:
- Проверьте правильность тега игрока
- Убедитесь, что API токен работает

### Ошибка сборки:
- Проверьте `package.json`
- Убедитесь, что все зависимости указаны

## 📊 Мониторинг

- **Логи:** В настройках проекта → Functions → View Function Logs
- **Аналитика:** В настройках проекта → Analytics
- **Производительность:** В настройках проекта → Speed Insights

## 🔗 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Clash Royale API](https://developer.clashroyale.com/)
- [Node.js на Vercel](https://vercel.com/docs/runtimes#official-runtimes/node-js)
