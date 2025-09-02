const express = require("express");
const router = express.Router();
const { register, login, updateUser, getAllUsers, createUser, deleteUser } = require("../Controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
// router.get("/verify", verify);
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
