const express = require("express");
// const { checkEmail } = require("./emailValidator");
const { checkEmail } = require("./testing/server2");

const app = express();
const port = 3000;

app.use(express.json());

app.post("/validate-email", (req, res) => {
	const email = req.body.email;
	if (!email) {
		res.status(400).send("Email is required");
		return;
	}

	console.log(`Checking email: ${email}`);
	checkEmail(email, result => {
		if (!res.headersSent) {
			console.log(`Result for ${email}: ${result}`);
			res.send({ email, result });
		}
	});
});

app.get("/", () => {
	res.send("Hello World");
});

app.listen(port, () => {
	console.log(`Email validation server running at http://localhost:${port}`);
});
