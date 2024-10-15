import { zValidator } from '@hono/zod-validator';
import { Hono } from "hono"
import { loginSchema } from '../schema';
import { z } from 'zod';


const app = new Hono()
    .post("/login",
        zValidator("json", loginSchema),
        async (c) => {
            const { email, password } = c.req.valid("json")
            console.log(email, password)
            return c.json({ succes: "ok" });
        })

export default app