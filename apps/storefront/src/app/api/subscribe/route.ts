import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!listId) {
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/contacts",
      {
        email: email,
        listIds: [listId],
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
  } catch (error: any) {
    //console.log(error);
    // console.log(error.code);
    // console.log(error.response.data.code);
    if (error.response.data.code === "duplicate_parameter") {
      return NextResponse.json({ message: "duplicate_parameter" }, { status: 200 });
    }
    return NextResponse.json({ message: "An error occurred. Please try again." }, { status: 500 });
  }
}
