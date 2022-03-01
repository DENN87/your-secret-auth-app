require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

/* Mongoose connnection */
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

/* Create userSchema accorind to mongoose Schema() */
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});

/*  use userSchema to setup a mongoose model */
const User = new mongoose.model("User", userSchema);

/* Routes here */
app.get("/", (req, res) => {
	res.render("home");
});
app.route("/login")
	.get((req, res) => {
		res.render("login");
	})
	.post((req, res) => {
		const userName = req.body.username;
		const userPass = req.body.password;
	});
app.route("/register")
	.get((req, res) => {
		res.render("register");
	})
	.post((req, res) => {
		res.render("secrets");
	});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server started on 3000.");
});
