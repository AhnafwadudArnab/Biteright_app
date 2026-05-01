import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
