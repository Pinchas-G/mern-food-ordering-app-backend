import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";

const sanitizeRequestBody = (body: any): any => {
    if (typeof body === 'string') {
        return sanitizeHtml(body, {
            allowedTags: [],
            allowedAttributes: {}
        });
    }

    if (Array.isArray(body)) {
        return body.map(item => sanitizeRequestBody(item));
    }

    if (typeof body === 'object' && body !== null) {
        const sanitizedObject: any = {};
        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                sanitizedObject[key] = sanitizeRequestBody(body[key]);
            }
        }
        return sanitizedObject;
    }

    return body;
};

export const sanitizeRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizeRequestBody(req.body);
    }
    next();
};