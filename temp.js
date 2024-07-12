const dns = require('dns');
const net = require('net');

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const isValid = regex.test(email);
    console.log(`Syntax check for ${email}: ${isValid}`);
    return isValid;
}

function inferNameAndRole(email) {
    const prefix = email.split('@')[0];
    const parts = prefix.split('.');
    let name = parts[0];
    let role = 'user';
    
    if (prefix.startsWith('admin') || prefix.startsWith('info') || prefix.startsWith('support')) {
        role = 'admin';
    }

    return { name, role };
}

function domainExists(email, callback) {
    const domain = email.split('@')[1];
    dns.resolveMx(domain, (err, addresses) => {
        if (err || addresses.length === 0) {
            console.log(`Domain check for ${domain}: not exists`);
            callback(false, null);
        } else {
            console.log(`Domain check for ${domain}: exists`);
            const mxServer = addresses[0].exchange;
            callback(true, mxServer);
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

    const { name, role } = inferNameAndRole(email);

    domainExists(email, (exists, mxServer) => {
        if (!exists) {
            callback("Domain does not exist");
            return;
        }
        verifyEmailSMTP(email, (exists) => {
            const status = exists ? "Email is valid" : "Email does not exist (SMTP check)";
            callback({ status, mxServer, name, role });
        });
    });
}

module.exports = { checkEmail };



const disposableDomains = [
    "0-mail.com",
    "0815.ru",
    "0clickemail.com",
    "10minutemail.com",
    "20minutemail.com",
    "2prong.com",
    "30minutemail.com",
    "33mail.com",
    "4warding.com",
    "4warding.net",
    "4warding.org",
    "5mail.xyz",
    "60minutemail.com",
    "6url.com",
    "9mail.cf",
    "9ox.net",
    "a-bc.net",
    "afrobacon.com",
    "agedmail.com",
    "ajaxapp.net",
    "ama-trade.de",
    "amail.com",
    "amail4.me",
    "amilegit.com",
    "amiri.net",
    "amiriindustries.com",
    "anonbox.net",
    "anonymail.dk",
    "anonymbox.com",
    "antichef.com",
    "antichef.net",
    "antispam.de",
    "antispammail.de",
    "armyspy.com",
    "art-en-ligne.pro",
    "artman-conception.com",
    "asiarap.icu",
    "azmeil.tk",
    "baxomale.ht.cx",
    "beefmilk.com",
    "binkmail.com",
    "bio-muesli.info",
    "bobmail.info",
    "bodhi.lawlita.com",
    "bofthew.com",
    "bootybay.de",
    "boun.cr",
    "bouncr.com",
    "breakthru.com",
    "brefmail.com",
    "brennendesreich.de",
    "broadbandninja.com",
    "bsnow.net",
    "bspamfree.org",
    "bugmenot.com",
    "bund.us",
    "burnmail.co",
    "burstmail.info",
    "byom.de",
    "c2.hu",
    "card.zp.ua",
    "casualdx.com",
    "centermail.com",
    "centermail.net",
    "chammy.info",
    "childsavetrust.org",
    "chogmail.com",
    "choicemail1.com",
    "clixser.com",
    "cmail.net",
    "cmail.org",
    "coldemail.info",
    "consumerriot.com",
    "cool.fr.nf",
    "correo.blogos.net",
    "cosmorph.com",
    "courriel.fr.nf",
    "courrieltemporaire.com",
    "crapmail.org",
    "crazymailing.com",
    "cubiclink.com",
    "curryworld.de",
    "cust.in",
    "cuvox.de",
    "dacoolest.com",
    "dandikmail.com",
    "dayrep.com",
    "dcemail.com",
    "deadaddress.com",
    "deadspam.com",
    "delikkt.de",
    "despam.it",
    "despammed.com",
    "devnullmail.com",
    "dfgh.net",
    "digitalsanctuary.com",
    "dingbone.com",
    "discard.cf",
    "discard.email",
    "discard.ga",
    "discard.gq",
    "discard.ml",
    "discard.tk",
    "discardmail.com",
    "discardmail.de",
    "disposableaddress.com",
    "disposableemailaddresses.com",
    "disposableemailaddress.com",
    "disposableinbox.com",
    "dispose.it",
    "dispostable.com",
    "dodgeit.com",
    "dodgit.com",
    "dodgit.org",
    "dodsi.com",
    "doiea.com",
    "donemail.ru",
    "dontreg.com",
    "dontsendmespam.de",
    "drdrb.com",
    "drdrb.net",
    "dump-email.info",
    "dumpandjunk.com",
    "dumpmail.de",
    "dumpyemail.com",
    "e-mail.com",
    "e-mail.org",
    "e4ward.com",
    "easytrashmail.com",
    "ee1.pl",
    "ee2.pl",
    "eelmail.com",
    "einmalmail.de",
    "einrot.com",
    "einrot.de",
    "eintagsmail.de",
    "email.cbes.net",
    "email60.com",
    "emaildienst.de",
    "emailgo.de",
    "emailias.com",
    "emaillime.com",
    "emailmiser.com",
    "emails.ga",
    "emailsensei.com",
    "emailtemporanea.com",
    "emailtemporanea.net",
    "emailtemporar.ro",
    "emailtemporario.com.br",
    "emailthe.net",
    "emailtmp.com",
    "emailto.de",
    "emailwarden.com",
    "emailx.at.hm",
    "emailxfer.com",
    "emeil.in",
    "emeil.ir",
    "emkei.cz",
    "eml.pp.ua",
    "emltmp.com",
    "enbtc.xyz",
    "enterto.com",
    "ephemail.net",
    "etranquil.com",
    "etranquil.net",
    "etranquil.org",
    "evopo.com",
    "explodemail.com",
    "express.net.ua",
    "fake-box.com",
    "fake-email.pp.ua",
    "fake-mail.cf",
    "fake-mail.ga",
    "fake-mail.ml",
    "fakeinbox.com",
    "fakeinformation.com",
    "fakemail.fr.nf",
    "fakemailgenerator.com",
    "fakemailz.com",
    "fammix.com",
    "fansworldwide.de",
    "fantasymail.de",
    "fightallspam.com",
    "filzmail.com",
    "fixmail.tk",
    "fizmail.com",
    "fleckens.hu",
    "flyspam.com",
    "fr33mail.info",
    "frapmail.com",
    "friendlymail.co.uk",
    "front14.org",
    "fuckingduh.com",
    "fudgerub.com",
    "fyii.de",
    "garliclife.com",
    "gehensiemirnichtaufdensack.de",
    "get1mail.com",
    "get2mail.fr",
    "getairmail.com",
    "getmails.eu",
    "getonemail.com",
    "getonemail.net",
    "ghostmail.com",
    "ghosttexter.de",
    "giantmail.de",
    "girlsundertheinfluence.com",
    "gishpuppy.com",
    "glubex.com",
    "goemailgo.com",
    "gotmail.net",
    "gotmail.org",
    "gotti.otherinbox.com",
    "great-host.in",
    "greensloth.com",
    "grr.la",
    "gsrv.co.uk",
    "guerillamail.biz",
    "guerillamail.com",
    "guerrillamail.biz",
    "guerrillamail.com",
    "guerrillamail.de",
    "guerrillamail.info",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamailblock.com",
    "gustr.com",
    "h.mintemail.com",
    "haltospam.com",
    "happygoluckyclub.com",
    "harakirimail.com",
    "hat-geld.de",
    "hatespam.org",
    "hidemail.de",
    "hidzz.com",
    "hotpop.com",
    "hulapla.de",
    "hushmail.com",
    "ieatspam.eu",
    "ieatspam.info",
    "ihateyoualot.info",
    "imails.info",
    "inbax.tk",
    "inbox.si",
    "inboxalias.com",
    "inboxclean.com",
    "inboxclean.org",
    "infocom.zp.ua",
    "instant-mail.de",
    "ipoo.org",
    "irish2me.com",
    "iwi.net",
    "jetable.com",
    "jetable.fr.nf",
    "jetable.net",
    "jetable.org",
    "jmail.co.za",
    "jourrapide.com",
    "junk1e.com",
    "kasmail.com",
    "kaspop.com",
    "keepmymail.com",
    "killmail.com",
    "killmail.net",
    "kir.ch.tc",
    "klassmaster.com",
    "klassmaster.net",
    "klzlk.com",
    "koszmail.pl",
    "kurzepost.de",
    "lawlita.com",
    "letthemeatspam.com",
    "lhsdv.com",
    "lifebyfood.com",
    "link2mail.net",
    "litedrop.com",
    "loadby.us",
    "login-email.cf",
    "login-email.ga",
    "login-email.ml",
    "login-email.tk",
    "loh.pp.ua",
    "lolfreak.net",
    "lookugly.com",
    "lortemail.dk",
    "lovemeleaveme.com",
    "lr78.com",
    "lroid.com",
    "lukop.dk",
    "m21.cc",
    "mail-filter.com",
    "mail-temporaire.fr",
    "mail.by",
    "mail.mezimages.net",
    "mail.wtf",
    "mail2rss.org",
    "mail333.com",
    "mail4trash.com",
    "mailbidon.com",
    "mailbiz.biz",
    "mailblocks.com",
    "mailbucket.org",
    "mailcat.biz",
    "mailcatch.com",
    "mailchop.com",
    "mailde.de",
    "maildrop.cc",
    "maildrop.cf",
    "maildrop.ga",
    "maildrop.gq",
    "maildrop.ml",
    "maildu.de",
    "maileater.com",
    "mailexpire.com",
    "mailfa.tk",
    "mailforspam.com",
    "mailfreeonline.com",
    "mailguard.me",
    "mailhazard.com",
    "mailhazard.us",
    "mailhz.me",
    "mailimate.com",
    "mailin8r.com",
    "mailinater.com",
    "mailinator.com",
    "mailinator.net",
    "mailinator.org",
    "mailinator.us",
    "mailincubator.com",
    "mailismagic.com",
    "mailjunk.cf",
    "mailjunk.ga",
    "mailjunk.gq",
    "mailjunk.ml",
    "mailjunk.tk",
    "mailmate.com",
    "mailme.gq",
    "mailme.ir",
    "mailme.lv",
    "mailme24.com",
    "mailmetrash.com",
    "mailmoat.com",
    "mailnator.com",
    "mailnesia.com",
    "mailnull.com",
    "mailpick.biz",
    "mailproxsy.com",
    "mailquack.com",
    "mailrock.biz",
    "mailsac.com",
    "mailscrap.com",
    "mailseal.de",
    "mailshell.com",
    "mailsiphon.com",
    "mailslapping.com",
    "mailslite.com",
    "mailtemp.info",
    "mailtemp.net",
    "mailtemporaire.com",
    "mailtemporaire.fr",
    "mailtome.de",
    "mailtothis.com",
    "mailtrash.net",
    "mailtv.net",
    "mailtv.tv",
    "mailzi.ru",
    "makemetheking.com",
    "manybrain.com",
    "mbx.cc",
    "mega.zik.dj",
    "meinspamschutz.de",
    "meltmail.com",
    "messagebeamer.de",
    "messagesafe.co",
    "messwiththebestdielikethe.rest",
    "mezimages.net",
    "mierdamail.com",
    "migmail.net",
    "migmail.pl",
    "mihep.com",
    "mintemail.com",
    "mjukglass.nu",
    "moakt.com",
    "mobi.web.id",
    "mobileninja.co.uk",
    "moburl.com",
    "mohmal.com",
    "moncourrier.fr.nf",
    "monemail.fr.nf",
    "monmail.fr.nf",
    "monumentmail.com",
    "mt2009.com",
    "mt2014.com",
    "mt2015.com",
    "mt2016.com",
    "mt2017.com",
    "mt2018.com",
    "mt2019.com",
    "mule.cf",
    "mule.ga",
    "mule.gq",
    "mule.ml",
    "mvrht.net",
    "my10minutemail.com",
    "mycleaninbox.net",
    "mymail-in.net",
    "mymailoasis.com",
    "mynetstore.de",
    "myphantomemail.com",
    "mysamp.de",
    "myspaceinc.com",
    "myspaceinc.net",
    "myspaceinc.org",
    "myspacepimpedup.com",
    "myspamless.com",
    "mytemp.email",
    "mytempmail.com",
    "mytrashmail.com",
    "nabuma.com",
    "napalm51.cf",
    "napalm51.ga",
    "napalm51.gq",
    "napalm51.ml",
    "napalm51.tk",
    "neomailbox.com",
    "nepwk.com",
    "nervmich.net",
    "nervtmich.net",
    "netmails.com",
    "netmails.net",
    "netzidiot.de",
    "neverbox.com",
    "nice-4u.com",
    "nincsmail.com",
    "nincsmail.hu",
    "nnh.com",
    "no-spam.ws",
    "noblepioneer.com",
    "nobugmail.com",
    "nobulk.com",
    "noclickemail.com",
    "nodezine.com",
    "nomail.pw",
    "nomail.xl.cx",
    "nomail2me.com",
    "nomorespamemails.com",
    "nonspammer.de",
    "nonze.ro",
    "noref.in",
    "nospam.ze.tc",
    "nospam4.us",
    "nospamfor.us",
    "nospammail.net",
    "notmailinator.com",
    "notsharingmy.info",
    "nowhere.org",
    "nowmymail.com",
    "ntlhelp.net",
    "nullbox.info",
    "nut.cc",
    "nuts2u.com",
    "nwldx.com",
    "objectmail.com",
    "obobbo.com",
    "odaymail.com",
    "omail.pro",
    "oneoffemail.com",
    "onewaymail.com",
    "onlatedotcom.info",
    "online.ms",
    "oopi.org",
    "opayq.com",
    "ordinaryamerican.net",
    "otherinbox.com",
    "ourklips.com",
    "outlawspam.com",
    "ovpn.to",
    "owlpic.com",
    "pancakemail.com",
    "paplease.com",
    "pcusers.otherinbox.com",
    "pepbot.com",
    "pjjkp.com",
    "plexolan.de",
    "poczta.onet.pl",
    "politikerclub.de",
    "poofy.org",
    "pookmail.com",
    "privacy.net",
    "privatdemail.net",
    "privy-mail.com",
    "privymail.de",
    "proxymail.eu",
    "prtnx.com",
    "psh.me",
    "putthisinyourspamdatabase.com",
    "qq.com",
    "quickinbox.com",
    "quickmail.nl",
    "rcpt.at",
    "recode.me",
    "recursor.net",
    "recyclemail.dk",
    "regbypass.com",
    "regbypass.comsafe-mail.net",
    "rejectmail.com",
    "reliable-mail.com",
    "rhyta.com",
    "riddermark.de",
    "risingsuntouch.com",
    "rk9.chickenkiller.com",
    "rklips.com",
    "rma.ec",
    "rmqkr.net",
    "royal.net",
    "rtrtr.com",
    "ruffrey.com",
    "ruru.be",
    "s0ny.net",
    "safe-mail.net",
    "safersignup.de",
    "safetymail.info",
    "safetypost.de",
    "sandelf.de",
    "saynotospams.com",
    "schafmail.de",
    "schrott-email.de",
    "secretemail.de",
    "secure-mail.biz",
    "secure-mail.cc",
    "selfdestructingmail.com",
    "sendspamhere.com",
    "senseless-entertainment.com",
    "services391.com",
    "sharedmailbox.org",
    "sharklasers.com",
    "shieldedmail.com",
    "shiftmail.com",
    "shitmail.me",
    "shitmail.org",
    "shitware.nl",
    "shoemail.com",
    "shortmail.net",
    "sibmail.com",
    "sinnlos-mail.de",
    "skeefmail.com",
    "slapsfromlastnight.com",
    "slaskpost.se",
    "slave-auctions.net",
    "slopsbox.com",
    "smashmail.de",
    "smellfear.com",
    "snakemail.com",
    "sneakemail.com",
    "sneakmail.de",
    "snkmail.com",
    "socialfurry.org",
    "sofimail.com",
    "solvemail.info",
    "soodonims.com",
    "spam-be-gone.com",
    "spam.care",
    "spam4.me",
    "spamail.de",
    "spamarrest.com",
    "spamavert.com",
    "spambob.com",
    "spambob.net",
    "spambob.org",
    "spambog.com",
    "spambog.de",
    "spambog.net",
    "spambooger.com",
    "spambox.info",
    "spambox.irishspringrealty.com",
    "spambox.me",
    "spambox.org",
    "spambox.us",
    "spamcannon.com",
    "spamcannon.net",
    "spamcero.com",
    "spamcon.org",
    "spamcorptastic.com",
    "spamcowboy.com",
    "spamcowboy.net",
    "spamcowboy.org",
    "spamday.com",
    "spamex.com",
    "spamfree.eu",
    "spamfree24.com",
    "spamfree24.de",
    "spamfree24.eu",
    "spamfree24.info",
    "spamfree24.net",
    "spamfree24.org",
    "spamgoes.in",
    "spamgourmet.com",
    "spamgourmet.net",
    "spamgourmet.org",
    "spamherelots.com",
    "spamhereplease.com",
    "spamhole.com",
    "spamify.com",
    "spaminator.de",
    "spamkill.info",
    "spaml.com",
    "spaml.de",
    "spammotel.com",
    "spamobox.com",
    "spamoff.de",
    "spamsalad.in",
    "spamslicer.com",
    "spamspot.com",
    "spamstack.net",
    "spamthis.co.uk",
    "spamthisplease.com",
    "spamtrail.com",
    "spamtroll.net",
    "speed.1s.fr",
    "spikio.com",
    "spoofmail.de",
    "squizzy.de",
    "sry.li",
    "ssoia.com",
    "stinkefinger.net",
    "stop-my-spam.cf",
    "stop-my-spam.com",
    "stop-my-spam.ga",
    "stop-my-spam.ml",
    "stuffmail.de",
    "super-auswahl.de",
    "supergreatmail.com",
    "supermailer.jp",
    "superplatyna.com",
    "superrito.com",
    "superstachel.de",
    "suremail.info",
    "talkinator.com",
    "tapchicuoihoi.com",
    "teewars.org",
    "teleosaurs.xyz",
    "teleworm.com",
    "teleworm.us",
    "temp-mail.com",
    "temp-mail.de",
    "temp-mail.org",
    "temp-mails.com",
    "temp.bartdevos.be",
    "temp.emeraldwebmail.com",
    "temp1.club",
    "temp2.club",
    "tempail.com",
    "tempalias.com",
    "tempe-mail.com",
    "tempemail.biz",
    "tempemail.co.za",
    "tempemail.com",
    "tempemail.net",
    "tempemail.org",
    "tempinbox.co.uk",
    "tempinbox.com",
    "tempmail.co",
    "tempmail.de",
    "tempmail.eu",
    "tempmail.it",
    "tempmail.pro",
    "tempmail.us",
    "tempmail2.com",
    "tempmaildemo.com",
    "tempmailer.com",
    "tempmailer.de",
    "tempmailo.com",
    "tempmails.cf",
    "tempmails.gq",
    "tempmails.tk",
    "tempomail.fr",
    "temporamail.com",
    "temporarily.de",
    "temporarioemail.com.br",
    "temporary-email.com",
    "temporary-email.world",
    "temporaryemail.net",
    "temporaryforwarding.com",
    "temporaryinbox.com",
    "temporarymailaddress.com",
    "tempthe.net",
    "tempymail.com",
    "thanksnospam.info",
    "thankyou2010.com",
    "thc.st",
    "thelimestones.com",
    "thisisnotmyrealemail.com",
    "thismail.net",
    "throwam.com",
    "throwawayemailaddress.com",
    "tilien.com",
    "tittbit.in",
    "tizi.com",
    "tmail.ws",
    "tmailinator.com",
    "toiea.com",
    "tokem.co",
    "tokenmail.de",
    "tonymanso.com",
    "toomail.biz",
    "top101.de",
    "top1mail.ru",
       "top1post.ru",
       "topmail1.net",
       "topmail2.net",
       "topmail3.net",
       "topranklist.de",
       "topsecretvn.com",
       "tormail.org",
       "totalmail.de",
       "trash-amil.com",
       "trash-mail.at",
       "trash-mail.com",
       "trash-mail.de",
       "trash-mail.ga",
       "trash-mail.ml",
       "trash-me.com",
       "trash2009.com",
       "trash2010.com",
       "trash2011.com",
       "trash2012.com",
       "trashdevil.com",
       "trashdevil.de",
       "trashemail.de",
       "trashinbox.com",
       "trashmail.at",
       "trashmail.com",
       "trashmail.de",
       "trashmail.me",
       "trashmail.net",
       "trashmail.org",
       "trashmails.com",
       "trashymail.com",
       "trashymail.net",
       "trayna.com",
       "trbvm.com",
       "trialmail.de",
       "trickmail.net",
       "trillianpro.com",
       "trumpmail.com",
       "twinmail.de",
       "twoweirdtricks.com",
       "tyldd.com",
       "u.0u.ro",
       "uorak.com",
       "us.af",
       "uwork4.us",
       "valemail.net",
       "venompen.com",
       "veryday.ch",
       "veryday.eu",
       "veryday.info",
       "veryrealemail.com",
       "vidchart.com",
       "viditag.com",
       "viewcastmedia.com",
       "viralplays.com",
       "vkcode.ru",
       "vmailpro.net",
       "voidbay.com",
       "vomoto.com",
       "vpn.st",
       "vsimcard.com",
       "vubby.com",
       "vztc.com",
       "w9y9640c.com",
       "walala.org",
       "walkmail.net",
       "walkmail.ru",
       "warau-kadoni.com",
       "wasteland.rfc822.org",
       "watch-harry-potter.com",
       "webemail.me",
       "webm4il.info",
       "webuser.in",
       "wee.my",
       "wefjo.grn.cc",
       "weg-werf-email.de",
       "wegwerf-email-addressen.de",
       "wegwerf-emails.de",
       "wegwerfadresse.de",
       "wegwerfemail.com",
       "wegwerfemail.de",
       "wegwerfmail.de",
       "wegwerfmail.info",
       "wegwerfmail.net",
       "wegwerfmail.org",
       "wegwerpmailadres.nl",
       "wenfreemail.com",
       "wh4f.org",
       "whatiaas.com",
       "whyspam.me",
       "whtjddn.33mail.com",
       "willhackforfood.biz",
       "willselfdestruct.com",
       "winemaven.info",
       "wmail.club",
       "wolfsmail.tk",
       "writeme.us",
       "wronghead.com",
       "wuzup.net",
       "wuzupmail.net",
       "www.e4ward.com",
       "www.mailinator.com",
       "wwwnew.eu",
       "xagloo.com",
       "xemaps.com",
       "xents.com",
       "xing886.uu.gl",
       "xmail.com",
       "xmaily.com",
       "xn--9kq967o.com",
       "xoxox.cc",
       "xoxy.net",
       "xy9ce.tk",
       "xyzfree.net",
       "yandex.com",
       "yanet.me",
       "yeah.net",
       "yep.it",
       "yogamaven.com",
       "yomail.info",
       "yopmail.com",
       "yopmail.fr",
       "yopmail.gq",
       "yopmail.net",
       "yopmail.pp.ua",
       "you.has.dating",
       "you.e4ward.com",
       "you.spam.flu.cc",
       "you.spam.letmein.onmypc.net",
       "youmail.ga",
       "yourdomain.com",
       "yourfreemail.info",
       "yourlms.biz",
       "youpymail.com",
       "yuurok.com",
       "z1p.biz",
       "za.com",
       "zehnminuten.de",
       "zehnminutenmail.de",
       "zetmail.com",
       "zippymail.info",
       "zoaxe.com",
       "zoemail.net",
       "zoemail.org",
       "zoemail.ru",
       "zomg.info",
       "zxcv.com",
       "zxcvbnm.com",
       "zzz.com"






];