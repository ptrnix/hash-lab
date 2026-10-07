import {Router} from "express";
import {createHash, randomBytes} from "crypto";
import {performance} from "perf_hooks";
import bcrypt from "bcryptjs";
import {isValidObjectId} from "mongoose";
import Hash from "../models/Hash";

const router = Router();
const ALGORITHMS = ["md5", "sha1", "sha256", "sha512", "bcrypt"];

// Each +1 doubles the work, which is what makes bcrypt slow on purpose
const BCRYPT_COST = 12;

router.get("/", async (_req, res) => {
    const hashes = await Hash.find().sort({createdAt: -1});
    res.json(hashes);
});

router.post("/", async (req, res) => {
    const {text, algorithm, useSalt} = req.body;

    if (typeof text !== "string" || text.length === 0 || text.length > 1000) {
        return res.status(400).json({error: "text must be 1-1000 characters"});
    }
    if (!ALGORITHMS.includes(algorithm)) {
        return res.status(400).json({error: "unsupported algorithm"});
    }

    const start = performance.now();
    let digest: string;
    let salt: string | undefined;

    if (algorithm === "bcrypt") {
        // bcrypt generates its own salt and embeds it in the result
        digest = await bcrypt.hash(text, BCRYPT_COST);
    } else {
        if (useSalt) {
            salt = randomBytes(16).toString("hex");
        }
        digest = createHash(algorithm).update((salt ?? "") + text).digest("hex");
    }
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    const entry = await Hash.create({algorithm, digest, salt, durationMs, inputLength: text.length});
    res.status(201).json(entry);
});

router.delete("/:id", async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({error: "invalid id"});
    }
    await Hash.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

export default router;
