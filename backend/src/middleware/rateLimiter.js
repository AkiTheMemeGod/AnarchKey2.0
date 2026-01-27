import rateLimit from 'express-rate-limit';

export const sdkRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
        // Use the project ID/API Key (access_token) for rate limiting if available
        // Placeholder for now as per request
        return req.body.access_token || "PLACEHOLDER_KEY";
    },
    message: {
        status: 429,
        error: "Too many requests, please try again later."
    }
});
