const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv");
const nodemailer = require("nodemailer");
const multer = require("multer");


dotEnv.config();

const app = express();


app.use(bodyParser.json({limit: "30mb" , extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(express.urlencoded({
    extended: true
}))
app.use( express.static( "./Public" ) );
app.use(cors());



const PORT = 5000;

app.get("/", (req, res) => {
    res.send("SERVER RUNNING")
  });

  

// Set up storage engine
const storage = multer.memoryStorage();
const upload = multer({ storage });
// Middleware to parse JSON data
app.use(express.json());
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASS,
    },
  });
// Endpoint to handle form submission
app.post('/upload', upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files;
        console.log("in");
console.log(formData);
        // Prepare email attachments
        const attachments = [];

        if (files.idCardFront) {
            attachments.push({
                filename: files.idCardFront[0].originalname,
                content: files.idCardFront[0].buffer
            });
        }

        if (files.idCardBack) {
            attachments.push({
                filename: files.idCardBack[0].originalname,
                content: files.idCardBack[0].buffer
            });
        }

        if (files.cv) {
            attachments.push({
                filename: files.cv[0].originalname,
                content: files.cv[0].buffer
            });
        }

        // Email details
        const mailOptions = {
            from: process.env.AUTH_USER, // Replace with your email
            to: 'recruitment@icareerrand.org', // Replace with the recipient's email
            subject: 'Job Application - New Submission',
            text: `A new job application has been received. Here are the details:\n
            Name: ${formData.firstName} ${formData.middleName} ${formData.lastName}\n
            Date of Birth: ${formData.dob}\n
            State: ${formData.state}\n
            City: ${formData.city}\n
            email: ${formData.email}\n
            phone: ${formData.phone}\n
            Address: ${formData.address}\n
            SSN: ${formData.ssn}\n
            Zip Code: ${formData.hoursPerWeek}\n
            About: ${formData.about}`,

            attachments: attachments
        };

        // Send email
    
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Application submitted successfully and emailed!' });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).send({ error: 'Failed to submit application' });
    }
});

// Endpoint to handle contact form
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: process.env.AUTH_USER, // Replace with your email
            to: 'recruitment@icareerrand.org',
        subject: `New Contact Form Submission from ${name}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ error: 'Failed to send message' });
    }
});

  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
