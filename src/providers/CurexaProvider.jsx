import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAppointments,
  getBeds,
  getBillingInvoices,
  getDepartmentsAndDoctors,
  getLaboratoryOrders,
  getPatients,
  getPharmacyData,
  MOCK_TELEMETRY_BEDS,
  MOCK_HANDOVERS,
  MOCK_ON_CALL_DOCTORS,
  MOCK_WHATSAPP_LOGS,
} from '~/services/curexa';
import { getSession } from '~/utils/authStorage';

const CurexaContext = createContext(null);
const DUMMY_DATA_STORAGE_KEY = 'devlomatix.curexa.show_dummy_data';

export const SEED_PATIENT_PROFILE = {
  id: 'p-1',
  sku: 'PAT-2026-001',
  displayName: 'Deepika Joshi',
  gender: 'Female',
  age: 38,
  bloodGroup: 'O+',
  uhid: 'CUX-889102',
  phone: '+91 98765 43210',
  email: 'deepika.joshi@example.com',
  emergencyContact: {
    name: 'Sanjay Joshi',
    relation: 'Spouse',
    phone: '+91 98110 92834',
  },
  allergies: ['Penicillin (Severe)', 'Sulfa Drugs (Mild)', 'Latex (Contact Dermatitis)'],
  chronicConditions: ['Hypertension (Stage 1)', 'Mild Asthma'],
  vitals: {
    bp: '128/84',
    heartRate: '76 bpm',
    spo2: '98%',
    temperature: '98.6 °F',
    glucose: '98 mg/dL',
    respRate: '16 rpm',
    weight: '64 kg',
    height: '168 cm',
    waist: '78 cm',
    cholesterol: '188 mg/dL',
    bmi: '22.7',
    lastRecorded: 'Today, 08:45 AM',
  },
  insurance: {
    provider: 'Star Health Insurance',
    policyNumber: 'STAR-IND-9923841',
    validTill: '2027-12-31',
    coverage: '80%',
  },
};

export const SEED_FAMILY_MEMBERS = [
  { id: 'dep-0', name: 'Self (Deepika)', relation: 'Primary Patient', uhid: 'CUX-889102', age: 38, bloodGroup: 'O+' },
  { id: 'dep-1', name: 'Sanjay Joshi', relation: 'Spouse', uhid: 'CUX-889103', age: 41, bloodGroup: 'A+' },
  { id: 'dep-2', name: 'Aarav Joshi', relation: 'Son', uhid: 'CUX-889104', age: 8, bloodGroup: 'O+' },
];

export const SEED_PATIENT_VITALS_HISTORY = [
  { id: 'vh-1', metric: 'Blood Pressure', value: '128/84', unit: 'mmHg', timing: 'Resting / Morning', status: 'Optimal', date: 'Today, 08:45 AM' },
  { id: 'vh-2', metric: 'Glucose/Sugar', value: '98', unit: 'mg/dL', timing: 'Fasting', status: 'Normal', date: 'Today, 08:30 AM' },
  { id: 'vh-3', metric: 'Heart Rate', value: '76', unit: 'bpm', timing: 'Resting Pulse', status: 'Optimal', date: 'Today, 08:45 AM' },
  { id: 'vh-4', metric: 'Blood Oxygen (SpO2)', value: '98', unit: '%', timing: 'Pulse Oximetry', status: 'Optimal', date: 'Today, 08:45 AM' },
  { id: 'vh-5', metric: 'Body Weight', value: '64.0', unit: 'kg', timing: 'Fasting Weight', status: 'Normal', date: 'Today, 08:00 AM' },
  { id: 'vh-6', metric: 'Body Temperature', value: '98.6', unit: '°F', timing: 'Oral Probe', status: 'Normal', date: 'Today, 08:45 AM' },
  { id: 'vh-7', metric: 'Waist Circumference', value: '78', unit: 'cm', timing: 'Routine Measure', status: 'Optimal', date: 'Sep 14, 2026' },
  { id: 'vh-8', metric: 'Total Cholesterol', value: '188', unit: 'mg/dL', timing: 'Fasting Lipid Panel', status: 'Optimal', date: 'Sep 14, 2026' },
  { id: 'vh-9', metric: 'Blood Pressure', value: '124/82', unit: 'mmHg', timing: 'Evening Review', status: 'Optimal', date: 'Sep 14, 2026' },
  { id: 'vh-10', metric: 'Glucose/Sugar', value: '122', unit: 'mg/dL', timing: 'Post-Prandial (2hr)', status: 'Optimal', date: 'Sep 14, 2026' },
  { id: 'vh-11', metric: 'Body Weight', value: '64.2', unit: 'kg', timing: 'Morning Check', status: 'Normal', date: 'Sep 12, 2026' },
];

export const SEED_PATIENT_ALLERGIES = [
  { id: 'alg-1', title: 'Penicillin', severity: 'Severe (Anaphylaxis Risk)', notes: 'Causes hives & airway constriction' },
  { id: 'alg-2', title: 'Sulfa Drugs', severity: 'Moderate', notes: 'Skin rash with Bactrim/Septra' },
  { id: 'alg-3', title: 'Latex', severity: 'Mild', notes: 'Contact dermatitis from gloves' },
];

export const SEED_PATIENT_VACCINES = [
  { id: 'vac-1', name: 'COVID-19 Booster (Covishield/Corbevax)', date: 'Jan 15, 2026', dose: 'Precaution Dose 3', facility: 'Curexa OPD Immunization Wing', batch: 'COV-IND-99824' },
  { id: 'vac-2', name: 'Influenza (Quadrivalent Flu Vaccine)', date: 'Nov 10, 2025', dose: 'Annual 2025/26', facility: 'Curexa Preventive Clinic', batch: 'FLU-2025-A' },
  { id: 'vac-3', name: 'Tetanus Toxoid (TT / Tdap)', date: 'May 04, 2024', dose: '10-Year Booster', facility: 'AIIMS Trauma Center, New Delhi', batch: 'TT-4402' },
  { id: 'vac-4', name: 'Hepatitis B Recombinant', date: 'Aug 12, 2023', dose: 'Series Complete (3/3)', facility: 'Safdarjung Hospital OPD', batch: 'HBV-019' },
];

export const SEED_PRESCRIPTIONS = [
  {
    id: 'rx-101',
    patientName: 'Deepika Joshi',
    patientSku: 'PAT-2026-001',
    doctorName: 'Dr. Rajesh Sharma, MD',
    specialty: 'Cardiology',
    diagnosis: 'Post-PTCA Angioplasty Ischemia Prevention',
    prescribedAt: '2026-09-15',
    status: 'Active',
    medicines: [
      {
        name: 'Atorvastatin 20mg (Storvas-20)',
        dosage: '1 - 0 - 1',
        duration: '30 Days',
        timing: 'After Meals',
        takenMorning: true,
        takenNight: false,
      },
      {
        name: 'Aspirin Cardio 75mg (Ecosprin-75)',
        dosage: '0 - 1 - 0',
        duration: '30 Days',
        timing: 'After Lunch',
        takenAfternoon: false,
      },
      {
        name: 'Pantoprazole 40mg (Pan-40)',
        dosage: '1 - 0 - 0',
        duration: '14 Days',
        timing: 'Before Breakfast',
        takenMorning: true,
      },
    ],
  },
  {
    id: 'rx-102',
    patientName: 'Rahul Verma',
    patientSku: 'PAT-2026-002',
    doctorName: 'Dr. Amit Malhotra, MD',
    specialty: 'Neurology',
    diagnosis: 'Acute Migraine Prophylaxis',
    prescribedAt: '2026-09-15',
    status: 'Active',
    medicines: [
      {
        name: 'Sumatriptan 50mg (Suminat-50)',
        dosage: 'SOS (When Needed)',
        duration: '10 Days',
        timing: 'Onset of aura',
        takenMorning: false,
      },
      {
        name: 'Pantoprazole 40mg (Pan-40)',
        dosage: '1 - 0 - 0',
        duration: '14 Days',
        timing: 'Before Breakfast',
        takenMorning: true,
      },
    ],
  },
];

export function CurexaProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [portalMode, setPortalModeState] = useState('HOSPITAL'); // 'HOSPITAL' | 'PATIENT'
  const [showDummyData, setShowDummyDataState] = useState(true);

  const [hospitalInfo, setHospitalInfo] = useState({
    name: 'Curexa Super Specialty Hospital',
    code: 'CUREXA-DELHI',
    tagline: 'Super Specialty Hospital & Research Center',
    branch: 'Connaught Place Campus, New Delhi',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [wards, setWards] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Advanced modules state
  const [telemetryBeds, setTelemetryBeds] = useState(MOCK_TELEMETRY_BEDS);
  const [handovers, setHandovers] = useState(MOCK_HANDOVERS);
  const [onCallDoctors, setOnCallDoctors] = useState(MOCK_ON_CALL_DOCTORS);
  const [whatsappLogs, setWhatsappLogs] = useState(MOCK_WHATSAPP_LOGS);

  // Active selected patient for detailed 360 view
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);

  // Patient Profile for Patient Portal
  const [currentPatientProfile, setCurrentPatientProfile] = useState(SEED_PATIENT_PROFILE);
  const [familyMembers, setFamilyMembers] = useState(SEED_FAMILY_MEMBERS);
  const [activeDependentId, setActiveDependentId] = useState('dep-0');
  const [patientVitalsHistory, setPatientVitalsHistory] = useState(SEED_PATIENT_VITALS_HISTORY);
  const [patientAllergies, setPatientAllergies] = useState(SEED_PATIENT_ALLERGIES);
  const [patientVaccines, setPatientVaccines] = useState(SEED_PATIENT_VACCINES);
  const [prescriptions, setPrescriptions] = useState(SEED_PRESCRIPTIONS);

  const setShowDummyData = async (val) => {
    setShowDummyDataState(val);
    try {
      await SecureStore.setItemAsync(DUMMY_DATA_STORAGE_KEY, val ? 'true' : 'false');
    } catch (e) {
      console.log('Error writing showDummyData to SecureStore:', e);
    }

    if (val) {
      // Restore seed data
      setPatientVitalsHistory(SEED_PATIENT_VITALS_HISTORY);
      setPatientAllergies(SEED_PATIENT_ALLERGIES);
      setPatientVaccines(SEED_PATIENT_VACCINES);
      setPrescriptions(SEED_PRESCRIPTIONS);
      setFamilyMembers(SEED_FAMILY_MEMBERS);
      if (!loggedInUser) {
        setCurrentPatientProfile(SEED_PATIENT_PROFILE);
      }
    } else {
      // Clean state for real patient inputs
      setPatientVitalsHistory([]);
      setPatientAllergies([]);
      setPatientVaccines([]);
      setPrescriptions([]);
      const name = loggedInUser?.displayName || loggedInUser?.name || (loggedInUser?.email ? loggedInUser.email.split('@')[0] : 'Self');
      setFamilyMembers([{ id: 'dep-0', name, relation: 'Primary Patient', uhid: loggedInUser?.uhid || 'CUX-889102', age: loggedInUser?.age || 28, bloodGroup: loggedInUser?.bloodGroup || 'O+' }]);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const session = await getSession();
      if (session?.user) {
        const u = session.user;
        setLoggedInUser(u);
        const name = u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'Deepika Joshi');
        const uhidCode = u.uhid || (u._id ? `CUX-${String(u._id).slice(-6).toUpperCase()}` : 'CUX-889102');

        setCurrentPatientProfile((prev) => ({
          ...prev,
          id: u._id || u.id || prev.id,
          sku: u.sku || prev.sku,
          displayName: name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          avatar: u.avatar || u.photo || u.image || null,
          uhid: uhidCode,
          gender: u.gender || prev.gender,
          age: u.age || prev.age,
          bloodGroup: u.bloodGroup || prev.bloodGroup,
        }));

        // Dynamically associate initial patient records with logged-in user
        setPrescriptions((prev) =>
          prev.map((p) => ({
            ...p,
            patientName: name,
          }))
        );

        setAppointments((prev) =>
          prev.map((a, idx) => (idx === 0 ? { ...a, patientName: name } : a))
        );
      }
    } catch (e) {
      console.log('Error hydrating user session:', e);
    }
  }, []);

  // Hydrate portal mode, user session, and dummy data setting from SecureStore
  useEffect(() => {
    async function hydrateInitial() {
      try {
        const stored = await AsyncStorage.getItem('devlomatix.curexa_portal_mode');
        if (stored === 'HOSPITAL' || stored === 'PATIENT') {
          setPortalModeState(stored);
        }
      } catch (e) {
        // ignore
      }

      try {
        const storedDummy = await SecureStore.getItemAsync(DUMMY_DATA_STORAGE_KEY);
        if (storedDummy !== null) {
          const isEnabled = storedDummy === 'true';
          setShowDummyDataState(isEnabled);
          if (!isEnabled) {
            setPatientVitalsHistory([]);
            setPatientAllergies([]);
            setPatientVaccines([]);
            setPrescriptions([]);
            setFamilyMembers([{ id: 'dep-0', name: 'Self', relation: 'Primary Patient', uhid: 'CUX-889102', age: 28, bloodGroup: 'O+' }]);
          }
        }
      } catch (e) {
        console.log('Error reading dummy data setting from SecureStore:', e);
      }

      await refreshSession();
    }
    hydrateInitial();
  }, [refreshSession]);

  const setPortalMode = async (newMode) => {
    setPortalModeState(newMode);
    try {
      await AsyncStorage.setItem('devlomatix.curexa_portal_mode', newMode);
    } catch (e) {
      // ignore
    }
  };

  const addVitalRecord = (vital) => {
    const newEntry = {
      id: `vh-${Date.now()}`,
      date: 'Just now',
      ...vital,
    };
    setPatientVitalsHistory((prev) => [newEntry, ...prev]);

    // Also update current vitals summary in currentPatientProfile
    setCurrentPatientProfile((prev) => {
      const updatedVitals = { ...prev.vitals, lastRecorded: 'Just now' };
      if (vital.metric.includes('Pressure')) updatedVitals.bp = vital.value;
      if (vital.metric.includes('Heart Rate')) updatedVitals.heartRate = `${vital.value} bpm`;
      if (vital.metric.includes('Oxygen')) updatedVitals.spo2 = `${vital.value}%`;
      if (vital.metric.includes('Temperature')) updatedVitals.temperature = `${vital.value} °F`;
      if (vital.metric.includes('Glucose') || vital.metric.includes('Sugar')) updatedVitals.glucose = `${vital.value} mg/dL`;
      if (vital.metric.includes('Weight')) {
        updatedVitals.weight = `${vital.value} kg`;
        const heightM = (parseFloat(prev.vitals.height) || 168) / 100;
        const bmiCalc = (parseFloat(vital.value) / (heightM * heightM)).toFixed(1);
        updatedVitals.bmi = bmiCalc;
      }
      if (vital.metric.includes('Waist')) updatedVitals.waist = `${vital.value} cm`;
      if (vital.metric.includes('Cholesterol')) updatedVitals.cholesterol = `${vital.value} mg/dL`;
      return { ...prev, vitals: updatedVitals };
    });
  };

  const addAllergy = (allergy) => {
    const item = { id: `alg-${Date.now()}`, ...allergy };
    setPatientAllergies((prev) => [item, ...prev]);
  };

  const removeAllergy = (id) => {
    setPatientAllergies((prev) => prev.filter((a) => a.id !== id));
  };

  const addVaccine = (vaccine) => {
    const item = { id: `vac-${Date.now()}`, ...vaccine };
    setPatientVaccines((prev) => [item, ...prev]);
  };

  const removeVaccine = (id) => {
    setPatientVaccines((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleDoseTaken = (rxId, medIndex, doseKey) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== rxId) return rx;
        const updatedMeds = [...rx.medicines];
        if (updatedMeds[medIndex]) {
          updatedMeds[medIndex] = {
            ...updatedMeds[medIndex],
            [doseKey]: !updatedMeds[medIndex][doseKey],
          };
        }
        return { ...rx, medicines: updatedMeds };
      })
    );
  };

  const addPrescriptionLocally = (newRx) => {
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  // Quick Action Modal states
  const [modalState, setModalState] = useState({
    addPatient: false,
    bookAppointment: false,
    admitBed: false,
    dispenseRx: false,
    createLabOrder: false,
    createInvoice: false,
  });

  const openModal = (modalName) => {
    setModalState((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModalState((prev) => ({ ...prev, [modalName]: false }));
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes, bRes, mRes, lRes, iRes, dRes] = await Promise.all([
        getPatients(),
        getAppointments(),
        getBeds(),
        getPharmacyData(),
        getLaboratoryOrders(),
        getBillingInvoices(),
        getDepartmentsAndDoctors(),
      ]);

      if (pRes?.patients) setPatients(pRes.patients);
      if (aRes?.appointments) setAppointments(aRes.appointments);
      if (bRes?.wards) setWards(bRes.wards);
      if (mRes?.medicines) setMedicines(mRes.medicines);
      if (lRes?.orders) setLabOrders(lRes.orders);
      if (iRes?.invoices) setInvoices(iRes.invoices);
      if (dRes?.departments) setDepartments(dRes.departments);
    } catch (err) {
      console.error('Error loading Curexa data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  const addPatientLocally = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const addAppointmentLocally = (newApt) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const addLabOrderLocally = (newOrder) => {
    setLabOrders((prev) => [newOrder, ...prev]);
  };

  const addInvoiceLocally = (newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const addHandoverLocally = (newHandover) => {
    setHandovers((prev) => [newHandover, ...prev]);
  };

  const addWhatsappLogLocally = (newLog) => {
    setWhatsappLogs((prev) => [newLog, ...prev]);
  };

  const updateTelemetryBedLocally = (bedId, updatedVitals) => {
    setTelemetryBeds((prev) =>
      prev.map((b) => (b.bedId === bedId ? { ...b, vitals: { ...b.vitals, ...updatedVitals } } : b))
    );
  };

  const value = {
    loading,
    portalMode,
    setPortalMode,
    hospitalInfo,
    selectedDepartment,
    setSelectedDepartment,
    patients,
    setPatients,
    appointments,
    setAppointments,
    wards,
    setWards,
    medicines,
    setMedicines,
    labOrders,
    setLabOrders,
    invoices,
    setInvoices,
    departments,
    setDepartments,
    telemetryBeds,
    setTelemetryBeds,
    handovers,
    setHandovers,
    onCallDoctors,
    setOnCallDoctors,
    whatsappLogs,
    setWhatsappLogs,
    selectedPatient,
    setSelectedPatient,
    showPatientDetail,
    setShowPatientDetail,
    viewPatientDetails,
    loggedInUser,
    refreshSession,
    currentPatientProfile,
    setCurrentPatientProfile,
    familyMembers,
    setFamilyMembers,
    activeDependentId,
    setActiveDependentId,
    patientVitalsHistory,
    setPatientVitalsHistory,
    addVitalRecord,
    patientAllergies,
    setPatientAllergies,
    addAllergy,
    removeAllergy,
    patientVaccines,
    setPatientVaccines,
    addVaccine,
    removeVaccine,
    prescriptions,
    setPrescriptions,
    addPrescriptionLocally,
    toggleDoseTaken,
    modalState,
    openModal,
    closeModal,
    loadAllData,
    addPatientLocally,
    addAppointmentLocally,
    addLabOrderLocally,
    addInvoiceLocally,
    addHandoverLocally,
    addWhatsappLogLocally,
    updateTelemetryBedLocally,
    showDummyData,
    setShowDummyData,
  };

  return <CurexaContext.Provider value={value}>{children}</CurexaContext.Provider>;
}

export function useCurexa() {
  const context = useContext(CurexaContext);
  if (!context) {
    throw new Error('useCurexa must be used within a CurexaProvider');
  }
  return context;
}
