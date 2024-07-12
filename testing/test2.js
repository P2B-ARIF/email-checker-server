const dns = require('dns');
const net = require('net');

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const isValid = regex.test(email);
    console.log(`Syntax check for ${email}: ${isValid}`);
    return isValid;
}

function domainExists(email, callback) {
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            console.log(`Domain check for ${domain}: not exists`);
            callback(false);
        } else {
            console.log(`Domain check for ${domain}: exists`);
            callback(true);
        }
    });
}

function verifyEmailSMTP(email, callback) {
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            console.log(`SMTP check for ${email}: no MX records`);
            callback(false);
            return;
        }

        const mxRecord = addresses[0].exchange;
        const client = net.createConnection(25, mxRecord);

        let sent = false;
        let step = 0;

        client.on('data', (data) => {
            if (sent) return;

            const response = data.toString();
            console.log(`SMTP response: ${response}`);

            if (response.startsWith('220') && step === 0) {
                client.write(`HELO ${domain}\r\n`);
                step++;
            } else if (response.includes('250') && step === 1) {
                client.write(`MAIL FROM:<test@example.com>\r\n`);
                step++;
            } else if (response.includes('250') && step === 2) {
                client.write(`RCPT TO:<${email}>\r\n`);
                step++;
            } else if (response.includes('250') && step === 3) {
                sent = true;
                callback(true);
                client.write('QUIT\r\n');
                client.end();
            } else {
                sent = true;
                callback(false);
                client.write('QUIT\r\n');
                client.end();
            }
        });

        client.on('error', () => {
            if (sent) return;
            console.log(`SMTP check for ${email}: error occurred`);
            sent = true;
            callback(false);
        });

        client.on('end', () => {
            if (!sent) {
                console.log(`SMTP check for ${email}: connection ended`);
                sent = true;
                callback(false);
            }
        });

        client.on('close', () => {
            if (!sent) {
                console.log(`SMTP check for ${email}: connection closed`);
                sent = true;
                callback(false);
            }
        });
    });
}

function checkEmail(email, callback) {
    if (!isValidEmail(email)) {
        callback("Invalid syntax");
        return;
    }
    domainExists(email, (exists) => {
        if (!exists) {
            callback("Domain does not exist");
            return;
        }
        verifyEmailSMTP(email, (exists) => {
            if (!exists) {
                callback("Email does not exist (SMTP check)");
            } else {
                callback("Email is valid");
            }
        });
    });
}

module.exports = { checkEmail };
