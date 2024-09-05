import express, { Request, Response } from "express";
import pool from "../src/db";
const router = express.Router();

import { RowDataPacket } from "mysql2";

{
    /* 
    CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255),
    phoneNumber VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(10),
    dateOfBirth DATE
);
    */
}

interface CustomRequest extends Request {
    user?: any;
    email?: any;
    phoneNumber?: any;
}

router.get("/", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM customers");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Get by ID
router.get("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE id = ?`,
            [id]
        );

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send("Customer not found");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

//add a global search (1 query can search for all fields)
router.get("/search/:keyword", async (req: Request, res: Response) => {
    const keyword = req.params.keyword;
    const searchKeyword = `%${keyword}%`;

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers 
            WHERE fullName LIKE ? 
            OR phoneNumber LIKE ? 
            OR email LIKE ?`,
            [searchKeyword, searchKeyword, searchKeyword]
        );
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.post("/", async (req: Request, res: Response) => {
    const { fullName, phoneNumber, email, gender, dateOfBirth } = req.body;
    try {
        const [emailExists] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE email = ?`,
            [email]
        );

        if (emailExists.length > 0) {
            return res.status(410).json({
                message: "Email already exists",
                duplicateField: "email",
            });
        }

        const [phoneExists] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE phoneNumber = ?`,
            [phoneNumber]
        );

        if (phoneExists.length > 0) {
            return res.status(411).json({
                message: "Phone Number already exists",
                duplicateField: "phoneNumber",
            });
        }

        await pool.query(
            `INSERT INTO customers (fullName, phoneNumber, email, gender, dateOfBirth) VALUES ('${fullName}', '${phoneNumber}', '${email}', '${gender}', '${dateOfBirth}')`,
            [fullName, phoneNumber, email, gender, dateOfBirth]
        );
        res.json("Customer added successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const { fullName, phoneNumber, email, gender, dateOfBirth } = req.body;
    try {
        const [emailExists] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE email = ? AND id != ?`,
            [email, id]
        );

        if (emailExists.length > 0) {
            return res.status(410).json({
                message: "Email already exists",
                duplicateField: "email",
            });
        }

        const [phoneExists] = await pool.query<RowDataPacket[]>(
            `SELECT * FROM customers WHERE phoneNumber = ? AND id != ?`,
            [phoneNumber, id]
        );

        if (phoneExists.length > 0) {
            return res.status(411).json({
                message: "Phone Number already exists",
                duplicateField: "phoneNumber",
            });
        }

        await pool.query(
            `UPDATE customers SET fullName = '${fullName}', phoneNumber = '${phoneNumber}', email = '${email}',
            gender = '${gender}', dateOfBirth = '${dateOfBirth}' WHERE id = ${id}`,
            [fullName, phoneNumber, email, gender, dateOfBirth, id]
        );
        res.json("Customer updated successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        await pool.query(`DELETE FROM customers WHERE id = ${id}`, [id]);
        res.json("Customer deleted successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
