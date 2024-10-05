import { CombinedError, gql, useClient } from "urql";
import { useEffect, useState } from "react";
import { LatestCartsQuery } from "../generated/graphql";
const LATEST_CARTS_QUERY = gql`
  query LatestCarts {
    checkouts(first: 20, sortBy: { direction: DESC, field: CREATION_DATE }) {
      edges {
        node {
          id
          chargeStatus
          created
          user {
            firstName
            lastName
          }
          lines {
            variant {
              product {
                name
                thumbnail {
                  url
                }
              }
            }
          }
          totalPrice {
            gross {
              amount
            }
          }
          transactions {
            id
            pspReference
            events {
              type
              message
            }
          }
        }
      }
    }
  }
`;

function Checkouts() {
  const client = useClient();
  const [data, setData] = useState<LatestCartsQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CombinedError | null>(null);

  useEffect(() => {
    // Manually execute the query
    client
      .query(LATEST_CARTS_QUERY, {})
      .toPromise()
      .then((result) => {
        setLoading(false);
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
      });
  }, [client]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as { message: string }).message}</p>;

  if (!data || !data.checkouts || !data.checkouts.edges.length) {
    return <p>No carts found</p>;
  }

  const latestCarts = data.checkouts.edges;

  return (
    <div className="container mx-auto p-4">
      <ul role="list" className="space-y-6 container-grid">
        {latestCarts.map(
          ({ node: { id, created, chargeStatus, user, lines, totalPrice, transactions } }, i) => (
            <li
              key={`id${i}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg"
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              {/* Checkout Details */}
              <div
                className="checkout-card"
                style={{
                  display: "block",
                  gap: "20px",
                }}
              >
                {/* User Information */}
                <div>
                  <input type="hidden" value={id} id="checkoutId" />
                  <p>{created}</p>
                  <p style={{ marginTop: "10px" }}>
                    <strong>User:</strong> {user?.firstName || "Anonymous"} {user?.lastName || ""}
                  </p>
                  <p>
                    <strong>Total Price:</strong> ${totalPrice.gross.amount}
                  </p>
                </div>

                {/* Products in Checkout */}
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Products:</h3>
                  <ul
                    className="product-list"
                    style={{ listStyleType: "none", padding: 0, marginTop: "10px" }}
                  >
                    {lines.map(({ variant }) => (
                      <li
                        key={variant.product.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <img
                          src={variant?.product?.thumbnail?.url}
                          alt={variant.product.name}
                          style={{
                            width: "40px", // smaller image size
                            height: "40px",
                            borderRadius: "5px",
                            marginRight: "10px",
                          }}
                        />
                        <p style={{ margin: 0 }}>{variant.product.name}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Transaction Information */}
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>Transactions:</h3>
                  <ul
                    className="transaction-list"
                    style={{ listStyleType: "none", padding: 0, marginTop: "10px" }}
                  >
                    {transactions?.map((transaction) => (
                      <li key={transaction.id} style={{ marginBottom: "10px" }}>
                        <p style={{ marginBottom: "5px" }}>
                          <strong>PSP Reference:</strong> {transaction.pspReference}
                        </p>
                        <ul>
                          {transaction.events.map((event, index) => (
                            <li key={index} style={{ fontSize: "0.9rem", color: "#666" }}>
                              <strong>Event Type:</strong> {event.type} <br />
                              <strong>Message:</strong> {event.message}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Checkouts;
