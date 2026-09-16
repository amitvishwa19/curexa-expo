import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreen from '~/components/AppScreen';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

import UserStatusBar from '~/components/UserStatusBar';
import LogVitalsModal from '~/components/curexa/LogVitalsModal';
import AddAllergyVaccineModal from '~/components/curexa/AddAllergyVaccineModal';
import {
  AddPatientModal,
  BookAppointmentModal,
  CreatePrescriptionModal,
  CreateLabOrderModal,
  CreateInvoiceModal,
  PatientDetailModal,
} from '~/components/curexa/CurexaModals';

export default function CurexaOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const {
    portalMode,
    currentPatientProfile,
    familyMembers,
    activeDependentId,
    setActiveDependentId,
    patientVitalsHistory,
    prescriptions,
    toggleDoseTaken,
    patients,
    appointments,
    wards,
    departments,
    invoices,
    labOrders,
    selectedPatient,
    showPatientDetail,
    setShowPatientDetail,
    viewPatientDetails,
    addPatientLocally,
    addAppointmentLocally,
    addLabOrderLocally,
    addInvoiceLocally,
  } = useCurexa();

  const isPatient = portalMode === 'PATIENT';

  // Hospital modal states
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showBookVisit, setShowBookVisit] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Patient modal states
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [showLogVitalsModal, setShowLogVitalsModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedRxPdf, setSelectedRxPdf] = useState(null);
  const [selectedLabReport, setSelectedLabReport] = useState(null);

  // Computed metrics for Hospital
  const totalBeds = wards.reduce((sum, w) => sum + (w.totalBeds || 0), 0) || 40;
  const occupiedBeds = wards.reduce((sum, w) => sum + (w.occupiedBeds || 0), 0) || 30;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const todayVisits = appointments.length || 4;
  const totalRev = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0) || 1650.0;
  const pendingLabs = labOrders.filter((l) => l.status !== 'COMPLETED').length || 2;

  const quickStats = [
    {
      label: 'IPD Bed Occupancy',
      value: `${occupiedBeds}/${totalBeds}`,
      badge: `${occupancyRate}% Full`,
      icon: 'bed-outline',
      color: '#059669',
      tone: 'bg-emerald-500/15',
      route: '/beds',
    },
    {
      label: "Today's OPD Queue",
      value: `${todayVisits}`,
      badge: 'Live',
      icon: 'calendar-outline',
      color: '#0284c7',
      tone: 'bg-sky-500/15',
      route: '/(tabs)/appointments',
    },
    {
      label: 'Collected Revenue',
      value: `$${totalRev.toFixed(0)}`,
      badge: 'Today',
      icon: 'wallet-outline',
      color: '#d97706',
      tone: 'bg-amber-500/15',
      route: '/billing',
    },
    {
      label: 'Pending Diagnostics',
      value: `${pendingLabs}`,
      badge: 'Active',
      icon: 'flask-outline',
      color: '#06b6d4',
      tone: 'bg-cyan-500/15',
      route: '/laboratory',
    },
  ];

  const quickActions = [
    { label: 'Add Patient', icon: 'person-add-outline', color: '#059669', action: () => setShowAddPatient(true) },
    { label: 'Book OPD', icon: 'calendar-outline', color: '#0284c7', action: () => setShowBookVisit(true) },
    { label: 'Write e-Rx', icon: 'document-text-outline', color: '#8b5cf6', action: () => setShowRxModal(true) },
    { label: 'Order Lab', icon: 'flask-outline', color: '#06b6d4', action: () => setShowLabModal(true) },
    { label: 'Quick Bill', icon: 'receipt-outline', color: '#f59e0b', action: () => setShowInvoiceModal(true) },
    { label: 'Bed Grid', icon: 'bed-outline', color: '#10b981', action: () => router.push('/beds') },
    { label: 'Workflow', icon: 'git-network-outline', color: '#ec4899', action: () => router.push('/workflow') },
    { label: 'Reports', icon: 'bar-chart-outline', color: '#6366f1', action: () => router.push('/reports') },
  ];

  // Patient active token data
  const myNextAppointment = appointments.find((a) => a.patientName === currentPatientProfile.displayName) || appointments[0];
  const patientPrescriptions = prescriptions.filter(
    (p) => p.patientName === currentPatientProfile.displayName || p.patientSku === currentPatientProfile.sku
  );
  const activeRx = patientPrescriptions[0] || prescriptions[0];

  // Dose calculation
  let totalDosesToday = 0;
  let takenDosesToday = 0;
  if (activeRx && activeRx.medicines) {
    activeRx.medicines.forEach((m) => {
      if (m.dosage.includes('1 -') || m.dosage.includes('1-')) {
        totalDosesToday += 1;
        if (m.takenMorning) takenDosesToday += 1;
      }
      if (m.dosage.includes('- 1 -') || m.dosage.includes('-1-')) {
        totalDosesToday += 1;
        if (m.takenAfternoon) takenDosesToday += 1;
      }
      if (m.dosage.includes('- 1') || m.dosage.includes('-1')) {
        totalDosesToday += 1;
        if (m.takenNight) takenDosesToday += 1;
      }
    });
  }
  const adherencePercent = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;

  const handleSosCall = () => {
    Alert.alert(
      '🚨 24x7 Emergency Ambulance',
      'Calling Curexa Rapid Response Trauma Center & Dispatching GPS Location...',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911 / EMS', onPress: () => Alert.alert('Dispatched', 'Emergency team has been notified.') },
      ]
    );
  };

  const handleDownloadPdf = (title) => {
    Alert.alert('📥 Download Ready', `${title} has been downloaded and verified with Curexa Digital Signatures.`);
  };

  return (
    <AppScreen>
      <UserStatusBar
        rightAction={
          isPatient ? (
            <Pressable
              onPress={handleSosCall}
              className="flex-row items-center gap-1 rounded-[10px] bg-rose-600 px-2 py-1 shadow-sm"
            >
              <Ionicons name="call" size={11} color="#ffffff" />
              <Text className="text-[10px] font-bold text-white">SOS</Text>
            </Pressable>
          ) : null
        }
      />

      {isPatient ? (
        /* ========================================================================= */
        /*                       PATIENT HEALTH HUB VIEW                             */
        /* ========================================================================= */
        <ScrollView
          className="flex-1 px-3 pt-2"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Family Dependents Selector Strip */}
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[10.5px] font-bold uppercase tracking-[0.8px] text-sky-600">
              Active Member Profile
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-1">
                {familyMembers?.map((m) => {
                  const isSel = activeDependentId === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setActiveDependentId(m.id)}
                      className={`rounded-full px-2.5 py-0.5 border ${
                        isSel
                          ? 'bg-sky-600 border-sky-600 shadow-sm'
                          : `${palette.surfaceInset} border-gray-200/15`
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          isSel ? 'text-white' : palette.text
                        }`}
                      >
                        {m.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Digital Health ID Card Banner */}
          <Pressable
            onPress={() => setShowHealthCardModal(true)}
            className="mb-2.5 overflow-hidden rounded-[18px] bg-sky-600 p-3.5 shadow-md"
            style={{ backgroundColor: '#0284c7' }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                </View>
                <Text className="text-[11px] font-bold uppercase tracking-[1px] text-white/90">
                  CUREXA DIGITAL HEALTH ID
                </Text>
              </View>
              <View className="rounded-full bg-white/20 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-white">VERIFIED</Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <View>
                <Text className="text-[19px] font-bold text-white">{currentPatientProfile.displayName}</Text>
                <Text className="text-[12px] text-sky-100">
                  UHID: {currentPatientProfile.uhid} • Age: {currentPatientProfile.age} • {currentPatientProfile.gender}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="rounded-[8px] bg-white/20 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-white">Blood: {currentPatientProfile.bloodGroup}</Text>
                  </View>
                  <View className="rounded-[8px] bg-white/20 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-white">Insurance: Active (80%)</Text>
                  </View>
                </View>
              </View>

              <View className="items-center">
                <View className="h-12 w-12 items-center justify-center rounded-[12px] bg-white p-1">
                  <Ionicons name="qr-code" size={36} color="#0284c7" />
                </View>
                <Text className="mt-1 text-[9px] font-semibold text-white/80">Tap for QR</Text>
              </View>
            </View>
          </Pressable>

          {/* Live OPD Token Alert Card */}
          {myNextAppointment && (
            <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-emerald-600">
                    Live OPD Token Queue
                  </Text>
                </View>
                <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-emerald-700">1 Ahead • ~8 Mins Wait</Text>
                </View>
              </View>

              <View className={`mt-2.5 flex-row items-center justify-between rounded-[14px] p-3 ${palette.surfaceInset}`}>
                <View className="flex-row items-center gap-2.5">
                  <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-emerald-500/20">
                    <Text className="text-[16px] font-extrabold text-emerald-700">
                      {myNextAppointment.token || 'A-01'}
                    </Text>
                    <Text className="text-[8px] font-bold text-emerald-600 uppercase">Token</Text>
                  </View>
                  <View>
                    <Text className={`text-[13px] font-bold ${palette.text}`}>{myNextAppointment.doctorName}</Text>
                    <Text className={`text-[10.5px] ${palette.textMuted}`}>
                      {myNextAppointment.specialty} • Cabin 3B (2nd Floor)
                    </Text>
                    <Text className="text-[10px] font-bold text-sky-600 mt-0.5">Slot: {myNextAppointment.timeSlot}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push('/(tabs)/appointments')}
                  className="rounded-[10px] bg-emerald-600 px-3 py-1.5 shadow-sm"
                >
                  <Text className="text-[11px] font-bold text-white">Track Queue</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Quick Patient Services Grid */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[0.8px] text-sky-600">
              Patient Care & Services
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: 'Book OPD Slot', icon: 'calendar-outline', color: '#0284c7', action: () => setShowBookVisit(true) },
                { label: 'Telemedicine Video', icon: 'videocam-outline', color: '#2563eb', action: () => router.push('/telemedicine') },
                { label: 'Log Vitals', icon: 'pulse-outline', color: '#0d9488', action: () => setShowLogVitalsModal(true) },
                { label: 'AI Health Triage', icon: 'sparkles-outline', color: '#059669', action: () => router.push('/ai-assistant') },
                { label: 'Lab Reports', icon: 'flask-outline', color: '#06b6d4', action: () => router.push('/laboratory') },
                { label: 'Bedside QR Scan', icon: 'qr-code-outline', color: '#8b5cf6', action: () => router.push('/scanner') },
                { label: 'My Invoices', icon: 'receipt-outline', color: '#f59e0b', action: () => router.push('/billing') },
                { label: '24x7 Ambulance', icon: 'car-outline', color: '#e11d48', action: handleSosCall },
              ].map((act, idx) => (
                <Pressable
                  key={idx}
                  onPress={act.action}
                  className={`w-[22%] flex-1 min-w-[70px] items-center rounded-[12px] p-2 ${palette.surfaceInset}`}
                >
                  <View
                    style={{ backgroundColor: `${act.color}15` }}
                    className="h-8 w-8 items-center justify-center rounded-[10px] mb-1"
                  >
                    <Ionicons name={act.icon} size={16} color={act.color} />
                  </View>
                  <Text className={`text-[10px] font-bold text-center ${palette.text}`} numberOfLines={1}>
                    {act.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Today's Active Prescriptions & Dosage Checklist */}
          {activeRx && (
            <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
              <View className="flex-row items-center justify-between mb-1.5">
                <View>
                  <Text className={`text-[13px] font-bold ${palette.text}`}>Today's Medications & Doses</Text>
                  <Text className={`text-[10px] ${palette.textMuted}`}>
                    {activeRx.doctorName} • {activeRx.diagnosis}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedRxPdf(activeRx)}
                  className="flex-row items-center gap-1 rounded-[8px] bg-purple-500/15 px-2 py-1"
                >
                  <Ionicons name="document-text-outline" size={13} color="#8b5cf6" />
                  <Text className="text-[10px] font-bold text-purple-700">View e-Rx</Text>
                </Pressable>
              </View>

              {/* Adherence Progress Bar */}
              <View className={`mb-2 rounded-[10px] p-2 ${palette.surfaceInset}`}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`text-[10px] font-bold ${palette.text}`}>
                    Daily Adherence: {takenDosesToday}/{totalDosesToday || 3} Taken
                  </Text>
                  <Text className="text-[10px] font-bold text-emerald-600">{adherencePercent}% Score</Text>
                </View>
                <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <View
                    style={{ width: `${adherencePercent}%` }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </View>
              </View>

              <View className="gap-2">
                {activeRx.medicines.map((med, medIdx) => (
                  <View
                    key={medIdx}
                    className={`rounded-[12px] p-2.5 flex-row items-center justify-between ${palette.surfaceInset}`}
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="medical" size={13} color="#0284c7" />
                        <Text className={`text-[12px] font-bold ${palette.text}`} numberOfLines={1}>
                          {med.name}
                        </Text>
                      </View>
                      <Text className={`text-[10px] mt-0.5 ${palette.textMuted}`}>
                        {med.timing} • {med.duration} • Dosage: {med.dosage}
                      </Text>
                    </View>

                    {/* Dose Checkbox Toggles */}
                    <View className="flex-row items-center gap-1.5">
                      {(med.dosage.includes('1 -') || med.dosage.includes('1-')) && (
                        <Pressable
                          onPress={() => toggleDoseTaken(activeRx.id, medIdx, 'takenMorning')}
                          className={`rounded-[8px] px-2 py-1 flex-row items-center gap-1 ${
                            med.takenMorning ? 'bg-emerald-600' : 'bg-gray-500/20'
                          }`}
                        >
                          <Ionicons
                            name={med.takenMorning ? 'checkmark-circle' : 'time-outline'}
                            size={12}
                            color={med.takenMorning ? '#ffffff' : palette.textMutedColor}
                          />
                          <Text
                            className={`text-[9.5px] font-bold ${
                              med.takenMorning ? 'text-white' : palette.textMuted
                            }`}
                          >
                            Morning
                          </Text>
                        </Pressable>
                      )}

                      {(med.dosage.includes('- 1 -') || med.dosage.includes('-1-')) && (
                        <Pressable
                          onPress={() => toggleDoseTaken(activeRx.id, medIdx, 'takenAfternoon')}
                          className={`rounded-[8px] px-2 py-1 flex-row items-center gap-1 ${
                            med.takenAfternoon ? 'bg-emerald-600' : 'bg-gray-500/20'
                          }`}
                        >
                          <Ionicons
                            name={med.takenAfternoon ? 'checkmark-circle' : 'time-outline'}
                            size={12}
                            color={med.takenAfternoon ? '#ffffff' : palette.textMutedColor}
                          />
                          <Text
                            className={`text-[9.5px] font-bold ${
                              med.takenAfternoon ? 'text-white' : palette.textMuted
                            }`}
                          >
                            Noon
                          </Text>
                        </Pressable>
                      )}

                      {(med.dosage.includes('- 1') || med.dosage.includes('-1')) && (
                        <Pressable
                          onPress={() => toggleDoseTaken(activeRx.id, medIdx, 'takenNight')}
                          className={`rounded-[8px] px-2 py-1 flex-row items-center gap-1 ${
                            med.takenNight ? 'bg-emerald-600' : 'bg-gray-500/20'
                          }`}
                        >
                          <Ionicons
                            name={med.takenNight ? 'checkmark-circle' : 'time-outline'}
                            size={12}
                            color={med.takenNight ? '#ffffff' : palette.textMutedColor}
                          />
                          <Text
                            className={`text-[9.5px] font-bold ${
                              med.takenNight ? 'text-white' : palette.textMuted
                            }`}
                          >
                            Night
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 8-Parameter Health Metrics & Vitals Summary (from HealthyFine) */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className={`text-[12px] font-bold uppercase tracking-[0.8px] text-teal-600`}>
                  Daily Health Metrics & Vitals
                </Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>
                  {currentPatientProfile.vitals.lastRecorded}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowLogVitalsModal(true)}
                className="flex-row items-center gap-1 rounded-[8px] bg-teal-500/20 px-2 py-1"
              >
                <Ionicons name="add" size={13} color="#0d9488" />
                <Text className="text-[10px] font-bold text-teal-700">Log Vitals</Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {[
                { label: 'Blood Pressure', value: currentPatientProfile.vitals.bp, sub: 'Optimal (120/80)', icon: 'speedometer-outline', color: '#0284c7', tone: 'bg-sky-500/15' },
                { label: 'Blood Sugar (Fasting)', value: currentPatientProfile.vitals.glucose, sub: 'Normal (<100 mg/dL)', icon: 'water-outline', color: '#059669', tone: 'bg-emerald-500/15' },
                { label: 'Heart Rate', value: currentPatientProfile.vitals.heartRate, sub: 'Resting Pulse', icon: 'heart-outline', color: '#ef4444', tone: 'bg-rose-500/15' },
                { label: 'Blood Oxygen (SpO2)', value: currentPatientProfile.vitals.spo2, sub: 'Optimal (98%)', icon: 'fitness-outline', color: '#06b6d4', tone: 'bg-cyan-500/15' },
                { label: 'Body Weight', value: currentPatientProfile.vitals.weight, sub: `BMI ${currentPatientProfile.vitals.bmi} • Normal`, icon: 'body-outline', color: '#8b5cf6', tone: 'bg-purple-500/15' },
                { label: 'Body Temperature', value: currentPatientProfile.vitals.temperature, sub: 'Normal (98.6 °F)', icon: 'thermometer-outline', color: '#f59e0b', tone: 'bg-amber-500/15' },
                { label: 'Waist Circumference', value: currentPatientProfile.vitals.waist, sub: 'Optimal Range', icon: 'resize-outline', color: '#ec4899', tone: 'bg-pink-500/15' },
                { label: 'Total Cholesterol', value: currentPatientProfile.vitals.cholesterol, sub: 'Desirable (<200)', icon: 'analytics-outline', color: '#6366f1', tone: 'bg-indigo-500/15' },
              ].map((v, i) => (
                <View key={i} className={`w-[48%] flex-1 min-w-[140px] rounded-[14px] p-2.5 ${palette.surfaceInset}`}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`text-[10px] font-medium ${palette.textMuted}`}>{v.label}</Text>
                    <View className={`h-6 w-6 items-center justify-center rounded-[8px] ${v.tone}`}>
                      <Ionicons name={v.icon} size={13} color={v.color} />
                    </View>
                  </View>
                  <Text className={`text-[15px] font-bold ${palette.text}`}>{v.value}</Text>
                  <Text className="text-[9px] font-medium text-teal-600">{v.sub}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Diagnostic Lab Tests & Downloadable Reports */}
          <View className={`mb-3 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className={`text-[13px] font-bold ${palette.text}`}>Diagnostic & Lab Reports</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>Curexa Central Laboratory</Text>
              </View>
              <Pressable
                onPress={() => router.push('/laboratory')}
                className="flex-row items-center gap-0.5"
              >
                <Text className="text-[11px] font-semibold text-emerald-600">All Labs</Text>
                <Ionicons name="chevron-forward" size={12} color="#059669" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              {[
                { id: 'LR-901', name: 'Comprehensive Blood Panel (CBC + Lipid)', date: 'Today, 08:30 AM', status: 'READY', doctor: 'Dr. Rajesh Sharma' },
                { id: 'LR-902', name: 'Non-Contrast Brain CT Scan Report', date: 'Yesterday', status: 'IN_PROCESS', doctor: 'Dr. Amit Malhotra' },
              ].map((rep, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedLabReport(rep)}
                  className={`flex-row items-center justify-between rounded-[12px] p-2.5 ${palette.surfaceInset}`}
                >
                  <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-cyan-500/15">
                      <Ionicons name="flask" size={15} color="#06b6d4" />
                    </View>
                    <View>
                      <Text className={`text-[12px] font-bold ${palette.text}`}>{rep.name}</Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        {rep.doctor} • {rep.date}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        rep.status === 'READY' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-bold ${
                          rep.status === 'READY' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {rep.status === 'READY' ? 'Ready (PDF)' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        /* HOSPITAL COMMAND CENTER VIEW */
        <ScrollView
          className="flex-1 px-3 pt-2"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hospital Banner */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[11px] font-bold uppercase tracking-[1px] text-emerald-600">
                    CUREXA SUPER SPECIALTY
                  </Text>
                  <View className="rounded-full bg-emerald-500/20 px-1.5 py-0.5">
                    <Text className="text-[9px] font-bold text-emerald-600">MAIN CAMPUS</Text>
                  </View>
                </View>
                <Text className={`mt-0.5 text-[18px] font-bold ${palette.text}`}>
                  Emergency & Clinical Operations
                </Text>
                <Text className={`text-[11px] ${palette.textMuted}`}>
                  Tertiary Care • 40 Beds • 5 Specialties Active
                </Text>
              </View>
            </View>
          </View>

          {/* 4 Core KPI Cards */}
          <View className="mb-2.5 flex-row flex-wrap gap-2">
            {quickStats.map((st, idx) => (
              <Pressable
                key={idx}
                onPress={() => router.push(st.route)}
                className={`w-[48%] flex-1 rounded-[16px] p-2.5 shadow-sm ${palette.surface}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className={`h-7 w-7 items-center justify-center rounded-[10px] ${st.tone}`}>
                    <Ionicons name={st.icon} size={15} color={st.color} />
                  </View>
                  <View className={`rounded-full px-1.5 py-0.5 ${st.tone}`}>
                    <Text style={{ color: st.color }} className="text-[9px] font-bold">
                      {st.badge}
                    </Text>
                  </View>
                </View>
                <Text className={`mt-2 text-[17px] font-bold ${palette.text}`}>{st.value}</Text>
                <Text className={`text-[10px] font-medium ${palette.textMuted}`}>{st.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Quick Clinical Launchpad */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <Text className={`mb-2 text-[12px] font-bold uppercase tracking-[0.8px] text-emerald-600`}>
              Quick Clinical Actions
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {quickActions.map((qa, i) => (
                <Pressable
                  key={i}
                  onPress={qa.action}
                  className={`w-[22%] flex-1 min-w-[70px] items-center rounded-[12px] p-2 ${palette.surfaceInset}`}
                >
                  <View
                    style={{ backgroundColor: `${qa.color}20` }}
                    className="h-8 w-8 items-center justify-center rounded-[10px] mb-1"
                  >
                    <Ionicons name={qa.icon} size={16} color={qa.color} />
                  </View>
                  <Text className={`text-[10px] font-bold text-center ${palette.text}`} numberOfLines={1}>
                    {qa.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Advanced Clinical Suite Hub */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-emerald-600">
                Advanced Clinical Suite
              </Text>
              <View className="rounded-full bg-emerald-500/20 px-2 py-0.5">
                <Text className="text-[9px] font-bold text-emerald-700">6 TOOLS ACTIVE</Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {[
                { label: 'AI Clinical & Triage', sub: 'Voice e-Rx & Triage', icon: 'sparkles', route: '/ai-assistant', color: '#059669', tone: 'bg-emerald-500/15' },
                { label: 'Bedside Scanner', sub: 'Wristband & Barcode', icon: 'qr-code', route: '/scanner', color: '#0d9488', tone: 'bg-teal-500/15' },
                { label: 'ICU Telemetry', sub: 'Live ECG & Vitals', icon: 'heart', route: '/telemetry', color: '#e11d48', tone: 'bg-rose-500/15' },
                { label: 'Telemedicine OPD', sub: 'Encrypted Video Room', icon: 'videocam', route: '/telemedicine', color: '#2563eb', tone: 'bg-blue-500/15' },
                { label: 'WhatsApp Automation', sub: 'Patient Alerts', icon: 'logo-whatsapp', route: '/messaging-automation', color: '#16a34a', tone: 'bg-green-500/15' },
                { label: 'Shift Roster', sub: 'SBAR Handovers', icon: 'swap-horizontal', route: '/roster', color: '#9333ea', tone: 'bg-purple-500/15' },
              ].map((tool, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => router.push(tool.route)}
                  className={`w-[48%] flex-1 min-w-[140px] rounded-[14px] p-2.5 ${palette.surfaceInset}`}
                >
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className={`h-7 w-7 items-center justify-center rounded-[8px] ${tool.tone}`}>
                      <Ionicons name={tool.icon} size={15} color={tool.color} />
                    </View>
                    <Text className={`text-[11.5px] font-bold ${palette.text}`} numberOfLines={1}>
                      {tool.label}
                    </Text>
                  </View>
                  <Text className={`text-[9.5px] ${palette.textMuted}`} numberOfLines={1}>
                    {tool.sub}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Live OPD Schedule Strip */}
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="mb-2 flex-row items-center justify-between">
              <View>
                <Text className={`text-[13px] font-bold ${palette.text}`}>Live OPD Visits Queue</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>Tokens & In-Consultation Queue</Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/appointments')}
                className="flex-row items-center gap-0.5"
              >
                <Text className="text-[11px] font-semibold text-emerald-600">View All</Text>
                <Ionicons name="chevron-forward" size={12} color="#059669" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              {appointments.slice(0, 3).map((apt) => (
                <Pressable
                  key={apt.id}
                  onPress={() => router.push('/(tabs)/appointments')}
                  className={`flex-row items-center justify-between rounded-[12px] p-2.5 ${palette.surfaceInset}`}
                >
                  <View className="flex-row items-center gap-2">
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-sky-500/20">
                      <Text className="text-[10px] font-bold text-sky-700">{apt.token || 'OPD'}</Text>
                    </View>
                    <View>
                      <Text className={`text-[12px] font-bold ${palette.text}`}>{apt.patientName}</Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        {apt.doctorName} • {apt.timeSlot}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      apt.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/20'
                        : apt.status === 'COMPLETED'
                        ? 'bg-emerald-500/20'
                        : 'bg-sky-500/20'
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-bold ${
                        apt.status === 'IN_PROGRESS'
                          ? 'text-amber-700'
                          : apt.status === 'COMPLETED'
                          ? 'text-emerald-700'
                          : 'text-sky-700'
                      }`}
                    >
                      {apt.status}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Admitted Patients EMR Snapshot */}
          <View className={`mb-3 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="mb-2 flex-row items-center justify-between">
              <View>
                <Text className={`text-[13px] font-bold ${palette.text}`}>Admitted Inpatients (IPD)</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>Live Ward & Vitals Monitoring</Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/patients')}
                className="flex-row items-center gap-0.5"
              >
                <Text className="text-[11px] font-semibold text-emerald-600">All Patients</Text>
                <Ionicons name="chevron-forward" size={12} color="#059669" />
              </Pressable>
            </View>

            <View className="gap-1.5">
              {patients.slice(0, 3).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => viewPatientDetails(p)}
                  className={`flex-row items-center justify-between rounded-[12px] p-2.5 ${palette.surfaceInset}`}
                >
                  <View className="flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/15">
                      <Ionicons name="person" size={15} color="#059669" />
                    </View>
                    <View>
                      <View className="flex-row items-center gap-1.5">
                        <Text className={`text-[12px] font-bold ${palette.text}`}>
                          {p.displayName || p.name}
                        </Text>
                        <View className="rounded bg-emerald-500/15 px-1">
                          <Text className="text-[9px] font-bold text-emerald-700">{p.bloodGroup || 'O+'}</Text>
                        </View>
                      </View>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        {p.ward || 'General'} • {p.vitals?.bp ? `BP: ${p.vitals.bp}` : 'Vitals Recorded'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] font-bold text-emerald-600">{p.status || 'Stable'}</Text>
                    <Text className={`text-[9px] ${palette.textMuted}`}>Tap for EMR</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Digital Health ID Card Modal */}
      <Modal
        visible={showHealthCardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHealthCardModal(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <Pressable className="absolute inset-0" onPress={() => setShowHealthCardModal(false)} />
          <View
            className={`rounded-t-[24px] p-4 ${palette.surface}`}
            style={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-200/15">
              <Text className={`text-[15px] font-bold ${palette.text}`}>Digital Health Pass</Text>
              <Pressable onPress={() => setShowHealthCardModal(false)} className={`rounded-full p-1.5 ${palette.surfaceAlt}`}>
                <Ionicons name="close" size={16} color={palette.textMutedColor} />
              </Pressable>
            </View>

            <View className="my-4 items-center rounded-[18px] bg-sky-600 p-5 shadow-lg">
              <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-sky-100">
                CUREXA SUPER SPECIALTY HOSPITAL
              </Text>
              <Text className="mt-1 text-[20px] font-extrabold text-white">{currentPatientProfile.displayName}</Text>
              <Text className="text-[12px] text-sky-100">UHID: {currentPatientProfile.uhid}</Text>

              <View className="my-4 rounded-[14px] bg-white p-3 shadow">
                <Ionicons name="qr-code" size={120} color="#0284c7" />
              </View>

              <View className="w-full flex-row justify-around rounded-[12px] bg-white/20 p-2">
                <View className="items-center">
                  <Text className="text-[9px] text-sky-100 uppercase">Blood</Text>
                  <Text className="text-[12px] font-bold text-white">{currentPatientProfile.bloodGroup}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-sky-100 uppercase">DOB</Text>
                  <Text className="text-[12px] font-bold text-white">1988-04-12</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-sky-100 uppercase">Emergency</Text>
                  <Text className="text-[12px] font-bold text-white">{currentPatientProfile.emergencyContact.phone}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  setShowHealthCardModal(false);
                  Alert.alert('Saved', 'Digital Health Pass saved to your device.');
                }}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-sky-600 py-2.5"
              >
                <Ionicons name="download-outline" size={16} color="#ffffff" />
                <Text className="text-[12px] font-bold text-white">Save to Wallet / PDF</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowHealthCardModal(false)}
                className={`rounded-[12px] px-4 py-2.5 ${palette.surfaceInset}`}
              >
                <Text className={`text-[12px] font-medium ${palette.text}`}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* e-Rx PDF View Modal */}
      {selectedRxPdf && (
        <Modal
          visible={!!selectedRxPdf}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRxPdf(null)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <Pressable className="absolute inset-0" onPress={() => setSelectedRxPdf(null)} />
            <View
              className={`rounded-t-[24px] p-4 ${palette.surface}`}
              style={{ paddingBottom: Math.max(insets.bottom, 28) + 24, maxHeight: '85%' }}
            >
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-200/15">
                <Text className={`text-[15px] font-bold ${palette.text}`}>Official e-Prescription (e-Rx)</Text>
                <Pressable onPress={() => setSelectedRxPdf(null)} className={`rounded-full p-1.5 ${palette.surfaceAlt}`}>
                  <Ionicons name="close" size={16} color={palette.textMutedColor} />
                </Pressable>
              </View>

              <ScrollView className="my-3" showsVerticalScrollIndicator={false}>
                <View className={`rounded-[16px] p-3.5 border ${palette.border} ${palette.surfaceInset}`}>
                  <View className="flex-row items-center justify-between border-b border-gray-200/20 pb-2 mb-2">
                    <View>
                      <Text className="text-[13px] font-extrabold text-emerald-600">CUREXA HEALTH SYSTEM</Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        Prescribing: {selectedRxPdf.doctorName}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-[10px] font-bold ${palette.text}`}>Rx: {selectedRxPdf.id}</Text>
                      <Text className={`text-[9px] ${palette.textMuted}`}>{selectedRxPdf.prescribedAt}</Text>
                    </View>
                  </View>

                  <Text className={`text-[11px] font-bold ${palette.text} mb-1`}>
                    Patient: {selectedRxPdf.patientName} (UHID: CUX-889102)
                  </Text>
                  <Text className={`text-[10px] ${palette.textMuted} mb-3`}>
                    Diagnosis: {selectedRxPdf.diagnosis}
                  </Text>

                  <Text className="text-[11px] font-bold text-emerald-600 uppercase mb-1.5">
                    Rx Prescribed Medications
                  </Text>
                  <View className="gap-2">
                    {selectedRxPdf.medicines.map((m, idx) => (
                      <View key={idx} className={`rounded-[10px] p-2 bg-white/60 dark:bg-black/20`}>
                        <Text className={`text-[12px] font-bold ${palette.text}`}>{m.name}</Text>
                        <Text className={`text-[10px] ${palette.textMuted}`}>
                          Dosage: {m.dosage} • {m.timing} • Duration: {m.duration}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-4 pt-2 border-t border-gray-200/20 flex-row items-center justify-between">
                    <Text className={`text-[9px] ${palette.textMuted}`}>Digital Signature Hash: CUX-SIG-991209</Text>
                    <View className="rounded bg-emerald-500/15 px-1.5 py-0.5">
                      <Text className="text-[9px] font-bold text-emerald-700">VERIFIED RX</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    handleDownloadPdf('Prescription (PDF)');
                    setSelectedRxPdf(null);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-purple-600 py-2.5"
                >
                  <Ionicons name="download-outline" size={16} color="#ffffff" />
                  <Text className="text-[12px] font-bold text-white">Download PDF</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedRxPdf(null)}
                  className={`rounded-[12px] px-4 py-2.5 ${palette.surfaceInset}`}
                >
                  <Text className={`text-[12px] font-medium ${palette.text}`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Lab Report View Modal */}
      {selectedLabReport && (
        <Modal
          visible={!!selectedLabReport}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedLabReport(null)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <Pressable className="absolute inset-0" onPress={() => setSelectedLabReport(null)} />
            <View
              className={`rounded-t-[24px] p-4 ${palette.surface}`}
              style={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
            >
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-200/15">
                <Text className={`text-[15px] font-bold ${palette.text}`}>Diagnostic Report Details</Text>
                <Pressable onPress={() => setSelectedLabReport(null)} className={`rounded-full p-1.5 ${palette.surfaceAlt}`}>
                  <Ionicons name="close" size={16} color={palette.textMutedColor} />
                </Pressable>
              </View>

              <View className={`my-3 rounded-[16px] p-3.5 border ${palette.border} ${palette.surfaceInset}`}>
                <Text className={`text-[13px] font-bold ${palette.text}`}>{selectedLabReport.name}</Text>
                <Text className={`text-[10px] ${palette.textMuted} mb-2`}>
                  Report ID: {selectedLabReport.id} • Date: {selectedLabReport.date}
                </Text>

                <View className="gap-1.5 mb-2">
                  <View className="flex-row items-center justify-between p-1.5 rounded bg-white/60 dark:bg-black/20">
                    <Text className={`text-[11px] font-medium ${palette.text}`}>Hemoglobin (Hb)</Text>
                    <Text className="text-[11px] font-bold text-emerald-600">13.8 g/dL (Normal)</Text>
                  </View>
                  <View className="flex-row items-center justify-between p-1.5 rounded bg-white/60 dark:bg-black/20">
                    <Text className={`text-[11px] font-medium ${palette.text}`}>Platelet Count</Text>
                    <Text className="text-[11px] font-bold text-emerald-600">240,000 /µL (Normal)</Text>
                  </View>
                  <View className="flex-row items-center justify-between p-1.5 rounded bg-white/60 dark:bg-black/20">
                    <Text className={`text-[11px] font-medium ${palette.text}`}>Total Cholesterol</Text>
                    <Text className="text-[11px] font-bold text-amber-600">188 mg/dL (Borderline)</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    handleDownloadPdf('Lab Report (PDF)');
                    setSelectedLabReport(null);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-cyan-600 py-2.5"
                >
                  <Ionicons name="download-outline" size={16} color="#ffffff" />
                  <Text className="text-[12px] font-bold text-white">Download Full Lab PDF</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedLabReport(null)}
                  className={`rounded-[12px] px-4 py-2.5 ${palette.surfaceInset}`}
                >
                  <Text className={`text-[12px] font-medium ${palette.text}`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Patient Vitals & Records Modals */}
      <LogVitalsModal
        visible={showLogVitalsModal}
        onClose={() => setShowLogVitalsModal(false)}
      />
      <AddAllergyVaccineModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
      />

      {/* Hospital Modals */}
      <AddPatientModal
        visible={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onSave={(newP) => addPatientLocally(newP)}
      />
      <BookAppointmentModal
        visible={showBookVisit}
        onClose={() => setShowBookVisit(false)}
        defaultPatientName={currentPatientProfile.displayName}
        onSave={(newApt) => addAppointmentLocally(newApt)}
      />
      <CreatePrescriptionModal
        visible={showRxModal}
        onClose={() => setShowRxModal(false)}
      />
      <CreateLabOrderModal
        visible={showLabModal}
        onClose={() => setShowLabModal(false)}
        onSave={(newOrder) => addLabOrderLocally(newOrder)}
      />
      <CreateInvoiceModal
        visible={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onSave={(newInv) => addInvoiceLocally(newInv)}
      />
      <PatientDetailModal
        patient={selectedPatient}
        visible={showPatientDetail}
        onClose={() => setShowPatientDetail(false)}
      />
    </AppScreen>
  );
}
