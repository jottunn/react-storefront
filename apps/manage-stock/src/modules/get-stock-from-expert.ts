export async function getStockFromExpert(articolCod: string) {
  const url = process.env.NEXT_PUBLIC_ERP_EXPERT_GET_STOC_API_URL;
  const secretKey = process.env.NEXT_PUBLIC_ERP_EXPERT_SECRET_KEY;

  try {
    const response = await fetch(`${url}?ArticolCod=${articolCod}&secretkey=${secretKey}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching stock: ${response.statusText}`);
    }

    const data = await response.json();
    return data.Cantitate !== undefined ? data.Cantitate : null;
  } catch (error) {
    console.error("Error fetching stock from Expert:", error);
    return null;
  }
}
