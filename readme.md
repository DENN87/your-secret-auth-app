# _A Simple Website to keep secrets_

> The main focus of this project was to learn PassportJS an authentication middleware for Node.js and to implement Facebook, Google and Twitter strategies for Sign In & Sign Up. In this project i'm using EJS - a templating library to generate HTML markup with plain Javascript. For database i'm using mongoDB locally. UI built with Bootstrap.

## Installation

Step 1. In the project directory, you can run:

```sh
npm install
```

Step 2. Install MongoDB Community Edition from MongoDB website if you don't have it installed already.

Step 3. IMPORTANT Create .env file:

> You must Create a New File in the project directory ".env" and save your credentials for Google API, Facebook API and Twitter API. The LogIn/Register with username & password works with mongoDB locally as well, so you don't have to have these credentials if you don't want to use the social media SIGN IN WITH "Social Media" Buttons.
>
> In this file include the following lines:

```sh
DB_SECRET=ANY_SECRET_WORDS
SESSION_SECRET=ANY_SECRET_WORDS
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
```

## Usage

You must run MongoDB first in Terminal first with the command:

```
mongod
```

Run the app.js with the command:

```
nodemon app.js
```

Verify the deployment by navigating to your server address in
your preferred browser.

```sh
http://127.0.0.1:3000
```

The page will reload if you make edits.<br>
You will also see any lint errors in the console.
