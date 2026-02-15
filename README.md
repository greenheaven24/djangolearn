<<<<<<< HEAD
# djangolearn
=======
# Django + React Expense Tracker

Small learning project with:
- Django REST API backend
- React (Vite) frontend
- Category + transaction CRUD
- Monthly dashboard totals

## 1) Run backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs on `http://localhost:8000`.
API root is `http://localhost:8000/api/`.

## 2) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.
Vite proxy forwards `/api` to Django.

## Common fixes

- If API calls fail with `no such table: expenses_category`, run `python manage.py migrate` again from `backend/`.
- Keep backend running on port `8000` before starting frontend.

## API endpoints

- `GET/POST /api/categories/`
- `GET/PUT/PATCH/DELETE /api/categories/:id/`
- `GET/POST /api/transactions/`
- `GET/PUT/PATCH/DELETE /api/transactions/:id/`
- `GET /api/dashboard/`
>>>>>>> 8ed71e9 (Initial commit: Django + React expense tracker)
