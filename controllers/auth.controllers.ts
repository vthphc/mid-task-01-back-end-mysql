import express, { Request, Response, NextFunction } from "express";
import pool from "../src/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";

interface CustomRequest extends Request {
    user?: any;
}

const router = express.Router();

{
    /* 
    CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password) >= 8)
);
    */
}

const JWT_SECRET = "your_jwt_secret_key";
const JWT_SECRET_REFRESH = "your_jwt_secret_key_refresh";

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return res.status(403).json({ message: "Access Denied" });

    const token = authHeader.split(" ")[1];

    if (!token) return res.status(403).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, JWT_SECRET as string);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

router.post("/signup", async (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.query(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, hashedPassword, role]
        );

        res.json("User added successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );        

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid Username" });
        }

        const user = rows[0];

        const validPass = await bcrypt.compare(password, user.password);

        if (!validPass) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const accessToken = jwt.sign({ id: user.id }, JWT_SECRET as string, {
            expiresIn: "24m",
        });
        
        res.json({ accessToken });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.get("/profile", verifyToken, async (req: CustomRequest, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM users WHERE id = ?`,
            [req.user.id]
        );

        res.json(rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;