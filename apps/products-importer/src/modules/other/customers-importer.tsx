import { useRef, useState } from "react";
import { useClient } from "urql";
import Papa from "papaparse";
import { useCustomerCreateMutation, UserCreateInput } from "../../../generated/graphql";

interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
  isActive: boolean;
  isConfirmed: boolean;
  addresses: any;
  languageCode: string;
  metadata: any;
  // Add more fields as required
}

export const CustomersImporterView = () => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [importedCustomers, setImportedCustomers] = useState<any[]>([]);
  const [mutationCustomerCreate, customerCreate] = useCustomerCreateMutation();

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
          await importCustomers(chunk);
        }
      }
    } catch (error: any) {
      handleErrors(error.message);
    }
  };

  const parseCSV = (file: File): Promise<Customer[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = ({ target }) => {
        Papa.parse(target?.result as string, {
          header: true,
          complete: (result: { data: Customer[] }) => {
            resolve(result.data as Customer[]);
          },
          error: (error: any) => {
            reject(error);
          },
        });
      };
      reader.readAsText(file);
    });
  };

  const filterEmptyRows = (data: Customer[]): Customer[] => {
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
    setImportedCustomers([]);
  };

  const importCustomers = async (parsedCSV: any[]) => {
    const customersDone = [];
    try {
      for (const row of parsedCSV) {
        const nume = row["nume"] && row["nume"].trim();
        const nameSplitted = nume.split(" ");
        const email = row["email"].trim();
        const data_nasterii = row["data_nasterii"].trim();
        const data_cont = row["data_cont"].trim();
        const adresa = row["adresa"].trim();
        const oras = row["oras"].trim();
        const judet = row["judet"].trim();
        let cod_postal = row["cod_postal"].trim();
        if (cod_postal.length === 5) {
          cod_postal = "0" + cod_postal;
        }
        const telefon = row["telefon"].trim();

        const privateMeta = [
          {
            key: "data-cont",
            value: data_cont,
          },
        ];

        if (data_nasterii) {
          privateMeta.push({
            key: "data-nasterii",
            value: data_nasterii,
          });
        }

        const customerInput = {
          firstName: nameSplitted[1] || "",
          lastName: nameSplitted[0] || "",
          email: email,
          isActive: true,
          isConfirmed: true,
          languageCode: "RO",
          channel: "default-channel",
          privateMetadata: privateMeta,
          defaultShippingAddress: {
            firstName: nameSplitted[1] || "",
            lastName: nameSplitted[0] || "",
            streetAddress1: adresa,
            city: oras,
            postalCode: cod_postal,
            country: "RO",
            countryArea: judet,
            phone: telefon,
          },
        };

        try {
          const customerImport = await customerCreate({
            input: customerInput as UserCreateInput,
          });
          if (customerImport.data?.customerCreate?.errors.length) {
            handleErrors(
              "Error for " +
                email +
                ": " +
                customerImport.data?.customerCreate?.errors[0].field +
                " - " +
                customerImport.data?.customerCreate?.errors[0].message
            );
          } else {
            customersDone.push(nume + " - " + email);
          }
        } catch (error) {
          console.log("Error saving customer: " + email + (error as any).message);
        }
      }

      setImportedCustomers(customersDone);
    } catch (error: any) {
      handleErrors(error.message);
    }
  };

  return (
    <div>
      <div className="upload-wrapper">
        <h4 className="page-header mb-4">Customers import Upload .csv file</h4>
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

      {importedCustomers.length > 0 && (
        <div>
          <h3>Imported Customers:</h3>
          <ul>
            {importedCustomers.map((customer, index) => (
              <li key={index}>{customer}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomersImporterView;
