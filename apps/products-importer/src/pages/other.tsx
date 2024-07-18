import { NextPage } from "next";
import React, { ComponentProps } from "react";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import CustomersImporterView from "../modules/other/customers-importer";

const OtherPage: NextPage = (props) => {
  return <div className="container">{<CustomersImporterView {...props} />}</div>;
};

const WrappedPage = (props: ComponentProps<NextPage>) => (
  <GraphQLProvider>
    <OtherPage {...props} />
  </GraphQLProvider>
);

export default WrappedPage;
