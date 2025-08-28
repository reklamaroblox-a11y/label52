# 🔍 Диагностика API проблем

## Шаг 1: Проверка токена в Netlify

1. **Перейдите в ваш проект в Netlify**
2. **Выберите "Site settings"**
3. **Перейдите в "Environment variables"**
4. **Найдите `CLASH_ROYALE_API_TOKEN`**
5. **Убедитесь, что значение обновлено**

## Шаг 2: Проверка логики API

### **Проверьте логи Netlify:**
1. Перейдите в "Functions" → "api"
2. Посмотрите логи последних запросов
3. Найдите ошибки

### **Возможные проблемы:**

#### **Проблема 1: Токен не обновился**
- Передеплойте проект после обновления переменной
- Проверьте, что переменная сохранена

#### **Проблема 2: Неправильный формат токена**
- Убедитесь, что токен начинается с `eyJ`
- Проверьте, что нет лишних пробелов

#### **Проблема 3: IP адрес не обновился**
- Подождите 5-10 минут после обновления IP
- Попробуйте создать новый токен

## Шаг 3: Тестирование API напрямую

### **Создайте тестовый файл:**
```javascript
// test-api.js
const axios = require('axios');

const token = 'YOUR_NEW_TOKEN_HERE';
const url = 'https://api.clashroyale.com/v1/players/%238J80CR92J';

axios.get(url, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('✅ API работает:', response.status);
    console.log('Данные:', response.data.name);
})
.catch(error => {
    console.log('❌ Ошибка API:', error.response?.status);
    console.log('Сообщение:', error.response?.data);
});
```

## Шаг 4: Альтернативные решения

### **Вариант A: Создайте новый токен**
1. Удалите старый токен
2. Создайте новый с IP `0.0.0.0/0`
3. Обновите в Netlify

### **Вариант B: Используйте другой хостинг**
- Попробуйте Railway или Render
- Они могут иметь другие IP адреса

### **Вариант C: Локальное тестирование**
- Запустите `python proxy_server.py`
- Протестируйте локально

## Шаг 5: Проверка кода

### **Убедитесь, что в `functions/api.js`:**
```javascript
const CLASH_ROYALE_API_TOKEN = process.env.CLASH_ROYALE_API_TOKEN;
console.log('Token:', CLASH_ROYALE_API_TOKEN ? 'Present' : 'Missing');
```

## Быстрые команды для проверки:

```bash
# Проверка IP вашего сайта
nslookup your-site-name.netlify.app

# Проверка доступности API
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.clashroyale.com/v1/players/%238J80CR92J
```

**Какой шаг попробуете сначала?**
