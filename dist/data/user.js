"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
// Our temporary "database": just a list in memory.
// NOTE: Plain-text passwords are ONLY for learning.
// In Step 2 we'll store hashed passwords in a real database.
exports.users = [
    { id: 1, name: 'Ali', email: 'ali@example.com', password: '123456' },
    { id: 2, name: 'Sara', email: 'sara@example.com', password: 'password' },
];
