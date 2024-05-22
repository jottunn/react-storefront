import React, { ReactElement } from "react";
import { Layout } from "@/components";
import { OrderDirection, ProductFilterInput, ProductOrderField } from "@/saleor/api";
import FilteredProductList from "@/components/productList/FilteredProductList";
import { UrlSorting } from "@/components/productList/FilteredProductList/sorting";

function NewArrivalsPage() {
  const filter: ProductFilterInput = {
    isPublished: true,
    stockAvailability: "IN_STOCK",
    isVisibleInListing: true,
  };
  const sortBy: UrlSorting = { field: "PUBLICATION_DATE", direction: "DESC" };

  return (
    <>
      <header className="mb-4 pt-4 border-b border-main-6">
        <div className="container py-8 px-8">
          <h1 className="text-4xl font-bold text-center">New Arrivals</h1>
        </div>
      </header>
      <main>
        <div className="container px-8 mt-4 mb-40">
          <FilteredProductList sort={sortBy} />
          {/* <ProductCollection filter={filter} sortBy={sortBy} perPage={30} /> */}
        </div>
      </main>
    </>
  );
}

export default NewArrivalsPage;

NewArrivalsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
