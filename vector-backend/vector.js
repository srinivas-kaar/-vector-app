const express = require('express');
const cors = require('cors');
const vectorRouter = require('./vector-router');

const app = express();

// CORS configuration for Cloud Foundry
const corsOptions = {
    origin: [
        'https://dpfna-sbx-sbx-vector.cfapps.us10-001.hana.ondemand.com',
        'https://dpfna-sbx-sbx-vector-backend.cfapps.us10-001.hana.ondemand.com',
        'http://localhost:3000' // for local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

// Apply CORS to all routes
app.use(cors(corsOptions));

app.use(express.json());

// Mount the vector router at /api
app.use('/api', vectorRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 5003;
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
    console.log('CORS enabled for origins:', corsOptions.origin);
    console.log('Connected to SAP Datasphere via HANA Cloud');
});