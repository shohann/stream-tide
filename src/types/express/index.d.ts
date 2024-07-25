declare namespace Express {
  export interface Request {
    user: {
      id: number;
      role: string;
    };
  }
}
