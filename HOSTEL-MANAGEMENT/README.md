Smart Hostel Room Allocation (Ponnar Hostel)

Tech: Node/Express, MongoDB, JWT, React (Vite + Tailwind)

Backend .env (create in `backend/.env`)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=super_secret_change_me
CLIENT_ORIGIN=http://localhost:5173

Frontend .env (create in `frontend/.env`)
VITE_API_BASE_URL=http://localhost:5000/api

Run backend
1) cd backend
2) npm install
3) npm run dev

Seed rooms (optional)
npm run seed:rooms

Run frontend
1) cd frontend
2) npm install
3) npm run dev

Usage
- Register as student (with roll number) or admin
- Admin: seed rooms, review requests, approve/reject
- Student: pick green room, submit request with roommates roll numbers

