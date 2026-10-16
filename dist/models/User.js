"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// 2. The schema: rules MongoDB should follow when saving a user
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true, // can't save a user without a name
        trim: true, // removes extra spaces: "  Ali  " → "Ali"
    },
    email: {
        type: String,
        required: true,
        unique: true, // no two users can have the same email
        lowercase: true, // "Ali@Example.com" → "ali@example.com"
        trim: true,
    },
    password: {
        type: String,
        required: true, // this will store the HASHED password, never the real one
    },
}, {
    timestamps: true, // automatically adds createdAt and updatedAt fields
});
// 3. The model: the object we use to read and write users in the database
exports.User = (0, mongoose_1.model)('User', userSchema);
