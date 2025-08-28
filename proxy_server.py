#!/usr/bin/env python3
"""
Простой прокси-сервер для API Clash Royale
Обходит CORS ограничения для фронтенда
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import ssl
from urllib.error import HTTPError, URLError

# Конфигурация
CLASH_ROYALE_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImJlNTNhZjBlLTcxYmItNDFmYy05NjA3LWQ0YjRkNjY0NjA4YSIsImlhdCI6MTc1NjQwMDY2Niwic3ViIjoiZGV2ZWxvcGVyL2QxNmI1OTMxLTc4NTctNTQ5Yy1hMjlmLTAzOTEwNDI3NDc2NSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI1LjM1LjExMy45MSJdLCJ0eXBlIjoiY2xpZW50In1dfQ.azalNZ4Nv4qH_TGgToldJV8IHcesnc0FvRMnnVo00yp5JT2kT2IdVvtSMpTnV8RwMt0N0hZfoAFtc4ESt0GK3w'
API_BASE_URL = 'https://api.clashroyale.com/v1'

class ClashRoyaleProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Обработка запросов к API Clash Royale
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # Обычная обработка статических файлов
            super().do_GET()
    
    def handle_api_request(self):
        try:
            # Извлекаем путь API из URL
            api_path = self.path[5:]  # Убираем '/api/'
            
            # Формируем полный URL для API
            api_url = f"{API_BASE_URL}/{api_path.lstrip('/')}"
            
            print(f"Проксирование запроса: {api_url}")
            
            # Создаем запрос к API
            req = urllib.request.Request(api_url)
            req.add_header('Authorization', f'Bearer {CLASH_ROYALE_API_TOKEN}')
            req.add_header('Content-Type', 'application/json')
            
            # Выполняем запрос
            with urllib.request.urlopen(req) as response:
                data = response.read()
                
                # Отправляем ответ клиенту
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.end_headers()
                self.wfile.write(data)
                
        except HTTPError as e:
            # Обработка HTTP ошибок
            error_data = {
                'error': True,
                'message': f'HTTP Error {e.code}: {e.reason}',
                'status': e.code
            }
            
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode())
            
        except URLError as e:
            # Обработка ошибок сети
            error_data = {
                'error': True,
                'message': f'Network Error: {str(e.reason)}',
                'status': 500
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode())
            
        except Exception as e:
            # Обработка других ошибок
            error_data = {
                'error': True,
                'message': f'Server Error: {str(e)}',
                'status': 500
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode())
    
    def do_OPTIONS(self):
        # Обработка preflight запросов CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

def run_server(port=8000):
    """Запуск прокси-сервера"""
    with socketserver.TCPServer(("", port), ClashRoyaleProxyHandler) as httpd:
        print(f"🚀 Прокси-сервер запущен на порту {port}")
        print(f"📡 API Clash Royale доступен по адресу: http://localhost:{port}/api/")
        print(f"🌐 Статические файлы доступны по адресу: http://localhost:{port}/")
        print("Нажмите Ctrl+C для остановки сервера")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер остановлен")

if __name__ == "__main__":
    run_server()
