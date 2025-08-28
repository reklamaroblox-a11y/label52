const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация API
const CLASH_ROYALE_API_TOKEN = process.env.CLASH_ROYALE_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImRhZWE3Y2MwLTEyMmItNDcxOS1iMjMzLTU5NzJmMzY0MDE0YiIsImlhdCI6MTc1NjQxNTY2MSwic3ViIjoiZGV2ZWxvcGVyL2QxNmI1OTMxLTc4NTctNTQ5Yy1hMjlmLTAzOTEwNDI3NDc2NSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI0NS43OS4yMTguNzkiXSwidHlwZSI6ImNsaWVudCJ9XX0.7m8yvoWZazJuUysMiy0d_eLfVkfZ-2MQmUH6yVdnmaAxJzLnVhxQCDIvikaPLxi6rkidVy_68jvefdwOkZP6zQ';
const API_BASE_URL = 'https://proxy.royaleapi.dev/v1';

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы с правильными заголовками
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Специальные маршруты для статических файлов
app.get('*.css', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
});

app.get('*.js', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
});

// API прокси для Clash Royale
app.get('/api/players/:playerTag', async (req, res) => {
    try {
        const { playerTag } = req.params;
        const url = `${API_BASE_URL}/players/${encodeURIComponent(playerTag)}`;
        
        console.log(`Запрос к API: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${CLASH_ROYALE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json(response.data);
        
    } catch (error) {
        console.error('Ошибка API:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 404) {
            res.status(404).json({
                error: true,
                message: 'Игрок не найден. Проверьте правильность тега.'
            });
        } else if (error.response?.status === 403) {
            res.status(403).json({
                error: true,
                message: 'Ошибка доступа к API. Попробуйте позже.'
            });
        } else {
            res.status(500).json({
                error: true,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
});

// Обработка других API эндпоинтов
app.get('/api/*', async (req, res) => {
    try {
        const apiPath = req.path.replace('/api', '');
        const url = `${API_BASE_URL}${apiPath}`;
        
        console.log(`Запрос к API: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${CLASH_ROYALE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json(response.data);
        
    } catch (error) {
        console.error('Ошибка API:', error.response?.status);
        res.status(error.response?.status || 500).json({
            error: true,
            message: 'Ошибка при обращении к API'
        });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Сайт доступен: http://localhost:${PORT}`);
    console.log(`📡 API доступен: http://localhost:${PORT}/api/`);
});
