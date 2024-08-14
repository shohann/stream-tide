import { Request, Response, NextFunction } from "express";
import logger from "../../libraries/log/logger";

// Middleware to log the request.
// Logic: by default it will log req.params and req.query if they exist.
// For the req.body, if no specific fields are provided in the fields, it will log the entire body.
interface LogRequestOptions {
  fields?: string[];
}

export const logRequest = ({ fields = [] }: LogRequestOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const logData: Record<string, any> = {};

    if (req.params) {
      logData.params = req.params;
    }
    if (req.query) {
      logData.query = req.query;
    }
    if (req.body) {
      if (fields.length) {
        fields.forEach((field) => {
          if (req.body[field]) {
            logData[field] = req.body[field];
          }
        });
      } else {
        logData.body = req.body;
      }
    }

    logger.info(`${req.method} ${req.originalUrl}`, logData);

    // Store the original end method
    const oldEnd = res.end.bind(res);
    // Override the end method
    res.end = function (...args: any[]): Response<any, Record<string, any>> {
      // Log the status code after the original end method is called
      logger.info(`${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
      });
      return oldEnd(...args);
    };

    next();
  };
};
