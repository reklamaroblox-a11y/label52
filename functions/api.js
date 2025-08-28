const axios = require('axios');

// Конфигурация API
const CLASH_ROYALE_API_TOKEN = process.env.CLASH_ROYALE_API_TOKEN;
const API_BASE_URL = 'https://api.clashroyale.com/v1';

exports.handler = async (event, context) => {
    // Логирование для диагностики
    console.log('🔍 API Function вызвана');
    console.log('📝 Token present:', !!process.env.CLASH_ROYALE_API_TOKEN);
    console.log('🌐 Request path:', event.path);
    
    // CORS заголовки
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Обработка preflight запросов
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/.netlify/functions/api', '');
        const url = `${API_BASE_URL}${path}`;
        
        console.log(`Запрос к API: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${CLASH_ROYALE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response.data)
        };
        
    } catch (error) {
        console.error('Ошибка API:', error.response?.status, error.response?.data);
        
        let statusCode = 500;
        let message = 'Внутренняя ошибка сервера';
        
        if (error.response?.status === 404) {
            statusCode = 404;
            message = 'Игрок не найден. Проверьте правильность тега.';
        } else if (error.response?.status === 403) {
            statusCode = 403;
            message = 'Ошибка доступа к API. Попробуйте позже.';
        }
        
        return {
            statusCode,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: true,
                message
            })
        };
    }
};
