import {Schema, model} from "mongoose";

// Only the digest is stored, never the plaintext input
const hashSchema = new Schema(
    {
        algorithm: {type: String, required: true},
        digest: {type: String, required: true},
        // Salts are not secret, they only need to be unique per hash
        salt: {type: String},
        durationMs: {type: Number, required: true},
        inputLength: {type: Number, required: true}
    },
    {timestamps: true}
);

export default model("Hash", hashSchema);
