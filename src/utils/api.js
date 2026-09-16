const DEV_API_URL = "https://dev.devlomatix.com/api/v5";
const PROD_API_URL = "https://devlomatix.com/api/v5";

const CUREXA_PROD_API_URL = "https://curexa.devlomatix.com/api/v5";

export const baseApi =
  process.env.EXPO_PUBLIC_BASE_API ||
  (__DEV__ ? DEV_API_URL : PROD_API_URL);

export const curexaBaseApi =
  process.env.EXPO_PUBLIC_BASE_API ||
  (__DEV__ ? DEV_API_URL : CUREXA_PROD_API_URL);

export const apiUrls = {
  // Auth
  register: baseApi + "/auth/register", // POST
  login: baseApi + "/auth/login", // POST
  googleLogin: baseApi + "/auth/login/google", // POST
  userfromtoken: baseApi + "/auth/userfromtoken", // POST
  userFromId: baseApi + "/auth/user", // POST

  // Payment (Razorpay)
  razorpayOrder: baseApi + "/payment/razorpay", // POST
  verifyPayment: baseApi + "/payment/verify", // POST

  // Hospital & Profile Settings
  getProfileData: baseApi + "/profile/hospitalsetting", // GET
  updateProfileData: baseApi + "/profile/hospitalsetting", // POST

  // FCM Push Notifications
  fcmNotification: baseApi + "/fcm", // POST
  fcmExpoNotification: baseApi + "/fcm/expo", // POST

  // Curexa HMS & Clinical Suite
  curexaPatient: curexaBaseApi + "/patient",
  curexaAppointment: curexaBaseApi + "/appointment",
  curexaBed: curexaBaseApi + "/bed",
  curexaPharmacy: curexaBaseApi + "/pharmacy",
  curexaLaboratory: curexaBaseApi + "/laboratory",
  curexaBilling: curexaBaseApi + "/billing",
  curexaCrm: curexaBaseApi + "/crm",
  curexaDepartment: curexaBaseApi + "/department",
  curexaWorkflow: curexaBaseApi + "/workflow",
  curexaCalendar: curexaBaseApi + "/calendar",
  curexaKanban: curexaBaseApi + "/kanban",
  curexaDocument: curexaBaseApi + "/document",
  curexaPrescription: curexaBaseApi + "/prescription",
  curexaService: curexaBaseApi + "/service",
  curexaInventory: curexaBaseApi + "/inventory",
  curexaInvoice: curexaBaseApi + "/invoice",
  curexaReports: curexaBaseApi + "/reports",
};

