import { useRef, useState } from "react";
import { useClient } from "urql";
import Papa from "papaparse";
import { useUpdateProductVariantMutation } from "../../../generated/graphql";

interface Product {
  codstoc: string;
  stoc: number;
}

export const ProductStockImporterView = () => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const [mutationUpdateProductVariant, updateProductVariant] = useUpdateProductVariantMutation();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const client = useClient();
  const CHUNK_SIZE = 100;

  const processCSV = async (file: File) => {
    try {
      const parsedCSV = await parseCSV(file);
      if (parsedCSV) {
        const filteredCSV = filterEmptyRows(parsedCSV);
        for (let i = 0; i < filteredCSV.length; i += CHUNK_SIZE) {
          const chunk = filteredCSV.slice(i, i + CHUNK_SIZE);
          await importProductsStock(chunk);
        }
      }
    } catch (error: any) {
      handleErrors(error.message);
    }
  };

  const parseCSV = (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = ({ target }) => {
        Papa.parse(target?.result as string, {
          header: true,
          complete: (result: { data: Product[] }) => {
            resolve(result.data as Product[]);
          },
          error: (error: any) => {
            reject(error);
          },
        });
      };
      reader.readAsText(file);
    });
  };

  const filterEmptyRows = (data: Product[]): Product[] => {
    return data.filter((row) =>
      Object.values(row).some((value) => value !== undefined && value !== "")
    );
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === "text/csv") {
      await processCSV(file);
    }
  };

  const handleUpload = async () => {
    const input = inputRef.current;
    if (!input || !input.files || input.files.length === 0) {
      return;
    }
    setUploading(true);
    for (let i = 0; i < input.files.length; i++) {
      await handleFileUpload(input.files[i]);
    }
    setUploading(false);
  };

  const handleErrors = (error: string) => {
    setErrors((prevErrors) => {
      if (!prevErrors.includes(error)) {
        return [...prevErrors, error];
      }
      return prevErrors;
    });
  };

  const resetSelectedFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setErrors([]);
    setImportedProducts([]);
  };

  const importProductsStock = async (parsedCSV: any[]) => {
    const prodDone = [];
    try {
      for (const row of parsedCSV) {
        const sku = row["Cod stoc"];
        const stoc = row["stoc"] && parseInt(row["stoc"].trim());
        const productInput = {
          sku: sku,
          quantityLimitPerCustomer: stoc,
        };

        try {
          const productsImport = await updateProductVariant({
            sku: sku,
            input: productInput,
          });
          if (productsImport.data?.productVariantUpdate?.errors.length) {
            handleErrors(
              "Error for " +
                sku +
                ": " +
                productsImport.data?.productVariantUpdate?.errors[0].message
            );
          } else {
            prodDone.push(sku);
          }
        } catch (error) {
          console.log("Error saving sku: " + sku + (error as any).message);
        }
      }

      setImportedProducts(prodDone);
    } catch (error: any) {
      handleErrors(error.message);
    }
  };

  return (
    <div>
      <div className="upload-wrapper">
        <h4 className="page-header mb-4">Product Variant Qlimit import Upload .csv file</h4>
        <div className="upload-wrapper">
          <input
            ref={inputRef}
            disabled={uploading}
            type="file"
            id="file"
            className="inputfile"
            multiple
          />
        </div>

        <button onClick={handleUpload} disabled={uploading} className="button-66">
          {uploading ? "Importing..." : "Start Import"}
        </button>

        <button onClick={resetSelectedFiles} disabled={uploading} className="reset-button">
          Reset
        </button>

        {uploading && (
          <p className="block w-full text-md">Uploading in progress, please wait....</p>
        )}
      </div>

      {errors.length > 0 && (
        <div>
          <h3>Error(s) occurred:</h3>
          <ul>
            {errors.map((error, index) => (
              <li className="error" key={index}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {importedProducts.length > 0 && (
        <div>
          <h3>Imported Prods:</h3>
          <ul>
            {importedProducts.map((prod, index) => (
              <li key={index}>{prod}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductStockImporterView;
