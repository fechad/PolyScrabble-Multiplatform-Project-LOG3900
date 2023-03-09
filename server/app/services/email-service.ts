import nodemailer, { Transporter } from 'nodemailer';
import { Service } from 'typedi';

@Service()
export class EmailService {
    transporter: Transporter;
    projectEmail: string;
    constructor() {
        this.projectEmail = 'polyscrabble105@gmail.com';
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.projectEmail,
                pass: 'vxwiryjgkglwcdhv',
            },
        });
    }

    sendNewPasswordEmailToUser(email: string, temporaryPassword: string) {
        const mailOptions = {
            from: this.projectEmail,
            to: email,
            subject: 'PolyScrable-105 nouveau mot de passe temporaire',
            text: `Vous avez récement réinitialisé votre mot de passe. Voici le nouveau mot de passe temporaire: ${temporaryPassword}`,
        };

        // console.log(this.transporter.options)

        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        this.transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                // eslint-disable-next-line no-console
                console.log(error);
            } else {
                // eslint-disable-next-line no-console
                console.log('Email sent: ' + info.response);
            }
        });
    }
}
