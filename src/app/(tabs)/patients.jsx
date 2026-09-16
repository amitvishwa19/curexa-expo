import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreen from '~/components/AppScreen';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';
import UserStatusBar from '~/components/UserStatusBar';
import LogVitalsModal from '~/components/curexa/LogVitalsModal';
import AddAllergyVaccineModal from '~/components/curexa/AddAllergyVaccineModal';
import { AddPatientModal, PatientDetailModal } from '~/components/curexa/CurexaModals';

export default function CurexaPatientsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const {
    portalMode,
    currentPatientProfile,
    patientVitalsHistory,
    patientAllergies,
    removeAllergy,
    patientVaccines,
    removeVaccine,
    prescriptions,
    patients,
    addPatientLocally,
    selectedPatient,
    showPatientDetail,
    setShowPatientDetail,
    viewPatientDetails,
  } = useCurexa();

  const isPatient = portalMode === 'PATIENT';

  // Hospital View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Patient View State
  const [patientTab, setPatientTab] = useState('TIMELINE'); // 'TIMELINE' | 'PRESCRIPTIONS' | 'LABS' | 'VITALS' | 'ALLERGIES'
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [showLogVitalsModal, setShowLogVitalsModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedMetricFilter, setSelectedMetricFilter] = useState('ALL');

  const statuses = ['ALL', 'Admitted', 'OPD / Triage', 'Outpatient', 'ICU'];

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const name = p.displayName || p.name || '';
      const phone = p.phone || '';
      const sku = p.sku || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery) ||
        sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (p.status && p.status.toLowerCase().includes(selectedStatus.toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchQuery, selectedStatus]);

  // Patient Medical Timeline Data
  const medicalTimeline = [
    {
      id: 'EVT-101',
      title: 'Cardiology Consultation & ECG',
      doctor: 'Dr. Rajesh Sharma, MD (Cardiology)',
      date: 'Today • 09:30 AM',
      type: 'OPD_VISIT',
      status: 'In Progress',
      summary: 'Follow-up review post-stent placement. Blood pressure controlled. Regular walking advised.',
      badgeColor: 'bg-sky-500/20 text-sky-700',
      icon: 'heart-pulse',
      iconColor: '#0284c7',
    },
    {
      id: 'EVT-102',
      title: 'Complete Blood Panel (CBC + Lipid)',
      doctor: 'Curexa Central Diagnostics',
      date: 'Today • 08:30 AM',
      type: 'LAB_REPORT',
      status: 'Completed',
      summary: 'Lipid profile shows Total Cholesterol 188 mg/dL. Hemoglobin normal at 13.8 g/dL.',
      badgeColor: 'bg-emerald-500/20 text-emerald-700',
      icon: 'flask',
      iconColor: '#059669',
    },
    {
      id: 'EVT-103',
      title: 'Hospital Discharge Summary (Ward 3B)',
      doctor: 'Dr. Sarah Lin • Attending Physician',
      date: 'Sep 14, 2026',
      type: 'ADMISSION',
      status: 'Discharged Stable',
      summary: '48-hour post-procedure observation in Room 302. Patient recovered well with zero complications.',
      badgeColor: 'bg-purple-500/20 text-purple-700',
      icon: 'business',
      iconColor: '#9333ea',
    },
    {
      id: 'EVT-104',
      title: 'Telemedicine Follow-Up Consultation',
      doctor: 'Dr. Rachel Patel, MD',
      date: 'Aug 22, 2026',
      type: 'TELEMEDICINE',
      status: 'Completed',
      summary: 'Virtual discussion regarding medication tolerance and routine prenatal vitamins review.',
      badgeColor: 'bg-blue-500/20 text-blue-700',
      icon: 'videocam',
      iconColor: '#2563eb',
    },
  ];

  const filteredVitals = useMemo(() => {
    if (selectedMetricFilter === 'ALL') return patientVitalsHistory;
    return patientVitalsHistory.filter((v) => v.metric === selectedMetricFilter);
  }, [patientVitalsHistory, selectedMetricFilter]);

  return (
    <AppScreen>
      <UserStatusBar
        rightAction={
          isPatient ? (
            <Pressable
              onPress={() => Alert.alert('Share Health Record', 'Generated secure 24-hour EMR share link: https://curexa.health/share/CUX-889102')}
              className="flex-row items-center gap-1 rounded-[10px] bg-sky-600 px-2 py-1 shadow-sm"
            >
              <Ionicons name="share-social-outline" size={12} color="#ffffff" />
              <Text className="text-[10px] font-bold text-white">Share</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowAddModal(true)}
              className="flex-row items-center gap-1 rounded-[10px] bg-emerald-600 px-2 py-1 shadow-sm"
            >
              <Ionicons name="person-add" size={12} color="#ffffff" />
              <Text className="text-[10px] font-bold text-white">Add</Text>
            </Pressable>
          )
        }
      />

      {isPatient ? (
        /* ========================================================================= */
        /*                       PATIENT HEALTH RECORDS VIEW                         */
        /* ========================================================================= */
        <View className="flex-1 px-3 pt-2">
          {/* Patient Subtabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 max-h-10">
            <View className={`flex-row rounded-[14px] p-1 gap-1 ${palette.surface}`}>
              {[
                { key: 'TIMELINE', label: 'Timeline', icon: 'git-commit-outline' },
                { key: 'PRESCRIPTIONS', label: 'e-Rx', icon: 'document-text-outline' },
                { key: 'LABS', label: 'Diagnostics', icon: 'flask-outline' },
                { key: 'VITALS', label: 'Biometrics', icon: 'pulse-outline' },
                { key: 'ALLERGIES', label: 'Allergies & Vaccines', icon: 'shield-checkmark-outline' },
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setPatientTab(tab.key)}
                  className={`flex-row items-center justify-center gap-1 rounded-[10px] px-2.5 py-1.5 ${
                    patientTab === tab.key ? 'bg-sky-600 shadow-sm' : 'transparent'
                  }`}
                >
                  <Ionicons
                    name={tab.icon}
                    size={13}
                    color={patientTab === tab.key ? '#ffffff' : palette.textMutedColor}
                  />
                  <Text
                    className={`text-[10.5px] font-bold ${
                      patientTab === tab.key ? 'text-white' : palette.textMuted
                    }`}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* TAB: TIMELINE */}
            {patientTab === 'TIMELINE' && (
              <View className="gap-2.5">
                {medicalTimeline.map((item, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedTimelineItem(item)}
                    className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-2.5">
                        <View
                          style={{ backgroundColor: `${item.iconColor}20` }}
                          className="h-9 w-9 items-center justify-center rounded-[14px]"
                        >
                          <Ionicons name={item.icon} size={17} color={item.iconColor} />
                        </View>
                        <View className="flex-1 mr-2">
                          <Text className={`text-[13px] font-bold ${palette.text}`}>{item.title}</Text>
                          <Text className={`text-[10px] ${palette.textMuted}`}>
                            {item.doctor} • {item.date}
                          </Text>
                        </View>
                      </View>
                      <View className={`rounded-full px-2 py-0.5 ${item.badgeColor.split(' ')[0]}`}>
                        <Text className={`text-[9px] font-bold ${item.badgeColor.split(' ')[1]}`}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <View className={`mt-2 rounded-[10px] p-2 ${palette.surfaceInset}`}>
                      <Text className={`text-[11px] leading-4 ${palette.text}`}>{item.summary}</Text>
                    </View>

                    <View className="mt-2 flex-row items-center justify-between border-t border-gray-200/15 pt-1.5">
                      <Text className="text-[10px] font-bold text-sky-600">Tap to View Full Clinical Note</Text>
                      <Ionicons name="chevron-forward" size={13} color="#0284c7" />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* TAB: PRESCRIPTIONS */}
            {patientTab === 'PRESCRIPTIONS' && (
              <View className="gap-2">
                {prescriptions.map((rx) => (
                  <View key={rx.id} className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
                    <View className="flex-row items-center justify-between border-b border-gray-200/15 pb-2">
                      <View>
                        <Text className={`text-[13px] font-bold ${palette.text}`}>{rx.diagnosis}</Text>
                        <Text className={`text-[10px] ${palette.textMuted}`}>
                          {rx.doctorName} • {rx.prescribedAt}
                        </Text>
                      </View>
                      <View className="rounded-full bg-emerald-500/20 px-2 py-0.5">
                        <Text className="text-[9px] font-bold text-emerald-700">{rx.status}</Text>
                      </View>
                    </View>

                    <View className="my-2 gap-1.5">
                      {rx.medicines.map((m, i) => (
                        <View key={i} className={`rounded-[10px] p-2 flex-row justify-between ${palette.surfaceInset}`}>
                          <View>
                            <Text className={`text-[11.5px] font-bold ${palette.text}`}>{m.name}</Text>
                            <Text className={`text-[9.5px] ${palette.textMuted}`}>
                              {m.dosage} • {m.timing}
                            </Text>
                          </View>
                          <Text className="text-[10px] font-medium text-sky-600">{m.duration}</Text>
                        </View>
                      ))}
                    </View>

                    <Pressable
                      onPress={() => Alert.alert('Download e-Rx', `Downloading official e-Prescription ${rx.id} PDF with digital signature...`)}
                      className="flex-row items-center justify-center gap-1.5 rounded-[10px] bg-purple-600/15 py-2"
                    >
                      <Ionicons name="download-outline" size={14} color="#8b5cf6" />
                      <Text className="text-[11px] font-bold text-purple-700">Download Verified e-Rx PDF</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: LABS */}
            {patientTab === 'LABS' && (
              <View className="gap-2">
                {[
                  {
                    id: 'LAB-901',
                    name: 'Comprehensive Blood Panel (CBC + Lipid Profile)',
                    date: 'Today, 08:30 AM',
                    doctor: 'Dr. Sarah Lin',
                    status: 'Completed',
                    results: [
                      { test: 'Hemoglobin', value: '13.8 g/dL', status: 'Normal', range: '12.0 - 15.5 g/dL' },
                      { test: 'Total Cholesterol', value: '188 mg/dL', status: 'Optimal', range: '< 200 mg/dL' },
                      { test: 'HDL Cholesterol', value: '54 mg/dL', status: 'Optimal', range: '> 50 mg/dL' },
                      { test: 'Triglycerides', value: '142 mg/dL', status: 'Normal', range: '< 150 mg/dL' },
                    ],
                  },
                  {
                    id: 'LAB-902',
                    name: 'Non-Contrast Brain CT Scan Report',
                    date: 'Sep 14, 2026',
                    doctor: 'Dr. Amit Malhotra',
                    status: 'Completed',
                    results: [
                      { test: 'Ventricular System', value: 'Normal Calibre', status: 'Normal', range: 'Symmetric' },
                      { test: 'Intracranial Hemorrhage', value: 'Negative / Absent', status: 'Clear', range: 'None' },
                    ],
                  },
                ].map((lab) => (
                  <View key={lab.id} className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
                    <View className="flex-row items-center justify-between border-b border-gray-200/15 pb-2">
                      <View>
                        <Text className={`text-[13px] font-bold ${palette.text}`}>{lab.name}</Text>
                        <Text className={`text-[10px] ${palette.textMuted}`}>
                          {lab.doctor} • {lab.date}
                        </Text>
                      </View>
                      <View className="rounded-full bg-emerald-500/20 px-2 py-0.5">
                        <Text className="text-[9px] font-bold text-emerald-700">{lab.status}</Text>
                      </View>
                    </View>

                    <View className="my-2 gap-1.5">
                      {lab.results.map((r, i) => (
                        <View key={i} className={`flex-row items-center justify-between rounded-[8px] p-2 ${palette.surfaceInset}`}>
                          <View>
                            <Text className={`text-[11px] font-medium ${palette.text}`}>{r.test}</Text>
                            <Text className={`text-[9px] ${palette.textMuted}`}>Ref: {r.range}</Text>
                          </View>
                          <View className="flex-row items-center gap-1.5">
                            <Text className={`text-[11px] font-bold ${palette.text}`}>{r.value}</Text>
                            <View className="rounded bg-emerald-500/15 px-1.5 py-0.5">
                              <Text className="text-[8.5px] font-bold text-emerald-700">{r.status}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    <Pressable
                      onPress={() => Alert.alert('Download Lab PDF', `Downloading Lab Report ${lab.id} PDF...`)}
                      className="flex-row items-center justify-center gap-1.5 rounded-[10px] bg-cyan-600/15 py-2"
                    >
                      <Ionicons name="download-outline" size={14} color="#06b6d4" />
                      <Text className="text-[11px] font-bold text-cyan-700">Download Diagnostic Report PDF</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* TAB: VITALS & BIOMETRICS (from HealthyFine) */}
            {patientTab === 'VITALS' && (
              <View className="gap-2">
                <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View>
                      <Text className={`text-[12px] font-bold uppercase tracking-[0.8px] text-teal-600`}>
                        Biometric & Vitals Timeline
                      </Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        {patientVitalsHistory.length} recorded measurements
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setShowLogVitalsModal(true)}
                      className="flex-row items-center gap-1 rounded-[8px] bg-teal-500/20 px-2 py-1"
                    >
                      <Ionicons name="add" size={13} color="#0d9488" />
                      <Text className="text-[10px] font-bold text-teal-700">Log Reading</Text>
                    </Pressable>
                  </View>

                  {/* Filter Chips */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    <View className="flex-row gap-1">
                      {['ALL', 'Blood Pressure', 'Glucose/Sugar', 'Heart Rate', 'Blood Oxygen (SpO2)', 'Body Weight', 'Body Temperature', 'Waist Circumference', 'Total Cholesterol'].map((m) => {
                        const isSel = selectedMetricFilter === m;
                        return (
                          <Pressable
                            key={m}
                            onPress={() => setSelectedMetricFilter(m)}
                            className={`rounded-[8px] px-2 py-1 ${
                              isSel ? 'bg-teal-600' : palette.surfaceInset
                            }`}
                          >
                            <Text
                              className={`text-[9.5px] font-semibold ${
                                isSel ? 'text-white font-bold' : palette.text
                              }`}
                            >
                              {m}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>

                  {/* Vitals History List */}
                  <View className="gap-1.5">
                    {filteredVitals.map((v) => (
                      <View key={v.id} className={`rounded-[12px] p-2.5 ${palette.surfaceInset}`}>
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons name="pulse" size={13} color="#0d9488" />
                            <Text className={`text-[12px] font-bold ${palette.text}`}>{v.metric}</Text>
                          </View>
                          <View className="rounded bg-emerald-500/15 px-1.5 py-0.5">
                            <Text className="text-[8.5px] font-bold text-emerald-700">{v.status || 'Normal'}</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className={`text-[15px] font-extrabold ${palette.text}`}>
                            {v.value} <Text className={`text-[11px] font-normal ${palette.textMuted}`}>{v.unit}</Text>
                          </Text>
                          <Text className={`text-[10px] ${palette.textMuted}`}>
                            {v.timing} • {v.date}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB: ALLERGIES & VACCINATIONS (from HealthyFine) */}
            {patientTab === 'ALLERGIES' && (
              <View className="gap-2.5">
                {/* Allergies Card */}
                <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="warning" size={15} color="#d97706" />
                      <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-amber-600">
                        Documented Allergies
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setShowAddRecordModal(true)}
                      className="flex-row items-center gap-1 rounded-[8px] bg-amber-500/20 px-2 py-1"
                    >
                      <Ionicons name="add" size={13} color="#d97706" />
                      <Text className="text-[10px] font-bold text-amber-700">Add Allergy</Text>
                    </Pressable>
                  </View>

                  <View className="gap-1.5">
                    {patientAllergies?.map((al) => (
                      <View
                        key={al.id}
                        className={`rounded-[12px] p-2.5 flex-row items-center justify-between ${palette.surfaceInset}`}
                      >
                        <View className="flex-1 mr-2">
                          <Text className={`text-[12px] font-bold ${palette.text}`}>{al.title}</Text>
                          <Text className="text-[10px] text-amber-600 font-semibold">{al.severity}</Text>
                          {al.notes && (
                            <Text className={`text-[9.5px] ${palette.textMuted} mt-0.5`}>{al.notes}</Text>
                          )}
                        </View>
                        <Pressable
                          onPress={() => removeAllergy(al.id)}
                          className="rounded-full bg-gray-500/20 p-1.5"
                        >
                          <Ionicons name="trash-outline" size={13} color="#ef4444" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Vaccinations Card */}
                <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="shield-checkmark" size={15} color="#059669" />
                      <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-emerald-600">
                        Immunization & Vaccines
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setShowAddRecordModal(true)}
                      className="flex-row items-center gap-1 rounded-[8px] bg-emerald-500/20 px-2 py-1"
                    >
                      <Ionicons name="add" size={13} color="#059669" />
                      <Text className="text-[10px] font-bold text-emerald-700">Record Vaccine</Text>
                    </Pressable>
                  </View>

                  <View className="gap-1.5">
                    {patientVaccines?.map((vac) => (
                      <View
                        key={vac.id}
                        className={`rounded-[12px] p-2.5 flex-row items-center justify-between ${palette.surfaceInset}`}
                      >
                        <View className="flex-1 mr-2">
                          <Text className={`text-[12px] font-bold ${palette.text}`}>{vac.name}</Text>
                          <Text className="text-[10px] text-emerald-600 font-semibold">
                            {vac.dose} • {vac.date}
                          </Text>
                          <Text className={`text-[9.5px] ${palette.textMuted} mt-0.5`}>
                            {vac.facility} {vac.batch ? `(Batch: ${vac.batch})` : ''}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => removeVaccine(vac.id)}
                          className="rounded-full bg-gray-500/20 p-1.5"
                        >
                          <Ionicons name="trash-outline" size={13} color="#ef4444" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* ========================================================================= */
        /*                       HOSPITAL PATIENT DIRECTORY VIEW                     */
        /* ========================================================================= */
        <View className="flex-1 px-3 pt-2">
          {/* Search Bar */}
          <View className="mb-2 flex-row items-center gap-2">
            <View
              className={`flex-1 flex-row items-center gap-2 rounded-[14px] px-2.5 py-1.5 border ${palette.surface} ${palette.border}`}
            >
              <Ionicons name="search-outline" size={16} color={palette.textMutedColor} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name, phone, or PAT-ID..."
                placeholderTextColor={palette.textMutedColor}
                className={`flex-1 text-[12px] ${palette.text}`}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={15} color={palette.textMutedColor} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 max-h-8">
            <View className="flex-row gap-1.5">
              {statuses.map((st) => (
                <Pressable
                  key={st}
                  onPress={() => setSelectedStatus(st)}
                  className={`rounded-[10px] px-2.5 py-1 ${
                    selectedStatus === st ? 'bg-emerald-600' : palette.surface
                  }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${
                      selectedStatus === st ? 'text-white font-bold' : palette.text
                    }`}
                  >
                    {st}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Patient Cards List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <View className="gap-2">
              {filteredPatients.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => viewPatientDetails(p)}
                  className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-2.5">
                      <View className="h-9 w-9 items-center justify-center rounded-[14px] bg-emerald-500/15">
                        <Ionicons name="person" size={17} color="#059669" />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-1.5">
                          <Text className={`text-[14px] font-bold ${palette.text}`}>
                            {p.displayName || p.name}
                          </Text>
                          <View className="rounded bg-emerald-500/15 px-1 py-0.5">
                            <Text className="text-[9px] font-bold text-emerald-700">
                              {p.bloodGroup || 'O+'}
                            </Text>
                          </View>
                        </View>
                        <Text className={`text-[10px] ${palette.textMuted}`}>
                          {p.gender || 'Female'} • {p.age || 38} yrs • {p.sku || `ID: ${p.id}`}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        p.status === 'ICU'
                          ? 'bg-red-500/20'
                          : p.status === 'Admitted'
                          ? 'bg-purple-500/20'
                          : 'bg-emerald-500/20'
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-bold ${
                          p.status === 'ICU'
                            ? 'text-red-700'
                            : p.status === 'Admitted'
                            ? 'text-purple-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {p.status || 'Active'}
                      </Text>
                    </View>
                  </View>

                  {/* Vitals Summary Strip */}
                  <View className={`mt-2.5 flex-row items-center justify-between rounded-[12px] p-2 ${palette.surfaceInset}`}>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="heart" size={12} color="#ef4444" />
                      <Text className={`text-[10px] font-medium ${palette.text}`}>
                        {p.vitals?.heartRate || '76'} bpm
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="speedometer-outline" size={12} color="#0284c7" />
                      <Text className={`text-[10px] font-medium ${palette.text}`}>
                        {p.vitals?.bp || '120/80'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="water-outline" size={12} color="#06b6d4" />
                      <Text className={`text-[10px] font-medium ${palette.text}`}>
                        {p.vitals?.spo2 || '98%'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-0.5">
                      <Text className="text-[10px] font-bold text-emerald-600">EMR</Text>
                      <Ionicons name="chevron-forward" size={11} color="#059669" />
                    </View>
                  </View>
                </Pressable>
              ))}

              {filteredPatients.length === 0 && (
                <View className={`items-center justify-center rounded-[16px] p-8 ${palette.surface}`}>
                  <Ionicons name="people-outline" size={36} color={palette.textMutedColor} />
                  <Text className={`mt-2 text-[13px] font-bold ${palette.text}`}>No patients found</Text>
                  <Text className={`text-[11px] ${palette.textMuted}`}>
                    Try clearing your search query or add a new patient.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Patient Timeline Detail Modal */}
      {selectedTimelineItem && (
        <Modal
          visible={!!selectedTimelineItem}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedTimelineItem(null)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <Pressable className="absolute inset-0" onPress={() => setSelectedTimelineItem(null)} />
            <View
              className={`rounded-t-[24px] p-4 ${palette.surface}`}
              style={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
            >
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-200/15">
                <Text className={`text-[15px] font-bold ${palette.text}`}>Medical Record Entry</Text>
                <Pressable onPress={() => setSelectedTimelineItem(null)} className={`rounded-full p-1.5 ${palette.surfaceAlt}`}>
                  <Ionicons name="close" size={16} color={palette.textMutedColor} />
                </Pressable>
              </View>

              <View className={`my-3 rounded-[16px] p-3.5 border ${palette.border} ${palette.surfaceInset}`}>
                <Text className={`text-[14px] font-bold ${palette.text}`}>{selectedTimelineItem.title}</Text>
                <Text className={`text-[11px] ${palette.textMuted} mb-2`}>
                  {selectedTimelineItem.doctor} • {selectedTimelineItem.date}
                </Text>

                <View className="rounded-[10px] bg-white/60 dark:bg-black/20 p-2.5 mb-2">
                  <Text className="text-[10px] font-bold text-sky-600 uppercase mb-0.5">Clinical Findings & Summary</Text>
                  <Text className={`text-[11.5px] leading-4 ${palette.text}`}>{selectedTimelineItem.summary}</Text>
                </View>

                <Text className={`text-[10px] ${palette.textMuted}`}>
                  Verified by Curexa EMR Audit Log • Encrypted Record
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    Alert.alert('Download Record', 'Downloading official record summary PDF...');
                    setSelectedTimelineItem(null);
                  }}
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-sky-600 py-2.5"
                >
                  <Ionicons name="download-outline" size={16} color="#ffffff" />
                  <Text className="text-[12px] font-bold text-white">Download Clinical Summary</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedTimelineItem(null)}
                  className={`rounded-[12px] px-4 py-2.5 ${palette.surfaceInset}`}
                >
                  <Text className={`text-[12px] font-medium ${palette.text}`}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modals for Patient */}
      <LogVitalsModal
        visible={showLogVitalsModal}
        onClose={() => setShowLogVitalsModal(false)}
      />
      <AddAllergyVaccineModal
        visible={showAddRecordModal}
        onClose={() => setShowAddRecordModal(false)}
      />

      {/* Modals for Hospital */}
      <AddPatientModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newP) => addPatientLocally(newP)}
      />
      <PatientDetailModal
        patient={selectedPatient}
        visible={showPatientDetail}
        onClose={() => setShowPatientDetail(false)}
      />
    </AppScreen>
  );
}
