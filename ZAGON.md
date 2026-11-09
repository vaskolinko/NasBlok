# Lokalni zagon

Potrebno: Docker Desktop, Python 3.12 ali novejši, Node.js 20 ali novejši.

## 1. Podatkovna baza in Mailpit

```bash
docker compose up -d
```

Mailpit (testna e-pošta) je na http://localhost:8025.

## 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac ali Linux
pip install -r requirements.txt
copy .env.example .env         # Windows (Mac ali Linux: cp .env.example .env)
alembic upgrade head           # ustvari tabele
uvicorn app.main:app --reload
```

Backend teče na http://localhost:8000, dokumentacija API-ja pa je na http://localhost:8000/docs.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacija teče na http://localhost:5173.
