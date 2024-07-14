import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import helmet from 'helmet';
import expressRateLimit from 'express-rate-limit';
import { sanitizeRequestMiddleware } from './middleware/sanitizeRequest';
import mongoSanitize from 'express-mongo-sanitize';
import errorHandler from './middleware/errorHandler';

// Import routes
import myUserRoute from './routes/MyUserRoute';
import myRestaurantRoute from './routes/MyRestaurantRoute';
import restaurantRoute from './routes/RestaurantRoute';
import orderRoute from './routes/OrderRoute';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string, {
            autoIndex: false,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            serverSelectionTimeoutMS: 20000,
        });
        console.log('Connected to database!');
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1); // Exit process with failure
    }
};

connectDB();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(expressRateLimit({
    windowMs: 1000,
    limit: 500,
    message: 'Too many requests from this IP, please try again later.',
}));
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.json());
app.use(mongoSanitize());

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    res.send({ message: 'Health OK!' });
});

// Routes
app.use('/api/my/user', sanitizeRequestMiddleware, myUserRoute);
app.use('/api/my/restaurant', sanitizeRequestMiddleware, myRestaurantRoute);
app.use('/api/restaurant', sanitizeRequestMiddleware, restaurantRoute);
app.use('/api/order', orderRoute);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.SERVER_PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});