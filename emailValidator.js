const dns = require("dns");
const net = require("net");

function isValidEmail(email) {
	const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
	return regex.test(email);
}

function inferNameAndRole(email) {
	const prefix = email.split("@")[0];
	const parts = prefix.split(".");
	let name = parts[0];
	let role = "user";

	if (
		prefix.startsWith("admin") ||
		prefix.startsWith("info") ||
		prefix.startsWith("support")
	) {
		role = "admin";
	}

	return { name, role };
}

function isDisposableEmail(email) {
	const disposableDomains = [
		"0-mail.com",
		"0815.ru",
		"0clickemail.com",
		"10minutemail.com",
		"20minutemail.com",
		"2prong.com",
		"zzz.com",
	];
	const domain = email.split("@")[1];
	return disposableDomains.includes(domain);
}

function domainExists(email, callback) {
	const domain = email.split("@")[1];
	dns.resolveMx(domain, (err, addresses) => {
		if (err || addresses.length === 0) {
			callback(false, null);
		} else {
			const mxServer = addresses[0].exchange;
			callback(true, mxServer);
		}
	});
}

function verifyEmailSMTP(email, callback) {
	const domain = email.split("@")[1];
	dns.resolveMx(domain, (err, addresses) => {
		if (err || addresses.length === 0) {
			callback(false);
			return;
		}

		const mxRecord = addresses[0].exchange;
		const client = net.createConnection(25, mxRecord);

		let sent = false;
		let step = 0;

		client.on("data", data => {
			if (sent) return;

			const response = data.toString();
			if (response.startsWith("220") && step === 0) {
				client.write(`HELO ${domain}\r\n`);
				step++;
			} else if (response.includes("250") && step === 1) {
				client.write(`MAIL FROM:<test@example.com>\r\n`);
				step++;
			} else if (response.includes("250") && step === 2) {
				client.write(`RCPT TO:<${email}>\r\n`);
				step++;
			} else if (response.includes("250") && step === 3) {
				sent = true;
				callback(true);
				client.write("QUIT\r\n");
				client.end();
			} else {
				sent = true;
				callback(false);
				client.write("QUIT\r\n");
				client.end();
			}
		});

		client.on("error", () => {
			if (sent) return;
			sent = true;
			callback(false);
		});

		client.on("end", () => {
			if (!sent) {
				sent = true;
				callback(false);
			}
		});

		client.on("close", () => {
			if (!sent) {
				sent = true;
				callback(false);
			}
		});
	});
}

function checkEmail(email, callback) {
	if (!isValidEmail(email)) {
		callback({
			email,
			format: false,
			disposable: null,
			domain: null,
			exists: null,
			reason: "Invalid syntax",
		});
		return;
	}

	const { name, role } = inferNameAndRole(email);
	const disposable = isDisposableEmail(email);

	domainExists(email, (exists, mxServer) => {
		if (!exists) {
			callback({
				email,
				format: true,
				disposable,
				domain: false,
				exists: false,
				reason: "Domain does not exist",
				name,
				role,
			});
			return;
		}
		verifyEmailSMTP(email, smtpExists => {
			const status = smtpExists
				? "Email is valid"
				: "Email does not exist (SMTP check)";
			callback({
				email,
				format: true,
				disposable,
				domain: true,
				exists: smtpExists,
				reason: status,
				mxServer,
				name,
				role,
			});
		});
	});
}

module.exports = { checkEmail };
