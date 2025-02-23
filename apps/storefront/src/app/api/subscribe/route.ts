import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!audienceId) {
    return NextResponse.json({ message: "Audience ID is missing" }, { status: 500 });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY || "";
  const serverPrefix = apiKey.split("-")[1];

  if (!serverPrefix) {
    return NextResponse.json({ message: "Invalid API key." }, { status: 500 });
  }

  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
  const data = {
    email_address: email,
    status: "subscribed",
  };
  try {
    const response = await axios.post(url, data, {
      auth: {
        username: "surmont",
        password: apiKey,
      },
    });

    if (response.status === 201 || response.status === 200) {
      return NextResponse.json({ message: "Subscription successful!" });
    } else {
      return NextResponse.json(
        { message: "Subscription failed. Please try again." },
        { status: response.status },
      );
    }
  } catch (error: any) {
    // console.log(error);
    // console.log(error.code);
    console.log(error.response.data);
    if (error.response.data.title === "Member Exists") {
      return NextResponse.json({ message: "duplicate_parameter" }, { status: 200 });
    }
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }
}
