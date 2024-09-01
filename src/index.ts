import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/customers", require("../controllers/customers.controller"));
app.use("/users", require("../controllers/users.controllers"));
app.use("/auth", require("../controllers/auth.controllers"));
