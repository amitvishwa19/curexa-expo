const DEV_API_URL = "https://dev.devlomatix.com/api/v5";
const PROD_API_URL = "https://curexa.devlomatix.com/api/v5";

export const baseApi =
  process.env.EXPO_PUBLIC_BASE_API ||
  (__DEV__ ? DEV_API_URL : PROD_API_URL);

export const curexaBaseApi = baseApi;

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

  // AI & Chat Agent
  agent: baseApi + "/agent", // POST

  // Curexa HMS & Clinical Suite
  curexaBaseApi: baseApi,
  curexaPatient: baseApi + "/patient",
  curexaAppointment: baseApi + "/appointment",
  curexaBed: baseApi + "/bed",
  curexaPharmacy: baseApi + "/pharmacy",
  curexaLaboratory: baseApi + "/laboratory",
  curexaBilling: baseApi + "/billing",
  curexaCrm: baseApi + "/crm",
  curexaDepartment: baseApi + "/department",
  curexaWorkflow: baseApi + "/workflow",
  curexaCalendar: baseApi + "/calendar",
  curexaKanban: baseApi + "/kanban",
  curexaDocument: baseApi + "/document",
  curexaPrescription: baseApi + "/prescription",
  curexaService: baseApi + "/service",
  curexaInventory: baseApi + "/inventory",
  curexaInvoice: baseApi + "/invoice",
  curexaReports: baseApi + "/reports",
};
