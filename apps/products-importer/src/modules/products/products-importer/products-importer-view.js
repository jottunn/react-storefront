import React, { useState, useRef, useCallback } from "react";
import Papa from "papaparse";

import {
  useAssignMediaToVariantMutation,
  useCreateProductMediaMutation,
  useCreateNewCollectionMutation,
  useCreateProductsMutation,
  useUpdateProductMutation,
  useCreateProductVariantMutation,
  useCreateBulkProductVariantMutation,
  useAssignCollectionToChannelMutation,
  useCollectionAddProductsMutation,
} from "../../../../generated/graphql";
import { useClient } from "urql";
import {
  getProductsVar,
  getCategoryID,
  getProductTypeAttributes,
  getCollections,
  getChannels,
  getProductVariantBySku,
  getPage,
  getDefaultWarehouse,
  addProductsToCollection,
} from "../../../lib/products";
import { productCache } from "./productCache";
import { productInputIdsCache } from "./productInputIdsCache";
import { createSlug, convertDescriereToEditorJS, getFileExtension } from "../../../lib/utils";

export const ProductsImporterView = () => {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [importedProds, setImportedProds] = useState([]);
  const [importedPics, setImportedPics] = useState([]);
  const inputRef = useRef();

  const [mutationResultAddProductMedia, addProductMedia] = useCreateProductMediaMutation();
  const [mutationResultAssignMediaToVariant, assignMediaToVariant] =
    useAssignMediaToVariantMutation();
  const [mutationResultCreateNewCollectionMutation, createNewCollectionMutation] =
    useCreateNewCollectionMutation();
  const [mutationResultCreateProductBulkMutation, createProductBulkMutation] =
    useCreateProductsMutation();
  const [mutationResultUpdateProduct, updateExistingProduct] = useUpdateProductMutation();
  const [mutationProductVariantBulkCreate, productVariantBulkCreate] =
    useCreateBulkProductVariantMutation();
  const [mutationAssignCollectionToChannel, assignCollectionToChannel] =
    useAssignCollectionToChannelMutation();
  const [mutationCollectionAddProductsM, collectionAddProductsM] =
    useCollectionAddProductsMutation();

  const client = useClient();

  /**
   * retrieve product details either from productCache or by querying, by product title
   * retrieves id, variants with their ids & attributes
   * **/
  const getProductDetails = async (productName) => {
    try {
      const cacheKey = productName;
      if (productCache[cacheKey]) {
        return productCache[cacheKey];
      } else {
        const productDetails = await getProductsVar(client, productName);
        if (productDetails) {
          productCache[cacheKey] = productDetails;
          return productDetails;
        }
      }
    } catch (error) {
      handleErrors("Error fetching product details: " + error.message);
      //throw new Error('Error fetching product details: ' + error.message);
    }
  };

  /**
   * get all variants Ids that have specific commercial color
   * used for media upload
   *
   * @param {*} productDetails
   * @param {*} currentVariantColor
   * @returns
   */
  const findProductVariantIds = (productDetails, currentVariantColor) => {
    const prodId = productDetails["id"];
    const prodVariants = productDetails["variants"];

    // If currentVariantColor is not an empty string, filter and map as before
    if (currentVariantColor !== "") {
      return prodVariants
        .filter((variant) =>
          variant.attributes.some(
            (item) =>
              item.attribute.name === "Culoare comerciala" &&
              item.values.some((value) => value.name === currentVariantColor)
          )
        )
        .map((variant) => variant.id);
    }

    // If currentVariantColor is an empty string, return all variant IDs
    return prodVariants.map((variant) => variant.id);
  };

  /**
   * adds media to a product and then
   * assigns that media to variant Id(s)
   * used for media upload
   *
   * @param {*} productName
   * @param {*} currentVariantColor
   * @param {*} prodId
   * @param {*} file
   */

  const handleProductMediaAssignment = async (productDetails, mediaId, currentVariantColor) => {
    try {
      const variantIds = await findProductVariantIds(productDetails, currentVariantColor);
      for (let i = 0; i < variantIds.length; i++) {
        await assignMedia(variantIds[i], mediaId);
      }
    } catch (error) {
      handleErrors("Error handling product media assignment: " + error.message);
      //throw new Error('Error handling product media assignment: ' + error.message);
    }
  };

  /**
   * mutation: assigns mediaID to variantID
   * used for media upload
   */
  const assignMedia = useCallback(async (variantId, mediaId) => {
    try {
      const result2 = await assignMediaToVariant({
        variantId: variantId,
        mediaId: mediaId,
      });
      //console.log('result2', result2);
      //media has been assigned to variant
      //clear file input
      inputRef.current.value = "";
    } catch (error) {
      // Handle errors
      handleErrors("Error assigning media to variant " + error.message);
    }
  });

  /**
   * mutation: add media to a product
   * used for media upload
   */
  const handleAddMedia = useCallback(
    async (alt, product, image) => {
      try {
        const result = await addProductMedia({
          input: {
            alt: alt,
            product: product,
            image: image,
          },
        });
        setUploading(false);
        // Handle the result here if needed
        return result.data.productMediaCreate.media.id;
      } catch (error) {
        // Handle errors
        console.error(error);
        handleErrors("Error when adding product media " + error.message);
      }
    },
    [addProductMedia, setUploading]
  );

  //main function called in case of media upload
  const handleMediaUpload = async (currentFile) => {
    let imgName = currentFile.name;
    let imageNameArr = imgName.split("_");
    let productName = imageNameArr[0];
    let currentVariantColor = "";
    //remove the extension
    const fileExtension = getFileExtension(imgName);
    if (imageNameArr.length === 1) {
      //no comercial color provided
      productName = productName.replace(fileExtension, "");
    } else {
      currentVariantColor = imageNameArr[1].replace(fileExtension, "");
    }

    currentVariantColor = currentVariantColor.replace("SLASH", "/").replace("BACKSLASH", "\\");
    productName = productName.replace("SLASH", "/").replace("BACKSLASH", "\\");
    console.log(productName);
    console.log(currentVariantColor);

    try {
      const productDetails = await getProductDetails(productName);
      if (productDetails) {
        const mediaId = await handleAddMedia(
          productName + " " + currentVariantColor,
          productDetails["id"],
          currentFile
        );
        if (mediaId) {
          handleProductMediaAssignment(productDetails, mediaId, currentVariantColor);
          setImportedPics((prevImportedPics) => [...prevImportedPics, imgName]);
        }
      } else {
        handleErrors(imgName + " Product details not found - product does not exist.");
      }
    } catch (error) {
      handleErrors(error.message);
    }
  };

  /** Product Bulk Create */
  /** Check if a variant already exists in DB */
  const checkIfProductVariantExistsInDb = async (sku) => {
    try {
      let productVariant = await getProductVariantBySku(client, sku);
      if (productVariant) {
        handleErrors("Variant " + sku + " already exists in DB - skipped, no updates applied");
        return productVariant;
      }
      return false;
    } catch (error) {
      handleErrors(error.message);
      //throw new Error('Error fetching product details: ' + error.message);
    }
  };

  /**
   * if product exists, update it + add new variants
   * @param {} productInput
   * @param {*} productVariantCreateInput
   */
  const updateProduct = async (productInput, id) => {
    try {
      //console.log('product to be updated');
      let variants = productInput["variants"];
      delete productInput.variants;
      delete productInput.name;
      delete productInput.productType;
      delete productInput.channelListings;

      const result = await updateExistingProduct({
        id: id,
        input: productInput,
      });

      const addVariants = await productVariantBulkCreate({
        product: id,
        variants: variants,
      });

      //console.log(addVariants);

      return result.data.productUpdate.product.id && addVariants;
    } catch (error) {
      handleErrors(error.message);
    }
  };

  const getPageId = async (pageSlug) => {
    productInputIdsCache["Pages"] = productInputIdsCache["Pages"] || {};
    const fetchedPageID = await getPage(client, pageSlug);
    productInputIdsCache["Pages"][pageSlug] = fetchedPageID;
    //console.log("fetchedPageID", fetchedPageID);
    return fetchedPageID;
  };
  /**
   * prepare the input for Product Bulk Create
   * @param {*} parsedCSV
   * @returns
   */

  const addProductAttributes = async (definedProdAttributes, row) => {
    let attributes = [];
    //console.log("addProductAttributes", row);
    for (const attrKey of Object.keys(definedProdAttributes)) {
      if (row[attrKey]) {
        // Attribute slug exists in csv header, add it
        let prodAttr = { id: definedProdAttributes[attrKey][0] };
        const prodAttrKey = definedProdAttributes[attrKey][1].toLowerCase();

        if (definedProdAttributes[attrKey][1] === "MULTISELECT") {
          prodAttr[prodAttrKey] = [{ value: row[attrKey].trim() }];
        } else if (definedProdAttributes[attrKey][1] === "REFERENCE") {
          //check if page with slug exists in cache, if not query and add it
          const pageSlug = row[attrKey].trim().replace(" ", "-").toLowerCase();
          let pageId = productInputIdsCache["Pages"] && productInputIdsCache["Pages"][pageSlug];
          if (!pageId) {
            pageId = await getPageId(pageSlug);
          }
          prodAttr["references"] = [pageId];
        } else {
          prodAttr[prodAttrKey] = { value: row[attrKey].trim() };
        }

        attributes.push(prodAttr);
      } else if (attrKey === "brand-ref") {
        const brandPageSlug = row["brand"].trim().replace(" ", "-").toLowerCase();
        let pageId = productInputIdsCache["Pages"] && productInputIdsCache["Pages"][brandPageSlug];
        if (!pageId) {
          pageId = await getPageId(brandPageSlug);
        }
        attributes.push({
          id: definedProdAttributes[attrKey][0],
          references: [pageId],
        });
      }
    }

    return attributes;
  };

  const updateProdCollections = async (parsedCSV) => {
    const collectionAddProducts = {};
    for (const row of parsedCSV) {
      const sku = row["Cod stoc"] && row["Cod stoc"].trim();
      let channel = row["Channel"] ? row["Channel"].trim() : "default-channel";
      let productVariantAlreadyInDB = await checkIfProductVariantExistsInDb(sku);

      if (productVariantAlreadyInDB && row["reason"] && row["reason"] === "update-collection") {
        /** query channels */
        const channelID =
          productInputIdsCache["Channel"] && productInputIdsCache["Channel"][channel];
        if (!channelID) {
          //console.log('Channel not in cache, fetching...');
          productInputIdsCache["Channel"] = productInputIdsCache["Channel"] || {};
          const fetchedChannels = await getChannels(client);
          for (let c = 0; c < fetchedChannels.length; c++) {
            let currChannelSlug = fetchedChannels[c]["slug"];
            productInputIdsCache["Channel"][currChannelSlug] = fetchedChannels[c]["id"];
          }
        }

        let prodCollections = row["Colectii"].split("+").map((collection) => collection.trim());
        if (prodCollections) {
          for (let i = 0; i < prodCollections.length; i++) {
            const currCollection = prodCollections[i].trim();
            const prodCollectionID =
              productInputIdsCache["Collection"] &&
              productInputIdsCache["Collection"][currCollection];
            if (!prodCollectionID) {
              //console.log('Collection not in cache, fetching...');
              productInputIdsCache["Collection"] = productInputIdsCache["Collection"] || {};
              const fetchedProdCollectionID = await getCollections(
                client,
                currCollection,
                createNewCollectionMutation,
                assignCollectionToChannel,
                productInputIdsCache["Channel"][channel]
              );
              if (fetchedProdCollectionID) {
                productInputIdsCache["Collection"][currCollection] = fetchedProdCollectionID;
              }
            }
            if (prodCollectionID) {
              if (!collectionAddProducts[prodCollectionID]) {
                collectionAddProducts[prodCollectionID] = { products: [] };
              }
              collectionAddProducts[prodCollectionID]["products"].push(productVariantAlreadyInDB);
            }
          }
        }
      }
    }
    for (const prodCollectionID in collectionAddProducts) {
      if (collectionAddProducts.hasOwnProperty(prodCollectionID)) {
        const products = collectionAddProducts[prodCollectionID]["products"];
        await addProductsToCollection(client, collectionAddProductsM, prodCollectionID, products);
      }
    }
  };

  const prepareProductBulkCreateInput = async (parsedCSV) => {
    const products = {};
    for (const row of parsedCSV) {
      const sku = row["Cod stoc"] && row["Cod stoc"].trim();
      const stoc = row["stoc"] && parseInt(row["stoc"].trim());
      let productName = row["Denumire comerciala"] && row["Denumire comerciala"].trim();
      if (productName) {
        productName = productName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
      let colorDisplayed = row["culoare-comerciala"] && row["culoare-comerciala"].trim();
      if (colorDisplayed) {
        colorDisplayed = colorDisplayed
          .split(" ")
          .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");
      }
      let collection = row["Sezon"] && row["Sezon"].trim();
      let brand = row["brand"] && row["brand"].trim();
      let prodCollections = row["Colectii"].split("+").map((collection) => collection.trim());
      prodCollections.push(collection);
      prodCollections.push(brand);

      let categoryCsv = row["Categorie site"] && row["Categorie site"].trim();
      const category = createSlug(categoryCsv);
      //console.log("categoryslug", category);
      let productType = row["Tip produs"] && row["Tip produs"].trim();
      let channel = row["Channel"] ? row["Channel"].trim() : "default-channel";
      let description = row["descriere"] ? convertDescriereToEditorJS(row["descriere"]) : "";

      //check if product variant already exists in DB, if yes throw error
      let productVariantAlreadyInDB = await checkIfProductVariantExistsInDb(sku);

      if (!productVariantAlreadyInDB) {
        /** query Categorie */
        const categoryID =
          productInputIdsCache["Categorie site"] &&
          productInputIdsCache["Categorie site"][category];
        if (!categoryID) {
          //console.log('Category not in cache, fetching...');
          productInputIdsCache["Categorie site"] = productInputIdsCache["Categorie site"] || {};
          const fetchedCategoryID = await getCategoryID(client, [category]);
          productInputIdsCache["Categorie site"][category] = fetchedCategoryID;
        }

        /** query attributes by current product type, save all in cache */
        const prodAttrs =
          productInputIdsCache["Tip produs"] && productInputIdsCache["Tip produs"][productType];
        if (!prodAttrs) {
          //console.log('Product type not in cache, fetching...');
          productInputIdsCache["Tip produs"] = productInputIdsCache["Tip produs"] || {};

          const fetchedProdAttrs = await getProductTypeAttributes(client, [productType]);

          if (fetchedProdAttrs) {
            productInputIdsCache["Tip produs"][productType] = {};
            productInputIdsCache["Tip produs"][productType]["id"] = fetchedProdAttrs.id;
            productInputIdsCache["Tip produs"][productType]["productAttributes"] = {};
            productInputIdsCache["Tip produs"][productType]["variantAttributes"] = {};

            let productAttributes = fetchedProdAttrs.productAttributes;
            let variantAttributes = fetchedProdAttrs.assignedVariantAttributes;

            for (let a = 0; a < productAttributes.length; a++) {
              let attrSlug = productAttributes[a].slug;
              productInputIdsCache["Tip produs"][productType]["productAttributes"][attrSlug] = [
                productAttributes[a].id,
                productAttributes[a].inputType,
              ];
            }

            for (let l = 0; l < variantAttributes.length; l++) {
              let variantAttrSlug = variantAttributes[l].attribute.slug;
              productInputIdsCache["Tip produs"][productType]["variantAttributes"][
                variantAttrSlug
              ] = [variantAttributes[l].attribute.id, variantAttributes[l].attribute.inputType];
            }
          }
        }

        /** query channels */
        const channelID =
          productInputIdsCache["Channel"] && productInputIdsCache["Channel"][channel];
        if (!channelID) {
          //console.log('Channel not in cache, fetching...');
          productInputIdsCache["Channel"] = productInputIdsCache["Channel"] || {};
          const fetchedChannels = await getChannels(client);
          for (let c = 0; c < fetchedChannels.length; c++) {
            let currChannelSlug = fetchedChannels[c]["slug"];
            productInputIdsCache["Channel"][currChannelSlug] = fetchedChannels[c]["id"];
          }
        }

        /** query collections (sezon)*/
        if (prodCollections) {
          for (let i = 0; i < prodCollections.length; i++) {
            const currCollection = prodCollections[i].trim();
            const prodCollectionID =
              productInputIdsCache["Collections"] &&
              productInputIdsCache["Collections"][currCollection];
            if (!prodCollectionID) {
              console.log("Collection not in cache, fetching...");
              productInputIdsCache["Collections"] = productInputIdsCache["Collections"] || {};
              const fetchedProdCollectionID = await getCollections(
                client,
                currCollection,
                createNewCollectionMutation,
                assignCollectionToChannel,
                productInputIdsCache["Channel"][channel]
              );
              console.log("fetchedProdCollectionID", fetchedProdCollectionID);
              if (fetchedProdCollectionID) {
                productInputIdsCache["Collections"][currCollection] = fetchedProdCollectionID;
              }
            }
          }
        }

        /** get default warehouse TOREMOVE IN PROD*/
        const warehouseID = productInputIdsCache["Warehouse"];
        if (!warehouseID) {
          productInputIdsCache["Warehouse"] = productInputIdsCache["Warehouse"] || {};
          const defaultWarehouseId = await getDefaultWarehouse(client);
          productInputIdsCache["Warehouse"] = defaultWarehouseId;
        }

        const nowISO = new Date().toISOString();
        const seoDescription = `${productName} ${colorDisplayed} - ${row["brand"]} - pe magazinul online Surmont.ro`;

        //if product is not in products, create the object
        if (!products[productName]) {
          products[productName] = {
            name: productName,
            attributes: [],
            seo: {
              title:
                productName + (colorDisplayed ? " - " + colorDisplayed : "") + " | " + "Surmont",
              description: seoDescription,
            },
            category: productInputIdsCache["Categorie site"][category],
            productType: productInputIdsCache["Tip produs"][productType]["id"],
            channelListings: [
              {
                channelId: productInputIdsCache["Channel"][channel],
                isPublished: true,
                publishedAt: nowISO,
                visibleInListings: true,
                isAvailableForPurchase: true,
                availableForPurchaseAt: nowISO,
              },
            ],
            variants: [],
          };
        }

        if (description) {
          products[productName].description = description;
        }

        console.log("prodCollections", prodCollections);
        if (prodCollections) {
          products[productName].collections = prodCollections.map(
            (collection) => productInputIdsCache["Collections"][collection]
          );
        }

        //add Product Attributes - use productInputIdsCache['Tip produs'][productType]['productAttributes']
        let definedProdAttributes =
          productInputIdsCache["Tip produs"][productType]["productAttributes"];
        if (products[productName].attributes.length === 0) {
          let attributes = await addProductAttributes(definedProdAttributes, row);
          products[productName]["attributes"] = attributes;
        }

        //Add variants
        const existingVariant = products[productName].variants.find(
          (variant) => variant.sku === sku
        );
        //if variant does not exist, add it
        if (!existingVariant) {
          const newVariant = {
            sku: sku,
            name: row["marime"] ? row["marime"].trim() : "mărime unică",
            attributes: [],
            trackInventory: false,
            channelListings: [
              {
                channelId: productInputIdsCache["Channel"][channel],
                price: row["Pret vanzare initial"].trim() ?? 0,
              },
            ],
            stocks: [
              {
                warehouse: productInputIdsCache["Warehouse"],
                quantity: stoc,
              },
            ],
          };

          //add Variant Attributes - use productInputIdsCache['Tip produs'][productType]['productAttributes']
          let definedVarAttributes =
            productInputIdsCache["Tip produs"][productType]["variantAttributes"];
          Object.keys(definedVarAttributes).forEach((attrKey) => {
            if (row[attrKey]) {
              // Attribute slug exists in csv header, add it
              let varAttr = { id: definedVarAttributes[attrKey][0] };
              const varAttrKey = definedVarAttributes[attrKey][1].toLowerCase();
              if (definedVarAttributes[attrKey][1] === "MULTISELECT") {
                varAttr[varAttrKey] = [{ value: row[attrKey].trim() }];
              } else {
                varAttr[varAttrKey] = { value: row[attrKey].trim() };
              }
              newVariant.attributes.push(varAttr);
            }
          });

          products[productName].variants.push(newVariant);
        }
      }
    }
    console.log(products);
    return Object.values(products);
  };

  const updateProducts = async (parsedCSV) => {
    try {
      await updateProdCollections(parsedCSV);
    } catch (error) {
      handleErrors(error.message);
    }
  };

  /**
   * import the products from csv
   * @param {*} parsedCSV
   */
  const importProducts = async (parsedCSV) => {
    let importedProds = [];
    try {
      let productBulkCreateInput = await prepareProductBulkCreateInput(parsedCSV);
      if (productBulkCreateInput) {
        // Perform mutation or further processing...
        //check if product exists
        for (const product of productBulkCreateInput) {
          const productName = product.name;
          const productDetails = await getProductsVar(client, productName);
          if (productDetails) {
            try {
              let existingProd = productBulkCreateInput.filter((prod) => prod.name === productName);
              // Product exists, remove it from productBulkCreateInput
              productBulkCreateInput = productBulkCreateInput.filter(
                (prod) => prod.name !== productName
              );
              const updateProductMut = await updateProduct(existingProd[0], productDetails["id"]);
              // Perform update or additional actions here for existing product
              if (updateProductMut) {
                importedProds.push(productName);
              }
            } catch (error) {
              console.log("errr");
              handleErrors(error.message);
            }
          }
        }
        if (productBulkCreateInput.length > 0) {
          const result = await createProductBulkMutation({
            input: productBulkCreateInput,
          });
          if (result) {
            result.data.productBulkCreate.results?.map((prod) => {
              if (prod.product !== null) {
                importedProds.push(prod.product.name);
              } else if (prod.errors && prod.errors.length > 0) {
                handleErrors(prod.errors[0].message);
              } else if (!prod.product) {
                handleErrors("Error adding product");
              }
            });
          }
          setUploading(false);
          //resetSelectedFiles();
          // Handle the result here if needed
          //console.log(result.data.productBulkCreate.results);
        }
      }
    } catch (error) {
      handleErrors(error.message);
    }
    setImportedProds(importedProds);
  };

  /** process CSV */
  const processCSV = async (file) => {
    try {
      const parsedCSV = await parseCSV(file);
      if (parsedCSV) {
        const filteredCSV = filterEmptyRows(parsedCSV);
        await importProducts(filteredCSV);
      }
    } catch (error) {
      handleErrors(error.message);
    }
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = ({ target }) => {
        Papa.parse(target.result, {
          header: true,
          complete: (result) => {
            resolve(result.data);
          },
          error: (error) => {
            reject(error);
          },
        });
      };
      reader.readAsText(file);
    });
  };

  const filterEmptyRows = (data) => {
    return data.filter((row) =>
      Object.values(row).some((value) => value !== undefined && value !== "")
    );
  };

  /** handle files(s) Upload */
  const handleFileUpload = async (file) => {
    if (file.type === "text/csv") {
      await processCSV(file);
    } else if (file.type.match("image")) {
      await handleMediaUpload(file);
    }
  };

  const handleProductUpdate = async () => {
    try {
      const input = inputRef?.current;
      let files = input.files;
      if (files.length === 0) {
        return;
      }
      for (var i = 0; i < files.length; i++) {
        const parsedCSV = await parseCSV(files[i]);
        if (parsedCSV) {
          const filteredCSV = filterEmptyRows(parsedCSV);
          await updateProdCollections(filteredCSV);
        }
      }
    } catch (error) {
      handleErrors(error.message);
    }
  };

  const handleUpload = async (isCsv) => {
    //current represents the currently rendered DOM node (literally, the element as it's rendered in the browser).
    const input = inputRef?.current;
    let files = input.files;
    if (files.length === 0) {
      return;
    }
    setUploading(true);
    for (var i = 0; i < files.length; i++) {
      await handleFileUpload(files[i]);
    }
  };

  const handleErrors = (error) => {
    //console.error(error);
    setErrors((prevErrors) => {
      // Create a copy of the previous errors set
      const updatedErrors = new Set(prevErrors);

      // Check if the error message exists in the set
      if (!updatedErrors.has(error)) {
        // If the message doesn't exist, add it to the set
        updatedErrors.add(error);
      }

      // Return the updated set as an array
      return [...updatedErrors];
    });
    setUploading(false);
  };

  const resetSelectedFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setErrors("");
    setImportedPics([]);
    setImportedProds([]);
  };

  return (
    <div>
      <div className="upload-wrapper">
        <h4 className="page-header mb-4">Upload .csv file or product pictures</h4>
        <h5>Product pictures should be called: Denumire comerciala_Culoare comerciala </h5>
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
          {uploading ? "Importing..." : "Upload & Start Import"}
        </button>

        {/* <button onClick={handleProductUpdate} className="button-66">
          Update Product Collections
        </button> */}

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

      {importedProds.length > 0 && (
        <div>
          <h3>Imported Products:</h3>
          <ul>
            {importedProds.map((product, index) => (
              <li key={index}>{product}</li>
            ))}
          </ul>
        </div>
      )}

      {importedPics.length > 0 && (
        <div>
          <h3>Imported Pictures:</h3>
          <ul>
            {importedPics.map((pic, index) => (
              <li key={index}>{pic}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductsImporterView;
