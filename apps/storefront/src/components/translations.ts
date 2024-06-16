import { defineMessages } from "react-intl";

export const messages = defineMessages({
  more: {
    id: "app.home.greeting",
    description: "Link to proceed to the product collection view.",
    defaultMessage: "More →",
  },
  loginWelcomeMessage: {
    id: "app.login.greeting",
    description: "Welcome message on home screen",
    defaultMessage: "Welcome back",
  },
  loginHeader: {
    id: "app.login.header",
    description: "Login form header",
    defaultMessage: "Login to your account",
  },
  loginEmailFieldLabel: {
    id: "app.login.emailField",
    description: "Email field label",
    defaultMessage: "Email",
  },
  loginPasswordFieldLabel: {
    id: "app.login.passwordField",
    description: "Password field label",
    defaultMessage: "Password",
  },
  loginRemindPasswordButtonLabel: {
    id: "app.login.remindPassword",
    description: "Button for reminding the password to the users",
    defaultMessage: "Forgot password?",
  },
  backLogin: {
    id: "app.login.backLogin",
    description: "Link to go to the login page",
    defaultMessage: "Back to login",
  },
  forgotPasswordHeadline: {
    id: "app.login.forgotPasswordHeadline",
    description: "Info text displayed as title for forgot password page",
    defaultMessage: "Provide a new password for your account:",
  },
  forgotPasswordText: {
    id: "app.login.forgotPasswordText",
    description: "Info text for forgot password",
    defaultMessage: "We will send you an email to reset your password.",
  },
  forgotPasswordButton: {
    id: "app.login.forgotPasswordButton",
    description: "Forgot password button text",
    defaultMessage: "Reset password",
  },
  forgotPasswordSendLinkButton: {
    id: "app.login.forgotPasswordSendLinkButton",
    description: "Forgot password button text",
    defaultMessage: "Send reset link",
  },
  forgotPasswordAfterSubmit: {
    id: "app.login.forgotPasswordAfterSubmit",
    description: "Message displayed to user after form submission",
    defaultMessage: "Check your email for the password reset link.",
  },
  gdprConsent: {
    id: "app.login.gdprConsent",
    description: "GDPR message displayed when registering",
    defaultMessage: "I agree with the processing of personal data according to the",
  },
  gdprConsentErr: {
    id: "app.login.gdprConsentErr",
    description: "GDPR error displayed when registering",
    defaultMessage: "You must accept the GDPR terms to register.",
  },
  createAccount: {
    id: "app.login.createAccount",
    description: "Link to create account view",
    defaultMessage: "Register a new account",
  },
  registerHeader: {
    id: "app.register.header",
    description: "Register form header",
    defaultMessage: "Create a new account",
  },
  createNewAccountFromCheckoutHeader: {
    id: "app.register.createNewAccountFromCheckoutHeader",
    description: "Create new account while checkout",
    defaultMessage: "I want to create an account",
  },
  registerEmailFieldLabel: {
    id: "app.register.emailField",
    description: "Email field label",
    defaultMessage: "Email*",
  },
  registerPasswordFieldLabel: {
    id: "app.register.passwordField",
    description: "Password field label",
    defaultMessage: "Password (minimum 8 characters)*",
  },
  registerButton: {
    id: "app.register.registerButton",
    description: "Register account button label",
    defaultMessage: "Register new account",
  },
  registerSuccess: {
    id: "app.register.registerSuccess",
    description: "Account creation while checkout",
    defaultMessage: "Your account has been created.",
  },
  resendConfirmationCode: {
    id: "app.register.resendConfirmationCode",
    description: "Text displayed for when ACCOUNT_NOT_CONFIRMED err is displayed",
    defaultMessage: "Resend confirmation email",
  },
  accountConfirmed: {
    id: "app.register.accountConfirmed",
    description: "Text displayed for when ACCOUNT_IS_CONFIRMED",
    defaultMessage: "Your account has been successfully confirmed.",
  },
  accountConfirmationInProgress: {
    id: "app.register.accountConfirmationInProgress",
    description: "Text displayed after a new account is created",
    defaultMessage:
      "An email has been sent to your email address containing a link to confirm your account. You must confirm your account to be able to log in.",
  },
  accountConfirmTitle: {
    id: "app.register.accountConfirmTitle",
    description: "Title displayed for confirmed page when err are displayed",
    defaultMessage: "Confirm Account",
  },
  backToLogin: {
    id: "app.register.backToLogin",
    description: "Link to go to the login page",
    defaultMessage: "Log in to existing account",
  },
  logIn: {
    id: "app.navigation.login",
    description: "Link to login view",
    defaultMessage: "Log in",
  },
  menuAccountPreferences: {
    id: "app.navigation.accountPreferences",
    description: "Link to account preferences view",
    defaultMessage: "Account preferences",
  },
  menuAccountAddressBook: {
    id: "app.navigation.addressBook",
    description: "Link to address book view",
    defaultMessage: "Address book",
  },
  menuAccountOrders: {
    id: "app.navigation.orders",
    description: "Link to orders view",
    defaultMessage: "Orders",
  },
  menuAccountOrderNumber: {
    id: "app.account.orderNumber",
    description: "Order Number",
    defaultMessage: "Number",
  },
  menuAccountOrderCreateDate: {
    id: "app.account.orderCreateDate",
    description: "Order Create Date",
    defaultMessage: "Create Date",
  },
  menuAccountOrderStatus: {
    id: "app.account.orderStatus",
    description: "Order Status",
    defaultMessage: "Status",
  },
  menuAccountOrderDetails: {
    id: "app.account.orderDetail",
    description: "Your order number",
    defaultMessage: "Your order number",
  },
  menuAccountOrderDetailsItems: {
    id: "app.account.orderDetailItems",
    description: "Items",
    defaultMessage: "Items",
  },
  menuAccountOrderDetailsPrice: {
    id: "app.account.orderDetailPrice",
    description: "Price",
    defaultMessage: "Price",
  },
  menuAccountOrderDetailsShippingPrice: {
    id: "app.account.orderDetailShippingPrice",
    description: "Shipping Price",
    defaultMessage: "Shipping Price",
  },
  quantity: {
    id: "app.quantity",
    description: "Quantity",
    defaultMessage: "Quantity",
  },
  logOut: {
    id: "app.navigation.logout",
    description: "Log out link",
    defaultMessage: "Log out",
  },
  regionModalHeader: {
    id: "app.region.modalHeader",
    description: "Header of the region selection modal.",
    defaultMessage: "Choose your region",
  },
  channelFieldLabel: {
    id: "app.region.channelField",
    description: "Label of channel selection field.",
    defaultMessage: "Channel",
  },
  languageFieldLabel: {
    id: "app.region.languageField",
    description: "Label of language selection field.",
    defaultMessage: "Language",
  },
  addToCart: {
    id: "app.product.addToCart",
    description: "Add to cart button label.",
    defaultMessage: "Add to cart",
  },
  variantNotChosen: {
    id: "app.product.variantNotChosen",
    description: "Warning message when variant is not chosen.",
    defaultMessage: "Please chose the variant",
  },
  soldOut: {
    id: "app.product.soldOut",
    description: "Warning message when variant is sold out.",
    defaultMessage: "Sold out!",
  },
  attributes: {
    id: "app.product.attributes",
    description: "Attributes table header.",
    defaultMessage: "Attributes",
  },
  adding: {
    id: "app.product.adding",
    description: "Message displayed during adding product to the cart.",
    defaultMessage: "Adding...",
  },
  description: {
    id: "app.product.description",
    description: "Product Description",
    defaultMessage: "Description",
  },
  checkoutButton: {
    id: "app.checkout.checkoutButton",
    description: "Go to checkout button label.",
    defaultMessage: "Proceed to Checkout",
  },
  cartPageHeader: {
    id: "app.checkout.pageHeader",
    description: "Header of the cart page.",
    defaultMessage: "Your Shopping Cart",
  },
  cartEmptyHeader: {
    id: "app.checkout.cartEmptyHeader",
    description: "Empty cart text",
    defaultMessage: "Your cart is empty.",
  },
  discountCodeFieldLabel: {
    id: "app.checkout.discountCode",
    description: "Name of the discount code field.",
    defaultMessage: "Discount code",
  },
  discount: {
    id: "app.checkout.discount",
    description: "Discount code table header at the checkout summary.",
    defaultMessage: "Discount",
  },
  subtotal: {
    id: "app.checkout.subtotal",
    description: "Subtotal table header at the checkout summary.",
    defaultMessage: "Subtotal",
  },
  total: {
    id: "app.checkout.total",
    description: "Total table header at the checkout summary.",
    defaultMessage: "Total",
  },
  shipping: {
    id: "app.checkout.shipping",
    description: "Shipping table header at the checkout summary.",
    defaultMessage: "Shipping",
  },
  shippingInfo: {
    id: "app.checkout.shippingInfo",
    description: "Text displayed on cart modal",
    defaultMessage: "Calculated at checkout",
  },
  tax: {
    id: "app.checkout.tax",
    description: "Tax table header at the checkout summary.",
    defaultMessage: "Tax",
  },
  emailAddressCardHeader: {
    id: "app.checkout.emailAddressCardHeader",
    description: "Header of the email section.",
    defaultMessage: "Contact details",
  },
  alreadyHaveAccountHeader: {
    id: "app.checkout.alreadyHaveAccountHeader",
    description: "Already have an account",
    defaultMessage: "Already have an account?",
  },
  billingMethodCardHeader: {
    id: "app.checkout.billingMethodCardHeader",
    description: "Header of the billing method section.",
    defaultMessage: "Billing Method",
  },
  billingAddressCardHeader: {
    id: "app.checkout.billingAddressCardHeader",
    description: "Header of the billing address section.",
    defaultMessage: "Billing Address",
  },
  addressSelect: {
    id: "app.checkout.addressSelect",
    description: "Help text above existing addresses",
    defaultMessage: "Click to select already existing addresses:",
  },
  shippingAddressCardHeader: {
    id: "app.checkout.shippingAddressCardHeader",
    description: "Header of the shipping address section.",
    defaultMessage: "Shipping Address",
  },
  shippingMethodCardHeader: {
    id: "app.checkout.shippingMethodCardHeader",
    description: "Header of the shipping method section.",
    defaultMessage: "Shipping Method",
  },
  paymentCardHeader: {
    id: "app.checkout.paymentCardHeader",
    description: "Header of the payment section.",
    defaultMessage: "Payment",
  },
  paymentInstruction: {
    id: "app.checkout.paymentInstruction",
    description: "User instructions at payment section.",
    defaultMessage: "Choose payment method",
  },
  phoneField: {
    id: "app.checkout.phoneField",
    description: "Phone number field label.",
    defaultMessage: "Phone",
  },
  firstNameField: {
    id: "app.checkout.firstNameField",
    description: "First name field label.",
    defaultMessage: "First name",
  },
  lastNameField: {
    id: "app.checkout.lastNameField",
    description: "Last name field label.",
    defaultMessage: "Last name",
  },
  companyNameField: {
    id: "app.checkout.companyNameField",
    description: "Company name field label.",
    defaultMessage: "Company name",
  },
  addressField: {
    id: "app.checkout.addressField",
    description: "Address field label.",
    defaultMessage: "Address",
  },
  countryField: {
    id: "app.checkout.countryField",
    description: "Country field label.",
    defaultMessage: "Country",
  },
  cityField: {
    id: "app.checkout.cityField",
    description: "City field label.",
    defaultMessage: "City",
  },
  postalCodeField: {
    id: "app.checkout.postalCodeField",
    description: "Postal code field label.",
    defaultMessage: "Postal code",
  },

  cardNumberField: {
    id: "app.checkout.cardNumberField",
    description: "Card number field label.",
    defaultMessage: "Card number",
  },
  expDateField: {
    id: "app.checkout.expDateField",
    description: "Expiration date field label.",
    defaultMessage: "Expiration date",
  },
  cvcField: {
    id: "app.checkout.cvcField",
    description: "CVC code field label.",
    defaultMessage: "CVC",
  },
  paymentButton: {
    id: "app.checkout.paymentButton",
    description: "Payment button label.",
    defaultMessage: "Pay {total}",
  },
  sameAsBillingButton: {
    id: "app.checkout.sameAsBillingButton",
    description: "Use same address as billing button label.",
    defaultMessage: "Use the same shipping address as billing",
  },
  orderSummary: {
    id: "app.checkout.orderSummary",
    description: "Header of the order summary section.",
    defaultMessage: "Order summary",
  },
  browseProducts: {
    id: "app.ui.browseProducts",
    description: "Label for the link to the product browsing.",
    defaultMessage: "Browse products",
  },
  loadMoreButton: {
    id: "app.ui.loadMoreButton",
    description: "Display more products button label.",
    defaultMessage: "Load more",
  },
  noProducts: {
    id: "app.ui.noProductsInfo",
    description: "Displayed when list has no products.",
    defaultMessage: "Search query didn't return any viable results",
  },
  removeButton: {
    id: "app.ui.removeButton",
    description: "Remove item button label.",
    defaultMessage: "Remove",
  },
  activateButton: {
    id: "app.ui.activateButton",
    description: "Activate button label.",
    defaultMessage: "Activate",
  },
  changeButton: {
    id: "app.ui.changeButton",
    description: "Change button label.",
    defaultMessage: "Change",
  },
  saveButton: {
    id: "app.ui.saveButton",
    description: "Save button label.",
    defaultMessage: "Save",
  },
  closeButton: {
    id: "app.ui.closeButton",
    description: "Close button label.",
    defaultMessage: "Close",
  },
  paginationProductCounter: {
    id: "app.ui.productCounter",
    description: "Message with number of displayed products.",
    defaultMessage: "{currentItemsCount} out of {totalItemsCount}",
  },
  searchHeader: {
    id: "app.search.searchHeader",
    description: "Header of the search page.",
    defaultMessage: "Search results for",
  },
  searchTitle: {
    id: "app.search.searchTitle",
    description: "Search form placeholder",
    defaultMessage: "Search for products...",
  },
  search: {
    id: "app.search",
    description: "Search",
    defaultMessage: "Search",
  },
  searchFieldPlaceholder: {
    id: "app.search.searchFieldPlaceholder",
    description: "Placeholder displayed in the search field.",
    defaultMessage: "What are you looking for?",
  },
  changeEmailHeader: {
    id: "app.preferences.changeEmail.header",
    description: "Header for email change section",
    defaultMessage: "Change email",
  },
  changedEmail: {
    id: "app.preferences.changeEmail.changed",
    description: "Message displayed on success email changing",
    defaultMessage: "Email changed successfully. Check your mailbox for confirmation email.",
  },
  changePasswordHeader: {
    id: "app.preferences.changePassword.header",
    description: "Header for password change section",
    defaultMessage: "Change password",
  },
  oldPasswordFieldLabel: {
    id: "app.preferences.changePassword.oldPasswordFieldLabel",
    description: "Old password field label",
    defaultMessage: "Old password",
  },
  newPasswordFieldLabel: {
    id: "app.preferences.changePassword.newPasswordFieldLabel",
    description: "New password field label",
    defaultMessage: "New password",
  },
  newPasswordRepeatedFieldLabel: {
    id: "app.preferences.newPassword.header",
    description: "Repeated new password field label",
    defaultMessage: "Confirm new password",
  },
  changedPassword: {
    id: "app.preferences.changePassword.changedPassword",
    desription: "Password changed successfully",
    defaultMessage: "Password changed successfully",
  },
  noAddressDataMessage: {
    id: "app.preferences.addressbook.noData",
    description: "Message displayed when user has no address saved",
    defaultMessage: "No addresses information for this user",
  },
  defaultBillingAndShipping: {
    id: "app.preferences.addressbook.defaultBillingShipping",
    description: "Message displayed when address is both billing and shipping default",
    defaultMessage: "Default billing and shipping address",
  },
  defaultBilling: {
    id: "app.preferences.addressbook.defaultBilling",
    description: "Message displayed when address is billing default",
    defaultMessage: "Default billing address",
  },
  defaultShipping: {
    id: "app.preferences.addressbook.defaultShipping",
    description: "Message displayed when address is shipping default",
    defaultMessage: "Default shipping address",
  },
  setDefaultShipping: {
    id: "app.preferences.addressbook.setDefaultShipping",
    description: "Set shipping default button label",
    defaultMessage: "Set as shipping default",
  },
  setDefaultBilling: {
    id: "app.preferences.addressbook.setDefaultBilling",
    description: "Set billing default button label",
    defaultMessage: "Set as billing default",
  },
  cancel: {
    id: "app.buttons.cancel",
    description: "Close active and return",
    defaultMessage: "Cancel",
  },
  back: {
    id: "app.buttons.back",
    description: "Go back",
    defaultMessage: "Back",
  },
  relatedProducts: {
    id: "app.relatedProducts",
    description: "Text to be displayed above related prods section",
    defaultMessage: "We think you'll also like these",
  },
  newProducts: {
    id: "app.newProducts",
    description: "Text to be displayed above new prods section",
    defaultMessage: "New Arrivals",
  },
  sizeGuide: {
    id: "app.sizeGuide",
    description: "Size Guide link text",
    defaultMessage: "Size guide",
  },
  chooseSize: {
    id: "app.chooseSize",
    description: "Choose Size",
    defaultMessage: "Choose Size",
  },
  size: {
    id: "app.size",
    description: "Size",
    defaultMessage: "Size",
  },
  sortBy: {
    id: "app.sortBy",
    description: "Sort By text",
    defaultMessage: "Sort By",
  },
  filterBy: {
    id: "app.filterBy",
    description: "Filter By text",
    defaultMessage: "Filters",
  },
  apply: {
    id: "app.buttons.apply",
    description: "Apply filters",
    defaultMessage: "Apply",
  },
  clearAll: {
    id: "app.clearAll",
    description: "Clear all filters",
    defaultMessage: "Clear all filters",
  },
  sortByDefault: {
    id: "app.sort.sortByDefault",
    description: "Default Sorting",
    defaultMessage: "Default Sorting",
  },
  sortByPriceAsc: {
    id: "app.sort.sortByPriceAsc",
    description: "sort By Price ascending",
    defaultMessage: "Price ascending",
  },
  sortByPriceDesc: {
    id: "app.sort.sortByPriceDesc",
    description: "sort By Price descending",
    defaultMessage: "Price descending",
  },
  sortByOldest: {
    id: "app.sort.sortByOldest",
    description: "sort By Oldest",
    defaultMessage: "Oldest",
  },
  sortByLatest: {
    id: "app.sort.sortByLatest",
    description: "sort By Latest",
    defaultMessage: "Latest",
  },
  sortByNameAsc: {
    id: "app.sort.sortByNameAsc",
    description: "sort By Name ascending",
    defaultMessage: "Name ascending",
  },
  outletTitle: {
    id: "app.search.outletTitle",
    description: "Title for Outlet page",
    defaultMessage: "Outlet",
  },
});

export default messages;
