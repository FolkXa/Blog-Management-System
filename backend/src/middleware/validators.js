import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(4).max(20),
  email: z.string().email(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const postCreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1)
});

export const postUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional()
}).refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const commentSchema = z.object({
  content: z.string().min(1)
});

export function validate(schema) {
  return (req, res, next) => {
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }
    req.body = parse.data;
    next();
  };
}
