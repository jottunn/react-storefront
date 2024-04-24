import { NextPage } from "next";
import React, { ComponentProps } from "react";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { ProductsImporterView } from "../modules/products/products-importer/products-importer-view";

const ImporterPage: NextPage = (props) => {
  const { appBridge } = useAppBridge();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      })
    );
  };

  return <div className="container">{<ProductsImporterView {...props} />}</div>;
};

const WrappedPage = (props: ComponentProps<NextPage>) => (
  <GraphQLProvider>
    <ImporterPage {...props} />
  </GraphQLProvider>
);

export default WrappedPage;
