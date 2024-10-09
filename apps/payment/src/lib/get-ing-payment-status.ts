import axios from "axios";
import { TransactionEventTypeEnum } from "../../generated/graphql";

interface INGWebPayStatusResponse {
  errorCode: string;
  errorMessage: string;
  orderStatus: string;
  orderNumber: string;
  actionCode: string;
  actionCodeDescription: string;
}

async function getINGWebPayPaymentStatus(orderId: string): Promise<{
  errorCode: string;
  errorMessage: string;
  orderNumber?: string;
  actionCode?: string;
  actionCodeDescription?: string;
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
      errorCode: "1",
      errorMessage: "No ING API URL",
      result: "AUTHORIZATION_FAILURE",
      message: "No ING API URL",
    };
  }
  if (!username || !password) {
    return {
      errorCode: "1",
      errorMessage: "No ING API credentials",
      result: "AUTHORIZATION_FAILURE",
      message: "No ING API credentials",
    };
  }

  try {
    const sendData = {
      userName: username,
      password: password,
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
        errorCode: "1",
        errorMessage: "Error calling ING WebPay API",
        result: "AUTHORIZATION_FAILURE",
        message: "Error calling ING WebPay API to get Payment Status Response",
      };
    }

    switch (response.data.orderStatus) {
      case "0":
        // Pre-authorization state; further action required (e.g., capture)
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "AUTHORIZATION_ACTION_REQUIRED",
          message: "Comanda inregistrata, dar neplatita",
        };
      case "1":
        // Pre-authorization state; further action required (e.g., capture)
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "AUTHORIZATION_SUCCESS",
          message: "Plata preautorizata",
        };

      case "2":
        // Payment fully captured and successful
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "CHARGE_SUCCESS",
          message: "Tranzactie autorizata",
        };

      case "3":
        // Payment was declined
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "CANCEL_SUCCESS",
          message: "Tranzactie anulata",
        };

      case "4":
        // Payment was reversed (refund or cancel)
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "REFUND_SUCCESS",
          message: "Tranzactie reversata",
        };

      case "6":
        // Payment was reversed (refund or cancel)
        return {
          errorCode: response.data.errorCode || "",
          errorMessage: response.data.errorMessage || "",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "CHARGE_FAILURE",
          message: "Tranzactie respinsa",
        };
      default:
        // Unhandled status
        return {
          errorCode: response.data.errorCode || "1",
          errorMessage: response.data.errorMessage || "Unknown payment status",
          orderNumber: response.data.orderNumber || "",
          actionCode: response.data.actionCode || "",
          actionCodeDescription: response.data.actionCodeDescription || "",
          result: "AUTHORIZATION_FAILURE",
          message: "Unknown payment status: " + response.data.orderStatus,
        };
    }
  } catch (error) {
    console.error("Error calling ING WebPay API:", error);
    return {
      errorCode: "1",
      errorMessage: "Error calling ING WebPay API",
      result: "AUTHORIZATION_FAILURE",
      orderNumber: "",
      actionCode: "",
      actionCodeDescription: "",
      message: "Error calling ING WebPay API to get Payment Status Response",
    };
  }
}

export default getINGWebPayPaymentStatus;
