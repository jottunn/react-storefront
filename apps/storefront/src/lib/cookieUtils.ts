"use client";
import Cookies from "js-cookie";

export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

export function setCookie(name: string, value: string, options?: Cookies.CookieAttributes): void {
  Cookies.set(name, value, options);
}

export function removeCookie(name: string): void {
  Cookies.remove(name);
}
