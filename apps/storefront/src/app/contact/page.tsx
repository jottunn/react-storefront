import React from "react";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { LanguageCodeEnum, PageTypesDocument, PageTypesQuery } from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import Breadcrumbs from "@/components/Breadcrumbs";
import Script from "next/script";
export const metadata = {
  title: `Contact | ${STOREFRONT_NAME}`,
  description: "Contact Surmont.ro",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/contact` : undefined,
  },
};

export default async function Page() {
  let contactContentResponse;
  try {
    contactContentResponse = await executeGraphQL<
      PageTypesQuery,
      { filter: any; locale: LanguageCodeEnum }
    >(PageTypesDocument, {
      variables: { filter: { slugs: ["get-in-touch"] }, locale: DEFAULT_LOCALE },
      revalidate: 60 * 60,
      withAuth: false,
    });
  } catch (error) {
    console.error("Error fetching contact page:", error);
    return null;
  }

  const contactContent = contactContentResponse?.pages?.edges[0];
  if (!contactContent) {
    return null;
  }

  const contactFb = contactContent?.node?.metadata.find((m) => m.key === "facebook");
  const contactInsta = contactContent?.node?.metadata.find((m) => m.key === "instagram");
  const contactTel = contactContent?.node?.metadata.find((m) => m.key === "telefon");
  const contactEmail = contactContent?.node?.metadata.find((m) => m.key === "email");
  const contactAdresa = contactContent?.node?.metadata.find((m) => m.key === "adresa");
  const [contactAdresaLine1, contactAdresaLine2] = contactAdresa?.value
    .trim()
    .split(/\s*\/\/\s*/) || ["", ""];
  const contactProgram = contactContent?.node?.metadata.find((m) => m.key === "program");
  const [contactProgramLine1, contactProgramLine2] = contactProgram?.value
    .trim()
    .split(/\s*\/\/\s*/) || ["", ""];

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: contactContent?.node.title || "Contact" },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href ? `${STOREFRONT_URL}${item.href}` : undefined,
    })),
  };
  return (
    <>
      <Script
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="bg-main-7 border-b">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="bg-gray-50/50">
        <div className="md:container pt-12 pb-40 px-8">
          <div className="md:max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold pb-6">{contactContent?.node.title || "Contact"}</h1>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Contact Info Section */}
                <div className="p-8 sm:p-10 bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="mb-8">
                    <h2 className="text-4xl font-semibold text-gray-800 mb-6">{STOREFRONT_NAME}</h2>
                    <div className="space-y-4">
                      {contactAdresa && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-base font-medium text-gray-700">
                              {contactAdresaLine1}
                            </p>
                            {contactAdresaLine2 && (
                              <p className="text-base text-gray-600">{contactAdresaLine2}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {contactTel && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="h-6 w-6 text-green-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                              ></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-base font-medium text-gray-700">
                              {contactTel.value}
                            </p>
                          </div>
                        </div>
                      )}
                      {contactEmail && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-base font-medium text-gray-700">
                              {contactEmail.value}
                            </p>
                          </div>
                        </div>
                      )}
                      {contactProgram && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            {contactProgramLine1 && (
                              <p className="text-base font-medium text-gray-700">
                                {contactProgramLine1}
                              </p>
                            )}
                            {contactProgramLine2 && (
                              <p className="text-base text-gray-600">{contactProgramLine2}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex space-x-4">
                      <a
                        href={contactFb?.value || "#"}
                        className="text-gray-500 hover:text-green-600"
                        target="_blank"
                        rel="noreferrer"
                        title="Facebook"
                      >
                        <span className="sr-only">Facebook</span>
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                      <a
                        href={contactInsta?.value || "#"}
                        className="text-gray-500 hover:text-green-600"
                        target="_blank"
                        rel="noreferrer"
                        title="Instagram"
                      >
                        <span className="sr-only">Instagram</span>
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                {/* Map Section */}
                <div className="h-96 md:h-auto bg-gray-100 relative">
                  {/* Loading placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="animate-pulse flex flex-col items-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="mt-2 text-gray-500">Loading map...</span>
                    </div>
                  </div>

                  {/* Lazy-loaded iframe */}
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.796238177982!2d26.09426151534455!3d44.4373417791023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4420f18839%3A0x90c7f45c899b844!2sBoarder's!5e0!3m2!1sen!2sro!4v1536927448356"
                    allowFullScreen
                    aria-hidden="false"
                    tabIndex={0}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
