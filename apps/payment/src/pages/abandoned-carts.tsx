import Link from "next/link";
import Checkouts from "../../components/Checkouts";
import { Button } from "@saleor/macaw-ui";

const AbandonedCarts = () => {
  return (
    <>
      <div style={{ padding: "20px" }}>
        <Link href="/">
          <Button variant="secondary">Back</Button>
        </Link>
        <hr />
        <h1 style={{ paddingLeft: "20px" }}>Abandoned Carts</h1>
        <Checkouts />
      </div>
    </>
  );
};

export default AbandonedCarts;
