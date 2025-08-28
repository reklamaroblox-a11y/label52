# 🔧 Временное решение проблемы с Netlify Functions

## ❌ Проблема
Netlify Functions возвращает 404 ошибку, что означает, что серверная функция `api.js` не развернута или не работает.

## ✅ Временное решение
Используем прямой вызов прокси-сервера RoyaleAPI вместо Netlify Functions.

## 🚀 Быстрая настройка

### 1. Получите API ключ
- Перейдите на [Clash Royale Developer Portal](https://developer.clashroyale.com/)
- Создайте новый API ключ
- **ВАЖНО**: В whitelist добавьте IP `45.79.218.79`

### 2. Обновите код
В файле `clash-royale-script.js` найдите строку:
```javascript
const TEMP_API_KEY = 'YOUR_API_KEY_HERE';
```

И замените `YOUR_API_KEY_HERE` на ваш реальный API ключ.

### 3. Проверьте работу
Откройте страницу Clash Royale и попробуйте найти игрока.

## ⚠️ Важные моменты

- **Это временное решение** - API ключ будет виден в коде
- **Не коммитьте** файл с реальным API ключом в Git
- **Восстановите Netlify Functions** как можно скорее

## 🔄 Восстановление Netlify Functions

После исправления проблем с Netlify Functions:

1. Верните `API_BASE_URL` на `'/.netlify/functions/api'`
2. Удалите `TEMP_API_KEY` и связанный код
3. Убедитесь, что переменная окружения `CLASH_ROYALE_API_TOKEN` установлена в Netlify

## 🆘 Если что-то не работает

1. **Проверьте API ключ** - он должен быть действительным
2. **Проверьте whitelist IP** - должен содержать `45.79.218.79`
3. **Откройте консоль браузера** - там будут видны ошибки

## 📚 Связанные файлы

- [ROYALEAPI_SETUP.md](./ROYALEAPI_SETUP.md) - Полная настройка
- [QUICK_SETUP.md](./QUICK_SETUP.md) - Быстрая настройка
- [README.md](./README.md) - Общая документация
