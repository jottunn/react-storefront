import { NextPage } from "next";
import React, { ComponentProps } from "react";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import ProductStockImporterView from "../modules/other/stock-importer";

const StockPage: NextPage = (props) => {
  return <div className="container">{<ProductStockImporterView {...props} />}</div>;
};

const WrappedPage = (props: ComponentProps<NextPage>) => (
  <GraphQLProvider>
    <StockPage {...props} />
  </GraphQLProvider>
);

export default WrappedPage;
