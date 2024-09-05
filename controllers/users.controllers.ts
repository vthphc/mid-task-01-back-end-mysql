import express, { Request, Response, NextFunction } from "express";
import pool from "../src/db";
import jwt from "jsonwebtoken";

const router = express.Router();

interface CustomRequest extends Request {
    user?: any;
}

{
    /* 
    CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    isBanned BOOLEAN DEFAULT FALSE,
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

router.get("/", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
            req.params.id,
        ]);
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.put("/ban/:id", verifyToken, async (req: CustomRequest, res: Response) => {
    if (req.user.id === req.params.id) {
        return res.status(403).json({ message: "You can not ban yourself" });
    } else {
        try {
            const [rows] = await pool.query(
                "UPDATE users SET isBanned = true WHERE id = ?",
                [req.params.id]
            );
            res.json(rows);
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error");
        }
    }
});

router.put("/unban/:id", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            "UPDATE users SET isBanned = false WHERE id = ?",
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
