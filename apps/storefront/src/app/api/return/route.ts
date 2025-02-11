import axios from "axios";
import { NextResponse } from "next/server";
interface FormData {
  firstName: string;
  lastName: string;
  iban: string;
  phone: string;
  reason: string;
}

export async function POST(request: Request) {
  const { firstName, lastName, iban, phone, reason }: FormData = await request.json();

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: process.env.NOTIFICATION_EMAIL }],
        sender: { email: process.env.SENDER_EMAIL, name: "Surmont Shop" },
        subject: "Solicitare de returnare surmont.ro",
        htmlContent: `
                <h1>Solicitare de returnare:</h1>
                <p><strong>Nume:</strong> ${lastName}</p>
                <p><strong>Prenume:</strong> ${firstName}</p>
                <p><strong>IBAN:</strong> ${iban}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Motiv retur:</strong> ${reason}</p>
              `,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      },
    );

    if (response.status === 201) {
      return NextResponse.json({ status: "ok", message: "Notification email sent successfully!" });
    } else {
      return NextResponse.json(
        { message: "Failed to send notification email. Please try again." },
        { status: response.status },
      );
    }
  } catch (error: any) {
    console.log(error);
    console.log(error.code);
    console.log(error.response.data.code);
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }
}
