require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const FacebookStrategy = require("passport-facebook");
const TwitterStrategy = require("passport-twitter");

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
		maxAge: 86400000,
		cookie: {},
	})
);

/* SECURE COOKIES TRUE MADE GOOGLE SIGN IN / SIGNUP WORK */
if (app.get("env") === "production") {
	app.set("trust proxy", 1);
	session.cookie.secure = true;
}

/* Initialize passport */
app.use(passport.initialize());
app.use(passport.session());

/* Mongoose connnection */
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
// mongoose.set("useCreateIndex", true);

/* Create userSchema accorind to mongoose Schema() */
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	secret: String,
	facebookID: String,
	googleID: String,
	twitterID: String,
});

/* hash and salt passwords and save the users into mongoDB*/
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

/*  use userSchema to setup a mongoose model */
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// encrypting user info (email & pass)
passport.serializeUser(function (user, cb) {
	process.nextTick(function () {
		cb(null, { id: user.id, username: user.username });
	});
});

// decrypting user info (email & pass)
passport.deserializeUser(function (user, cb) {
	process.nextTick(function () {
		return cb(null, user);
	});
});

/* FacebookStrategy logic */
passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: "http://localhost:3000/auth/facebook/secrets",
		},
		function (accessToken, refreshToken, profile, cb) {
			User.findOrCreate(
				{ username: profile.displayName, facebookID: profile.id },
				function (err, user) {
					return cb(err, user);
				}
			);
		}
	)
);

/* GoogleStrategy logic BUG NEEDS FIX - SCOPE ERROR*/
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/google/secrets",
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		function (accessToken, refreshToken, profile, cb) {
			User.findOrCreate(
				{ username: profile.displayName, googleID: profile.id },
				function (err, user) {
					return cb(err, user);
				}
			);
		}
	)
);

/* TwitterStrategy logic */
passport.use(
	new TwitterStrategy(
		{
			consumerKey: process.env.TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
			callbackURL: "http://127.0.0.1:3000/auth/twitter/secrets",
		},
		function (token, tokenSecret, profile, cb) {
			User.findOrCreate(
				{ username: profile.displayName, twitterID: profile.id },
				function (err, user) {
					return cb(err, profile);
				}
			);
		}
	)
);

/* Register/Login Routes for Twitter */
app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
	"/auth/twitter/secrets",
	passport.authenticate("twitter", { failureRedirect: "/login" }),
	function (req, res) {
		res.redirect("/secrets");
	}
);

/* Register/Login Routes for Facebook */
app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
	"/auth/facebook/secrets",
	passport.authenticate("facebook", { failureRedirect: "/login" }),
	function (req, res) {
		res.redirect("/secrets");
	}
);

/* Register/Login Routes for Google */
app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile"] })
);

app.get(
	"/auth/google/secrets",
	passport.authenticate("google", {
		failureRedirect: "/login",
	}),
	function (req, res) {
		res.redirect("/secrets");
	}
);

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
				passport.authenticate([
					"local",
					"passport-google-oauth20",
					"passport-facebook",
					"passport-twitter",
				])(req, res, () => {
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
					passport.authenticate([
						"local",
						"passport-google-oauth20",
						"passport-facebook",
						"passport-twitter",
					])(req, res, () => {
						res.redirect("/secrets");
					});
				}
			}
		);
	});

app.route("/submit")
	.get((req, res) => {
		if (req.isAuthenticated()) {
			res.render("submit");
		} else {
			res.redirect("login");
		}
	})
	.post((req, res) => {
		const submittedSecret = req.body.secret;
		let valid = mongoose.isValidObjectId(req.user.id);
		// check if user ID is an valid ObjectID TRUE OR FALSE
		console.log(`Mongoose Valid: ${valid}`);
		if (valid) {
			// it's an ObjectID
			User.findById(req.user.id, (err, foundUser) => {
				if (err) {
					console.log(err);
				} else {
					if (foundUser) {
						foundUser.secret = submittedSecret;
						foundUser.save(() => {
							// save succesful
							res.redirect("/secrets");
						});
					}
				}
			});
		} else {
			// nope, twitter id is not object and it needs a look up first
			console.log("Not ObjectID");
			User.findOne({ twitterID: req.user.id }, "_id", (err, foundUser) => {
				if (err) {
					console.log(err);
				} else {
					if (foundUser) {
						foundUser.secret = submittedSecret;
						foundUser.save(() => {
							// save succesful
							res.redirect("/secrets");
						});
					}
				}
			});
		}
	});

app.get("/secrets", (req, res) => {
	User.find({ secret: { $ne: null } }, (err, foundUsers) => {
		if (err) {
			console.log(err);
		} else {
			if (foundUsers) {
				res.render("secrets", { usersWithSecrets: foundUsers });
			}
		}
	});
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server started on 3000.");
});
