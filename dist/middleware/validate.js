"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// A "middleware factory": you give it a schema, it gives you a middleware
// that checks req.body against that schema
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        // Turn Zod's detailed errors into a simple list the client can show
        res.status(400).json({
            message: 'Validation failed',
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join('.') || 'body',
                message: issue.message,
            })),
        });
        return;
    }
    // Replace the body with the cleaned version (e.g. trimmed name)
    req.body = result.data;
    next();
};
exports.validate = validate;
