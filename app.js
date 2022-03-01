require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

/* Initialize express-session with some configuration for login*/
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

/* Initialize passport */
app.use(passport.initialize());
app.use(passport.session());

/* Mongoose connnection */
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

/* Create userSchema accorind to mongoose Schema() */
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});

/* hash and salt passwords and save the users into mongoDB*/
userSchema.plugin(passportLocalMongoose);

/*  use userSchema to setup a mongoose model */
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser()); // encrypting user info (email & pass)
passport.deserializeUser(User.deserializeUser()); // decrypting user info (email & pass)

/* Routes here */
app.get("/", (req, res) => {
	res.render("home");
});
app.route("/login")
	.get((req, res) => {
		res.render("login");
	})
	.post((req, res) => {
		const user = new User({
			username: req.body.username,
			password: req.body.password,
		});
		req.login(user, (err) => {
			if (err) {
				console.log(err);
			} else {
				passport.authenticate("local")(req, res, () => {
					res.redirect("/secrets");
				});
			}
		});
	});

app.route("/register")
	.get((req, res) => {
		res.render("register");
	})
	.post((req, res) => {
		User.register(
			{ username: req.body.username },
			req.body.password,
			(err, registeredUser) => {
				if (err) {
					console.log(err);
					res.redirect("/register");
				} else {
					passport.authenticate("local")(req, res, () => {
						res.redirect("/secrets");
					});
				}
			}
		);
	});

app.get("/secrets", (req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("login");
	}
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server started on 3000.");
});
