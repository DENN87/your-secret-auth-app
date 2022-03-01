require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongooseEncryption = require("mongoose-encryption");

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

const secret = "VERY_SECRET_EXPRESSION";
userSchema.plugin(mongooseEncryption, {
	secret: secret,
	encryptedFields: ["password"],
});
// including the field encryptedFields: [] will be the only encrypted field (not the username)

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
		/* Looking for a user into MongoDB with a matching username from EJS file*/
		User.findOne({ email: userName }, (err, foundUser) => {
			if (!err) {
				if (foundUser) {
					// found a user
					if (foundUser.password === userPass) {
						// mongooseEncryption package will automatically encrypt and decrypt -
						// the password field when having some logic.
						// checking foundUser password equals to input password from EJS file.
						res.render("secrets");
					}
				}
			} else {
				console.log(err);
			}
		});
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
			email: req.body.username,
			// username is the NAME field from EJS file of the corresponding input
			password: req.body.password,
			// password is the NAME field from EJS file of the corresponding input
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
