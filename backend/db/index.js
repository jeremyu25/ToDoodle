import { Pool } from "pg"

const pool = new Pool({
	connectionString: process.env.DB_URL,
	ssl: { rejectUnauthorized: false },
})

export const query = (text, params) => pool.query(text, params)
