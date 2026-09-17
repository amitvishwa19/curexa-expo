import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';
import { clearSession } from '~/utils/authStorage';
import UserStatusBar from '~/components/UserStatusBar';
import IosPortalSwitcherModal from '~/components/curexa/IosPortalSwitcherModal';
import IosSignOutModal from '~/components/curexa/IosSignOutModal';

export default function CurexaSettingsScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const {
    hospitalInfo,
    portalMode,
    setPortalMode,
    currentPatientProfile,
    showDummyData,
    setShowDummyData,
  } = useCurexa();

  // Settings Toggles
  const [smsReminders, setSmsReminders] = useState(true);
  const [criticalLabAlerts, setCriticalLabAlerts] = useState(true);
  const [bedAutoClean, setBedAutoClean] = useState(true);
  const [drugInteractionWarning, setDrugInteractionWarning] = useState(true);
  const [patientDirectBooking, setPatientDirectBooking] = useState(true);
  const [patientLabDownloads, setPatientLabDownloads] = useState(true);

  const isHospitalMode = portalMode === 'HOSPITAL';

  return (
    <AppScreen>
      <UserStatusBar scrollY={scrollY} />
      <Animated.ScrollView
        className="flex-1 px-3 pt-2"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* App Mode Switcher (Hospital / Clinic vs. Patient Care) */}
        <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm border border-emerald-500/30 ${palette.surface}`}>
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-[11px] font-bold uppercase tracking-[1px] text-emerald-600">
                APP PURPOSE & ROLE MODE
              </Text>
              <Text className={`text-[14px] font-bold ${palette.text}`}>
                {isHospitalMode ? '🏥 Clinic / Hospital Management' : '👤 Patient Care Portal'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPortalModal(true)}
              className="rounded-full bg-emerald-500/20 px-2.5 py-1 flex-row items-center gap-1"
            >
              <Text className="text-[9.5px] font-bold text-emerald-700">
                {isHospitalMode ? 'STAFF / CLINIC' : 'PATIENT'}
              </Text>
              <Ionicons name="swap-vertical" size={11} color="#059669" />
            </TouchableOpacity>
          </View>

          <Text className={`text-[11px] mb-3 leading-4 ${palette.textMuted}`}>
            {isHospitalMode
              ? 'Configured for doctors, nurses, and hospital administration. Full access to inpatient wards, OPD queues, electronic health records, pharmacy, and billing.'
              : 'Configured for patients & families. Streamlined access to book OPD slots, view electronic prescriptions, download lab reports, and launch virtual video consultations.'}
          </Text>

          {/* iOS Trigger Button & Segmented Switcher */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPortalModal(true)}
            className="flex-row items-center justify-between rounded-[12px] bg-emerald-600 p-2.5 shadow-sm"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles" size={16} color="#ffffff" />
              <Text className="text-[12px] font-bold text-white">
                Switch Portal Experience (iOS Sheet)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Hospital Profile Banner */}
        <View className={`mb-2.5 rounded-[16px] p-3 ${palette.surface}`}>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-600">
              <Ionicons name="medical" size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className={`text-[15px] font-bold ${palette.text}`}>{hospitalInfo.name}</Text>
              <Text className={`text-[11px] ${palette.textMuted}`}>{hospitalInfo.tagline}</Text>
              <Text className="mt-0.5 text-[10px] font-semibold text-emerald-600">
                NABH & NABL Accredited • License #DL-HMS-2026-ND
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Portal Specific Profile & Features (if in Patient mode) */}
        {!isHospitalMode && (
          <>
            <View className={`mb-2.5 rounded-[16px] p-3 ${palette.surface}`}>
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-sky-600">
                Patient Medical Profile & Health Card
              </Text>
              <View className="gap-2">
                <View className={`rounded-[12px] p-2.5 ${palette.surfaceInset}`}>
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-[13px] font-bold ${palette.text}`}>
                      {currentPatientProfile?.displayName || 'Patient'}
                    </Text>
                    <View className="rounded-full bg-sky-500/20 px-2 py-0.5">
                      <Text className="text-[9.5px] font-bold text-sky-700">
                        {currentPatientProfile?.uhid || 'CUX-889102'}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-[10.5px] ${palette.textMuted} mt-0.5`}>
                    Age: {currentPatientProfile?.age} • Gender: {currentPatientProfile?.gender} • Blood Group: {currentPatientProfile?.bloodGroup}
                  </Text>
                </View>

                {/* Biometrics Summary */}
                <View className={`rounded-[12px] p-2.5 ${palette.surfaceInset}`}>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.5px] text-teal-600 mb-1">
                    Physical Biomarkers & Vitals
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-[11px] ${palette.text}`}>
                      Height: <Text className="font-bold">{currentPatientProfile?.vitals?.height || '168 cm'}</Text>
                    </Text>
                    <Text className={`text-[11px] ${palette.text}`}>
                      Weight: <Text className="font-bold">{currentPatientProfile?.vitals?.weight || '64 kg'}</Text>
                    </Text>
                    <Text className={`text-[11px] ${palette.text}`}>
                      BMI: <Text className="font-bold text-emerald-600">{currentPatientProfile?.vitals?.bmi || '22.7'}</Text>
                    </Text>
                  </View>
                </View>

                {/* Emergency Contact */}
                <View className={`rounded-[12px] p-2.5 ${palette.surfaceInset}`}>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.5px] text-rose-600 mb-1">
                    Emergency Contact (ICE)
                  </Text>
                  <Text className={`text-[12px] font-bold ${palette.text}`}>
                    {currentPatientProfile?.emergencyContact?.name} ({currentPatientProfile?.emergencyContact?.relation})
                  </Text>
                  <Text className="text-[11px] font-semibold text-rose-600">
                    {currentPatientProfile?.emergencyContact?.phone}
                  </Text>
                </View>

                {/* Insurance Policy */}
                <View className={`rounded-[12px] p-2.5 ${palette.surfaceInset}`}>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.5px] text-sky-600 mb-1">
                    Active Health Insurance
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-[12px] font-bold ${palette.text}`}>
                        {currentPatientProfile?.insurance?.provider || 'Star Health Insurance (TPA: MediAssist)'}
                      </Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        Policy: {currentPatientProfile?.insurance?.policyNumber || 'SHI-9923841'}
                      </Text>
                    </View>
                    <View className="rounded bg-sky-500/20 px-2 py-0.5">
                      <Text className="text-[9.5px] font-bold text-sky-700">
                        {currentPatientProfile?.insurance?.coverage || '85%'} Covered
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View className={`mb-2.5 rounded-[16px] p-3 ${palette.surface}`}>
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-sky-600">
                Smart Patient Notifications
              </Text>
              <View className="gap-2.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-2">
                    <Text className={`text-[13px] font-bold ${palette.text}`}>
                      Daily Pill & Dose Reminders
                    </Text>
                    <Text className={`text-[10px] ${palette.textMuted}`}>
                      Timely push alerts for morning, noon, and bedtime medication
                    </Text>
                  </View>
                  <Switch
                    value={patientDirectBooking}
                    onValueChange={setPatientDirectBooking}
                    trackColor={{ false: '#767577', true: '#0284c7' }}
                  />
                </View>

                <View className="flex-row items-center justify-between border-t border-gray-200/10 pt-2">
                  <View className="flex-1 pr-2">
                    <Text className={`text-[13px] font-bold ${palette.text}`}>
                      Lab Report Ready Alerts
                    </Text>
                    <Text className={`text-[10px] ${palette.textMuted}`}>
                      Instant notification and automatic PDF download upon doctor sign-off
                    </Text>
                  </View>
                  <Switch
                    value={patientLabDownloads}
                    onValueChange={setPatientLabDownloads}
                    trackColor={{ false: '#767577', true: '#0284c7' }}
                  />
                </View>
              </View>
            </View>

            {/* Developer & Demo Data (Stored in Expo SecureStore) */}
            <View className={`mb-2.5 rounded-[16px] p-3 border border-amber-500/30 ${palette.surface}`}>
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-7 w-7 items-center justify-center rounded-[8px] bg-amber-500/15">
                    <Ionicons name="code-slash-outline" size={15} color="#d97706" />
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-[10px] font-bold uppercase tracking-[0.8px] text-amber-600">
                        DEVELOPER SETTING
                      </Text>
                      <View className="rounded-full bg-amber-500/20 px-1.5 py-0.2">
                        <Text className="text-[8.5px] font-bold text-amber-700">SECURE</Text>
                      </View>
                    </View>
                    <Text className={`text-[13px] font-bold ${palette.text}`}>
                      Show Dummy Data (Dev)
                    </Text>
                  </View>
                </View>
                <Switch
                  value={showDummyData}
                  onValueChange={(val) => setShowDummyData(val)}
                  trackColor={{ false: '#767577', true: '#d97706' }}
                />
              </View>
              <Text className={`text-[10.5px] leading-4 ${palette.textMuted}`}>
                {showDummyData
                  ? 'Active: Loading simulated vitals history, mock e-prescriptions, vaccines, and family dependents. Persisted in Expo SecureStore.'
                  : 'Disabled: Demo records cleared for live patient testing and clean state EMR sync. Persisted in Expo SecureStore.'}
              </Text>
            </View>
          </>
        )}

        {/* Clinical Operations Controls */}
        <View className={`mb-2.5 rounded-[16px] p-3 ${palette.surface}`}>
          <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-emerald-600">
            Clinical Safety & Notifications
          </Text>
          <View className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${palette.text}`}>Drug Interaction Checker</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>
                  Warn when contra-indicated medicines are co-prescribed
                </Text>
              </View>
              <Switch
                value={drugInteractionWarning}
                onValueChange={setDrugInteractionWarning}
                trackColor={{ false: '#767577', true: '#059669' }}
              />
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200/10 pt-2">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${palette.text}`}>Critical Lab Value Alerts</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>
                  Instant push notification when urgent lab tests finish
                </Text>
              </View>
              <Switch
                value={criticalLabAlerts}
                onValueChange={setCriticalLabAlerts}
                trackColor={{ false: '#767577', true: '#059669' }}
              />
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200/10 pt-2">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${palette.text}`}>Auto Bed Cleaning Workflow</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>
                  Move discharged beds to CLEANING status automatically
                </Text>
              </View>
              <Switch
                value={bedAutoClean}
                onValueChange={setBedAutoClean}
                trackColor={{ false: '#767577', true: '#059669' }}
              />
            </View>

            <View className="flex-row items-center justify-between border-t border-gray-200/10 pt-2">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${palette.text}`}>Automated SMS Reminders</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>
                  Send OPD appointment reminder SMS 2 hours prior
                </Text>
              </View>
              <Switch
                value={smsReminders}
                onValueChange={setSmsReminders}
                trackColor={{ false: '#767577', true: '#059669' }}
              />
            </View>
          </View>
        </View>

        {/* Hospital Hub Module Jump Links */}
        <View className={`mb-2.5 rounded-[16px] p-3 ${palette.surface}`}>
          <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-emerald-600">
            Hospital Operations Hub
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              { label: 'Wards & Beds', route: '/beds', icon: 'bed-outline', color: '#059669' },
              { label: 'Pharmacy', route: '/pharmacy', icon: 'medkit-outline', color: '#8b5cf6' },
              { label: 'Laboratory', route: '/laboratory', icon: 'flask-outline', color: '#06b6d4' },
              { label: 'Invoices', route: '/billing', icon: 'receipt-outline', color: '#f59e0b' },
              { label: 'Workflow', route: '/workflow', icon: 'git-network-outline', color: '#ec4899' },
              { label: 'Reports', route: '/reports', icon: 'bar-chart-outline', color: '#6366f1' },
            ].map((m, i) => (
              <Pressable
                key={i}
                onPress={() => router.push(m.route)}
                className={`w-[48%] flex-1 min-w-[140px] flex-row items-center gap-2 rounded-[12px] p-2.5 ${palette.surfaceInset}`}
              >
                <Ionicons name={m.icon} size={16} color={m.color} />
                <Text className={`text-[11px] font-bold ${palette.text}`}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Onboarding Tour Replay */}
        <Pressable
          onPress={() =>
            router.push(
              portalMode === 'PATIENT'
                ? '/(misc)/onboarding-patient'
                : '/(misc)/onboarding-hospital'
            )
          }
          className={`mb-2.5 flex-row items-center justify-between rounded-[16px] p-3 shadow-sm ${palette.surface}`}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/15">
              <Ionicons name="sparkles-outline" size={16} color="#059669" />
            </View>
            <View>
              <Text className={`text-[12px] font-bold ${palette.text}`}>Replay Onboarding Tour</Text>
              <Text className={`text-[10px] ${palette.textMuted}`}>View features walkthrough and slide guide</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={15} color="#059669" />
        </Pressable>

        {/* Sign Out Button */}
        <Pressable
          onPress={() => setShowSignOutModal(true)}
          className="rounded-[14px] bg-red-600/15 border border-red-500/30 py-3 items-center justify-center shadow-sm"
        >
          <Text className="text-[12px] font-bold text-red-500">Sign Out of Curexa</Text>
        </Pressable>
      </Animated.ScrollView>

      {/* iOS Portal Switcher Modal */}
      <IosPortalSwitcherModal
        visible={showPortalModal}
        onClose={() => setShowPortalModal(false)}
      />

      {/* iOS Sign Out Confirmation Modal */}
      <IosSignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
    </AppScreen>
  );
}
