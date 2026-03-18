require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const corsOptions = {
  origin: = '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// Schema
const healthDataSchema = new mongoose.Schema(
    {
        user_id: { type: Number, required: true },
        timestamp: { type: String, required: true },
        rr_interval_ms: { type: Number },
        heart_rate_bpm: { type: Number },
        accel_x: { type: Number },
        accel_y: { type: Number },
        accel_z: { type: Number },
        step_count: { type: Number },
        cadence_spm: { type: Number },
        activity_intensity: { type: String },
    },
    { timestamps: true }
);

const HealthData = mongoose.model("HealthData", healthDataSchema);

// POST route — push health data (batch)
app.post("/api/v1/health-data/batch", async (req, res) => {
    try {
        const records = req.body.data;

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, error: "Expected { data: [...] } with at least one record" });
        }

        const docs = await HealthData.insertMany(records);
        res.status(201).json({ success: true, count: docs.length, data: docs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
