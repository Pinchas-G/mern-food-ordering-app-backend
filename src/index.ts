import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import helmet from 'helmet';
import expressRateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';
import mongoSanitize from 'express-mongo-sanitize';

// Import routes
import myUserRoute from './routes/MyUserRoute';
import myRestaurantRoute from './routes/MyRestaurantRoute';
import restaurantRoute from './routes/RestaurantRoute';
import orderRoute from './routes/OrderRoute';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => console.log('Connected to database!'));

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
app.use(express.json());

// Sanitize request body
app.use((req, res, next) => {
    if (req.body) req.body = sanitizeRequestBody(req.body);
    next();
});

const sanitizeRequestBody = (body: any) => {
    return sanitizeHtml(body, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

app.use(mongoSanitize());

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    res.send({ message: 'Health OK!' });
});

// Routes
app.use('/api/my/user', myUserRoute);
app.use('/api/my/restaurant', myRestaurantRoute);
app.use('/api/restaurant', restaurantRoute);
app.use('/api/order', orderRoute);
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

// Start server
const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});