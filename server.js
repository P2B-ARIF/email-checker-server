const express = require("express");
const { checkEmail } = require("./emailValidator");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.status(200).send({ message: "Hello World" });
});

app.get("/test", async (req, res) => {
	const email = req.query.email;
	console.log({ emailIs: email });
	try {
		checkEmail(email, result => {
			if (!res.headersSent) {
				res.status(200).send({ email, result });
			}
		});
	} catch (error) {}
});

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

app.listen(port, () => {
	console.log(`Email validation server running at http://localhost:${port}`);
});
