import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/contacts",
      {
        email: email,
        listIds: [process.env.BREVO_LIST_ID],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      },
    );

    if (response.status === 201) {
      return NextResponse.json({ message: "Subscription successful!" });
    } else {
      return NextResponse.json(
        { message: "Subscription failed. Please try again." },
        { status: response.status },
      );
    }
  } catch (error) {
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }
}
