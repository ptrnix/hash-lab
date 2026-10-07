import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import hashRoutes from "./routes/hashes";

// Load the single .env from the project root
dotenv.config({path: path.resolve(__dirname, "../../.env")});

const app = express();
app.use(cors({origin: process.env.CLIENT_URL}));
app.use(express.json());
app.use("/api/hashes", hashRoutes);

async function main() {
    const {MONGO_USER, MONGO_PASSWORD, MONGO_PORT} = process.env;
    // encodeURIComponent makes special characters in the password safe
    const uri = `mongodb://${MONGO_USER}:${encodeURIComponent(MONGO_PASSWORD as string)}@127.0.0.1:${MONGO_PORT}/hashlab?authSource=admin`;

    await mongoose.connect(uri, {serverSelectionTimeoutMS: 5000});
    console.log("MongoDB connected");

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});