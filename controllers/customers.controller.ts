import express, { Request, Response } from "express";
import pool from "../src/db";
const router = express.Router();

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

router.get("/", async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM customers");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

//get by id
router.get("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM customers WHERE id = ${id}`
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
