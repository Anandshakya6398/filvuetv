const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();
const fs = require("fs");


async function updateTemplateHelper(templatePath, toReplaceObject) {
    let templateContent = await fs.promises.readFile(templatePath, "utf-8");
    const keyArrs = Object.keys(toReplaceObject);
    keyArrs.forEach((key) => {
        templateContent = templateContent.replace(`#{${key}}`, toReplaceObject[key]);
    })
    return templateContent;
}

async function emailSender(templatePath, recieverEmail, toReplaceObject) {
    try {
        const content = await updateTemplateHelper(templatePath, toReplaceObject);
        // thorugh which service you have to send the mail 
        const sendGridDetails = {
            host: process.env.EMAIL_HOSTNAME,
            port:  process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.SENDGRID_API_KEY
            }
        }
        const msg = {
            to: recieverEmail,
            from:  process.env.EMAIL_FROM, // Change to your verified sender
            subject: 'Sending First Email',
            text: "",
            html: content,
        }
        const transporter = nodemailer.createTransport(sendGridDetails);
        await transporter.sendMail(msg);
    } catch (err) {
        console.log("email not send because of the errro", err);
    }
}

module.exports = emailSender;
// demo
// const toReplaceObject = {
//     name: "anand",
//     otp: "1234"
// }

//  emailSender("./templates/otp.html", "anand@gmail.com", toReplaceObject).then(()=>{
//     console.log("Email is send");
//  })





