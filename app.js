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

/* Create userSchema */
const userSchema = {
	email: String,
	password: String,
};
/*  use userSchema to setup a mongoose model */
const User = new mongoose.model("User", userSchema);

/* Routes here */
app.get("/", (req, res) => {
	res.render("home");
});
app.get("/login", (req, res) => {
	res.render("login");
});
app.route("/register")
	.get((req, res) => {
		res.render("register");
	})
	.post((req, res) => {
		console.log(req.body.username, req.body.password);
		/* Creating the newUser with the mongoose schema */
		const newUser = new User({
			/* saving the fields we are getting from POST action of the form in EJS file */
			email: req.body.username, // username is the NAME field from EJS file of the coresping input
			password: req.body.password, // password is the NAME field from EJS file of the coresping input
		});
		/* Saving the newUser created above to the mongoDB */
		newUser.save((err) => {
			if (err) {
				console.log(err);
			} else {
				/* Rendering the secrets EJS file only if the user is created and logged in */
				res.render("secrets");
			}
		});
	});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server started on 3000.");
});
