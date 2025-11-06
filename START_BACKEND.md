# How to Start the Backend Server

## Quick Start

1. **Open a terminal/command prompt**

2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Make sure you have a `.env` file with required variables:**
   - `JWT_SECRET` - A secret key for JWT tokens
   - `MONGODB_URI` - Your MongoDB connection string
   - `PORT` (optional) - Defaults to 9653 if not set

4. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Verify Backend is Running

After starting, you should see:
- `✅ Server started on port 9653`
- `✅ MongoDB connected`
- `🌐 API available at http://localhost:9653`

You can test the connection by visiting:
- http://localhost:9653/ (should show API is running message)
- http://localhost:9653/api/test (test endpoint)

## Troubleshooting

### "Cannot connect to server" Error

1. **Check if backend is running:**
   - Open http://localhost:9653/ in your browser
   - If you see an error, the backend is not running

2. **Check MongoDB connection:**
   - Make sure MongoDB is running
   - Verify `MONGODB_URI` in `.env` is correct

3. **Check port 9653:**
   - Make sure no other application is using port 9653
   - Try changing `PORT` in `.env` if needed

4. **Check environment variables:**
   - Ensure `.env` file exists in the `backend` directory
   - Verify `JWT_SECRET` and `MONGODB_URI` are set

### Common Issues

- **MongoDB not running:** Start MongoDB service
- **Port already in use:** Change `PORT` in `.env` or stop the conflicting service
- **Missing dependencies:** Run `npm install` in the backend directory
- **CORS errors:** Backend should allow `http://localhost:5173` (Vite default port)

## Next Steps

Once the backend is running:
1. Start the frontend in a separate terminal:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open your browser and navigate to the frontend URL (usually http://localhost:5173)
3. Try logging in - it should now connect to the backend successfully!

