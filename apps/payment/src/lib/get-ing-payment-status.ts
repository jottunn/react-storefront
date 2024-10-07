import axios from "axios";
import { TransactionEventTypeEnum } from "../../generated/graphql";

interface INGWebPayStatusResponse {
  ErrorCode: string;
  ErrorMessage: string;
  OrderStatus: string;
}

async function getINGWebPayPaymentStatus(orderId: string): Promise<{
  errorCode: string;
  errorMessage: string;
  result: string;
  message?: string;
} | null> {
  const apiUrl =
    process.env.NEXT_PUBLIC_ENV === "test"
      ? process.env.ING_WEBPAY_API_URL_ORDER_STATUS_TEST
      : process.env.ING_WEBPAY_API_URL_ORDER_STATUS_PROD;
  const username =
    process.env.NEXT_PUBLIC_ENV === "test"
      ? process.env.ING_WEBPAY_USERNAME_TEST
      : process.env.ING_WEBPAY_USERNAME_PROD;
  const password =
    process.env.NEXT_PUBLIC_ENV === "test"
      ? process.env.ING_WEBPAY_PASSWORD_TEST
      : process.env.ING_WEBPAY_PASSWORD_PROD;

  if (!apiUrl) {
    return {
      errorCode: "",
      errorMessage: "",
      result: "AUTHORIZATION_FAILURE",
      message: "No url",
    };
  }
  try {
    const sendData = {
      userName: username || "",
      password: password || "",
      orderId: orderId,
      language: "ro",
    };
    const urlEncodedData = new URLSearchParams(sendData).toString();
    const response = await axios.post<INGWebPayStatusResponse>(apiUrl, urlEncodedData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Log the response from ING WebPay
    console.log("ING WebPay Payment Status Response:", response.data);

    // Check if the response contains an error
    if (!response.data || response.status !== 200) {
      console.error("Error retrieving payment status:", response);
      return {
        errorCode: "",
        errorMessage: "",
        result: "AUTHORIZATION_FAILURE",
        message: "Error calling ING WebPay API to get Payment Status Response",
      };
    }

    switch (response.data.OrderStatus) {
      case "0":
        // Pre-authorization state; further action required (e.g., capture)
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "AUTHORIZATION_ACTION_REQUIRED",
          message: "Comanda inregistrata, dar neplatita",
        };
      case "1":
        // Pre-authorization state; further action required (e.g., capture)
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "AUTHORIZATION_SUCCESS",
          message: "Plata preautorizata",
        };

      case "2":
        // Payment fully captured and successful
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "CHARGE_SUCCESS",
          message: "Tranzactie autorizata",
        };

      case "3":
        // Payment was declined
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "CANCEL_SUCCESS",
          message: "Tranzactie anulata",
        };

      case "4":
        // Payment was reversed (refund or cancel)
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "REFUND_SUCCESS",
          message: "Tranzactie reversata",
        };

      case "6":
        // Payment was reversed (refund or cancel)
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "CHARGE_FAILURE",
          message: "Tranzactie respinsa",
        };
      default:
        // Unhandled status
        return {
          errorCode: response.data.ErrorCode || "",
          errorMessage: response.data.ErrorMessage || "",
          result: "AUTHORIZATION_FAILURE",
          message: "Unknown payment status: " + response.data.OrderStatus,
        };
    }
  } catch (error) {
    console.error("Error calling ING WebPay API:", error);
    return {
      errorCode: "",
      errorMessage: "",
      result: "AUTHORIZATION_FAILURE",
      message: "Error calling ING WebPay API to get Payment Status Response",
    };
  }
}

export default getINGWebPayPaymentStatus;
