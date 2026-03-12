# GoatBook Phase 1: Authentication & Dashboard

## Status: 🟢 Environment Ready

### ✅ Done
- [x] Initialized Frontend (React Native/Expo) in `/frontend`
- [x] Initialized Backend (Node.js/Express) in `/backend`
- [x] Database Schema defined in `backend/database.sql`
- [x] Brand UI Theme implemented (Orange/White branding)
- [x] Reusable Components: `GInput`, `GButton`
- [x] Login Screen (Matches Figma)
- [x] Register Screen (Matches Figma)
- [x] Dashboard Screen with Tiles (Breed, Employee, Animal)
- [x] Navigation flow (Auth to App)
- [x] Backend Auth API (Register/Login with bcrypt and JWT)

### 🚀 How to Run (Development)

#### 1. Backend
```bash
cd backend
npm run dev
```
*Note: Ensure you have PostgreSQL running and update `backend/.env` with your credentials.*

#### 2. Frontend
```bash
cd frontend
npx expo start
```

### 📱 Testing & Feedback
- The UI is designed to be responsive using `SafeAreaView` and flexible layouts.
- You can see changes in real-time using **Expo Go** on your phone or an emulator.
- Authentication currently uses a mock delay in the UI, but the API is fully ready to be connected via `axios`.
