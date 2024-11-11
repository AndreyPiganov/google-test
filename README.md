### Описание проекта

Проект реализует механизм выгрузки данных из PostgreSQL в произвольное количество Google Sheets. Данные извлекаются через API Wildberries, обрабатываются и накапливаются в базе данных PostgreSQL. После этого данные регулярно выгружаются в Google Sheets, где они сортируются по возрастанию коэффициента.

### Требования

СУБД: PostgreSQL.
Библиотека для работы с СУБД: Knex.js.
Типизация: TypeScript с параметром strict.
Google API: Для авторизации и выгрузки данных в Google Sheets используется Google OAuth2.
Технологии
Nest.js — серверный фреймворк для разработки приложения.
PostgreSQL — реляционная база данных для хранения данных.
Knex.js — SQL query builder для работы с PostgreSQL.
Google Sheets API — для выгрузки данных в таблицы Google Sheets.
Docker — для контейнеризации приложения и базы данных.
Установка и настройка

1. Клонируйте репозиторий
   ```bash
   git clone https://github.com/google-test.git
   cd your-repository
   ```
2. Установите зависимости
   ```bash
   npm install
```
3. Настройка окружения
   Создайте файл .env в корневой директории проекта. Пример содержания .env файла:

## .env

API_KEY=your_wildberries_api_key
NODE_ENV=development
LOG_LEVEL=info
PORT=3000
DATABASE_URL=postgres://username:password@localhost:5432/your_database
CREDENTIALS_NAME=credentials.json

# Пояснение параметров:

API_KEY: ключ API Wildberries для получения данных о тарифах.
NODE_ENV: среда разработки (например, development или production).
LOG_LEVEL: уровень логирования (например, info, debug, error).
PORT: порт, на котором будет работать сервер (например, 3000).
DATABASE_URL: строка подключения к базе данных PostgreSQL.

Перейдите в Google Cloud Console.
Создайте новый проект или используйте существующий.
Перейдите в API & Services и включите Google Sheets API.
Создайте учетные данные (OAuth 2.0 client ID) для вашего проекта:
В разделе APIs & Services > Credentials выберите Create Credentials.
Выберите OAuth 2.0 Client IDs и настройте редиректы для вашего локального хоста (например, http://localhost).
Скачайте файл с учетными данными credentials.json и разместите его в папке src/config.(Скачайте и переименуйте его в credentials.json)

## 5. Docker настройка

Проект использует Docker для контейнеризации приложения и PostgreSQL. Для запуска проекта в Docker используйте следующий шаг.

## 5.1 Создайте и запустите контейнеры

```bash
docker-compose up --build
```

Контейнеры для PostgreSQL и приложения будут собраны и запущены.

## 5.2 Остановить контейнеры

```bash
docker-compose down
```

### API

Получение ссылки для авторизации Google
URL
GET /google

Описание
Этот endpoint предоставляет ссылку для авторизации в Google API, с помощью которой вы получите код для получения токена.

Пример ответа
json

```bash
{
"url": "https://accounts.google.com/o/oauth2/v2/auth?...code..."
}
```

Получение токена по коду авторизации
URL
POST /token/:code

Описание
Этот endpoint принимает код авторизации, полученный с помощью ссылки из предыдущего запроса, и сохраняет токен в файл token.json.

Пример запроса

```bash

POST /token/your_auth_code
Пример ответа
json
{
"message": "Token stored to token.json"
}
```

### Логика работы

Получение данных с API Wildberries

Каждые 30 секунд происходит запрос данных о тарифах из API Wildberries.
Эти данные сохраняются в базу данных PostgreSQL, где они накапливаются на каждый день.
Информация, получаемая за день, обновляет уже существующие данные.
Обработка данных и выгрузка в Google Sheets

После накопления данных в PostgreSQL, они регулярно выгружаются в Google Sheets.
Данные сортируются по возрастанию коэффициента.
Для каждой таблицы Google Sheets создается новый лист с данными, и каждая таблица может быть уникальной.
Установка и создание токенов Google API

1. Получение кода для авторизации
   Перейдите по адресу, полученному через /google.
   Авторизуйтесь в своем Google аккаунте и получите код авторизации.
2. Получение токенов
   Отправьте запрос на /token/:code, где :code — это код авторизации, полученный на предыдущем шаге.
   После этого токен будет сохранен в файле src/config/token.json.
3. Обновление токенов
   Если токен истечет, он автоматически обновится при следующем запросе.

### Если использовать мой токен то можно использовать таблицы с id 12OCI3S0LC-TWuUQrzCBtJ8NJu9jjwx1akdRMLG6xHrY и 17XZbVIN-gE6QReIAH3nGgVpHvMMA7GIdiwB6n3-EEgY

Нужно кинуть запрос на POST http://localhost:5005/google-sheets-metadata/
С данными - 
```bash
{
    "spreadsheet_id": "12OCI3S0LC-TWuUQrzCBtJ8NJu9jjwx1akdRMLG6xHrY"
}
```
