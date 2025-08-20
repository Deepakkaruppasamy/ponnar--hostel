import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import http from 'http';
import { initSocket, io } from './realtime/socket.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import messRoutes from './routes/messRoutes.js';
import housekeepingRoutes from './routes/housekeepingRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import gatepassRoutes from './routes/gatepassRoutes.js';
import inspectionsRoutes from './routes/inspectionsRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';

dotenv.config();

const app = express();
// nodemon: harmless change to trigger reload after ENV update

const allowedOrigins = (
    process.env.CLIENT_ORIGIN && process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
) || ['http://localhost:5173', 'http://localhost:7000', 'http://localhost:7001'];
const isProd = process.env.NODE_ENV === 'production';
console.log('[CORS] NODE_ENV=', process.env.NODE_ENV, 'allowedOrigins=', allowedOrigins);
const corsOptions = {
    origin: isProd
        ? function (origin, callback) {
              // allow requests with no origin like mobile apps or curl
              if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
              return callback(new Error('Not allowed by CORS'));
          }
        : true, // non-production: allow all origins for easier dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Do not restrict headers; let CORS reflect Access-Control-Request-Headers
    // If you need to be explicit, uncomment below and include common headers
    // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204,
};
// Apply CORS to all routes except Socket.IO transport endpoints to avoid double headers
app.use((req, res, next) => {
    if (req.path && req.path.startsWith('/socket.io')) return next();
    return cors(corsOptions)(req, res, next);
});
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'smart-hostel-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/gatepass', gatepassRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/parking', parkingRoutes);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || 'Server error' });
});

const BASE_PORT = Number(process.env.PORT) || 5000;

function startServerWithFallback(port, attempts = 0, maxAttempts = 5) {
    const server = http.createServer(app);
    initSocket(server);
    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attempts < maxAttempts) {
            const nextPort = port + 1;
            console.warn(`Port ${port} in use, retrying on ${nextPort}...`);
            startServerWithFallback(nextPort, attempts + 1, maxAttempts);
        } else {
            console.error('Server failed to start:', err);
            process.exit(1);
        }
    });
    server.listen(port, () => console.log(`Server listening on port ${port}`));
}

connectToDatabase()
    .then(() => startServerWithFallback(BASE_PORT))
    .catch((err) => {
        console.error('Failed to connect to database:', err);
        process.exit(1);
    });