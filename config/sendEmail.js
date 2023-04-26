import nodemailer from 'nodemailer'


const emailConfirmTemplate = (token) =>
    `
        <div>
            <h3>아래 버튼을 누르시면 가입이 완료됩니다.</h3>
            <br/>
            <h3>http://localhost:3000/email/confirm?token=${token}</h3>
        </div>
    `

const passwordConfirmTemplate = (token) =>
    `
        <div>
            <h3>아래 버튼을 누르시면 가입이 완료됩니다.</h3>
            <br/>
            <h3>http://localhost:3000/password/confirm?token=${token}</h3>
        </div>
    `



const sendEmail = async (email, title, body) => {
    const transporter = await nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        to: email,
        subject: title,
        html: body
    }

    await transporter.sendMail(mailOptions)

}



export { sendEmail, emailConfirmTemplate, passwordConfirmTemplate }