import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, usePathname } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';
import { clearSession } from '~/utils/authStorage';
import IosPortalSwitcherModal from './IosPortalSwitcherModal';

const CurexaDrawerContext = createContext(null);

export function useCurexaDrawer() {
  const ctx = useContext(CurexaDrawerContext);
  if (!ctx) {
    throw new Error('useCurexaDrawer must be used within CurexaDrawerProvider');
  }
  return ctx;
}

export function CurexaDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  return (
    <CurexaDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
      <CurexaDrawerModal visible={isOpen} onClose={closeDrawer} />
    </CurexaDrawerContext.Provider>
  );
}

export default CurexaDrawerProvider;

const hospitalCategories = [
  {
    title: 'CLINICAL OPERATIONS',
    items: [
      { route: '/(tabs)', label: 'Overview Command Center', icon: 'pulse-outline', activeIcon: 'pulse' },
      { route: '/(tabs)/patients', label: 'Patient EMR Directory', icon: 'people-outline', activeIcon: 'people' },
      { route: '/(tabs)/appointments', label: 'OPD Scheduler & Queue', icon: 'calendar-outline', activeIcon: 'calendar' },
      { route: '/prescriptions', label: 'e-Prescriptions (e-Rx)', icon: 'document-text-outline', activeIcon: 'document-text' },
      { route: '/workflow', label: 'Clinical Workflow Kanban', icon: 'git-network-outline', activeIcon: 'git-network' },
    ],
  },
  {
    title: 'ADVANCED CLINICAL SUITE',
    items: [
      { route: '/ai-assistant', label: 'AI Clinical & Triage Assistant', icon: 'sparkles-outline', activeIcon: 'sparkles' },
      { route: '/scanner', label: 'Bedside QR & Barcode Scanner', icon: 'qr-code-outline', activeIcon: 'qr-code' },
      { route: '/telemetry', label: 'Live ICU Telemetry & Vitals', icon: 'heart-outline', activeIcon: 'heart' },
      { route: '/telemedicine', label: 'Telemedicine Virtual OPD', icon: 'videocam-outline', activeIcon: 'videocam' },
      { route: '/messaging-automation', label: 'WhatsApp & SMS Automation', icon: 'logo-whatsapp', activeIcon: 'logo-whatsapp' },
      { route: '/roster', label: 'SBAR Handovers & On-Call Roster', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal' },
    ],
  },
  {
    title: 'INPATIENT & DIAGNOSTICS',
    items: [
      { route: '/beds', label: 'Wards & Bed Matrix (IPD)', icon: 'bed-outline', activeIcon: 'bed' },
      { route: '/laboratory', label: 'Diagnostics & Lab Tests', icon: 'flask-outline', activeIcon: 'flask' },
    ],
  },
  {
    title: 'PHARMACY & FINANCE',
    items: [
      { route: '/pharmacy', label: 'Pharmacy & Drug Stock', icon: 'medkit-outline', activeIcon: 'medkit' },
      { route: '/billing', label: 'Invoices & Payments', icon: 'receipt-outline', activeIcon: 'receipt' },
    ],
  },
  {
    title: 'HOSPITAL ADMIN & ANALYTICS',
    items: [
      { route: '/departments', label: 'Departments & Doctors', icon: 'business-outline', activeIcon: 'business' },
      { route: '/reports', label: 'Reports & Hospital Stats', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
      { route: '/crm', label: 'Patient Care CRM', icon: 'heart-circle-outline', activeIcon: 'heart-circle' },
      { route: '/(tabs)/settings', label: 'System Settings', icon: 'settings-outline', activeIcon: 'settings' },
    ],
  },
];

const patientCategories = [
  {
    title: 'MY PATIENT CARE',
    items: [
      { route: '/(tabs)', label: 'My Health Command Hub', icon: 'home-outline', activeIcon: 'home' },
      { route: '/(tabs)/appointments', label: 'My Doctor Visits & Tokens', icon: 'calendar-outline', activeIcon: 'calendar' },
      { route: '/(tabs)/patients', label: 'My EMR & Clinical Records', icon: 'document-text-outline', activeIcon: 'document-text' },
      { route: '/prescriptions', label: 'My Prescriptions & e-Rx', icon: 'medkit-outline', activeIcon: 'medkit' },
      { route: '/laboratory', label: 'My Diagnostic Lab Reports', icon: 'flask-outline', activeIcon: 'flask' },
      { route: '/billing', label: 'My Hospital Invoices & POS', icon: 'receipt-outline', activeIcon: 'receipt' },
    ],
  },
  {
    title: 'VIRTUAL CARE & CONNECT',
    items: [
      { route: '/telemedicine', label: 'Join Telemedicine Video', icon: 'videocam-outline', activeIcon: 'videocam' },
      { route: '/ai-assistant', label: 'AI Health Triage Checker', icon: 'sparkles-outline', activeIcon: 'sparkles' },
      { route: '/scanner', label: 'Bedside QR Wristband Scan', icon: 'qr-code-outline', activeIcon: 'qr-code' },
      { route: '/departments', label: 'Find Super Specialty Doctors', icon: 'people-outline', activeIcon: 'people' },
      { route: '/(tabs)/settings', label: 'Patient Profile & Settings', icon: 'settings-outline', activeIcon: 'settings' },
    ],
  },
];

function CurexaDrawerModal({ visible, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { portalMode, currentPatientProfile } = useCurexa();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const isPatient = portalMode === 'PATIENT';
  const menuCategories = isPatient ? patientCategories : hospitalCategories;

  const navigateTo = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
        <View className="flex-1 flex-row">
          {/* Backdrop Overlay */}
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="absolute inset-0 bg-black/60"
          >
            <Pressable className="flex-1" onPress={onClose} />
          </Animated.View>

          {/* Side Drawer Panel */}
          <Animated.View
            entering={SlideInLeft.duration(250)}
            exiting={SlideOutLeft.duration(200)}
            className={`w-[84%] max-w-[320px] flex-1 border-r ${palette.surface} ${palette.border}`}
            style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }}
          >
            {/* Header Badge */}
            <View className="px-4 pb-3 border-b border-gray-200/15 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View
                  className={`h-9 w-9 items-center justify-center rounded-[14px] shadow-sm ${
                    isPatient ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}
                >
                  <Ionicons name={isPatient ? 'person' : 'medical'} size={18} color="#ffffff" />
                </View>
                <View>
                  <Text className={`text-[13.5px] font-bold ${palette.text}`}>
                    {isPatient ? currentPatientProfile.displayName : 'Curexa Super Specialty'}
                  </Text>
                  <Text className="text-[10px] font-semibold text-emerald-600">
                    {isPatient ? 'Patient Care Portal' : 'Hospital Command Suite'}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={onClose}
                className={`h-8 w-8 items-center justify-center rounded-[12px] ${palette.surfaceAlt}`}
              >
                <Ionicons name="close" size={17} color={palette.textColor} />
              </Pressable>
            </View>

            {/* Portal Switcher Banner */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSwitcher(true)}
              className={`mx-3 mt-2 flex-row items-center justify-between rounded-[14px] p-2.5 ${
                isPatient
                  ? 'bg-sky-500/15 border border-sky-500/30'
                  : 'bg-emerald-500/15 border border-emerald-500/30'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={isPatient ? 'person-circle-outline' : 'business-outline'}
                  size={18}
                  color={isPatient ? '#0284c7' : '#059669'}
                />
                <View>
                  <Text className={`text-[11.5px] font-bold ${palette.text}`}>
                    {isPatient ? 'Patient Care Portal' : 'Hospital HMS Portal'}
                  </Text>
                  <Text className="text-[9px] font-medium text-emerald-600">
                    Tap to switch workflow
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <View
                  className={`rounded-full px-1.5 py-0.5 ${
                    isPatient ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}
                >
                  <Text className="text-[8.5px] font-bold text-white">
                    {isPatient ? 'PATIENT' : 'HMS'}
                  </Text>
                </View>
                <Ionicons name="swap-vertical" size={14} color={isPatient ? '#0284c7' : '#059669'} />
              </View>
            </TouchableOpacity>

            {/* Menu Sections List */}
            <ScrollView className="flex-1 px-3 py-2" showsVerticalScrollIndicator={false}>
              {menuCategories.map((cat, idx) => (
                <View key={idx} className="mb-3">
                  <Text
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.2px] ${palette.textMuted}`}
                  >
                    {cat.title}
                  </Text>
                  <View className="gap-1">
                    {cat.items.map((item) => {
                      const isActive =
                        pathname === item.route ||
                        (item.route === '/(tabs)' &&
                          (pathname === '/' ||
                            pathname === '/(tabs)' ||
                            pathname === '/(tabs)/' ||
                            pathname === '/(tabs)/index'));

                      return (
                        <Pressable
                          key={item.route}
                          onPress={() => navigateTo(item.route)}
                          className={`flex-row items-center gap-2.5 rounded-[14px] px-3 py-2 ${
                            isActive
                              ? isPatient
                                ? 'bg-sky-600'
                                : 'bg-emerald-600'
                              : 'transparent'
                          }`}
                        >
                          <Ionicons
                            name={isActive ? item.activeIcon : item.icon}
                            size={17}
                            color={isActive ? '#ffffff' : palette.textMutedColor}
                          />
                          <Text
                            className={`text-[13px] font-medium ${
                              isActive ? 'text-white font-bold' : palette.text
                            }`}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Footer Actions */}
            <View className="px-3 pt-2 border-t border-gray-200/15">
              <Pressable
                onPress={async () => {
                  onClose();
                  await clearSession();
                  router.replace('/(auth)/login');
                }}
                className="flex-row items-center justify-center gap-2 rounded-[14px] bg-red-500/15 py-2.5"
              >
                <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                <Text className="text-[12px] font-bold text-red-500">Sign Out of Curexa</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* iOS Switcher Modal */}
      <IosPortalSwitcherModal
        visible={showSwitcher}
        onClose={() => setShowSwitcher(false)}
      />
    </>
  );
}
