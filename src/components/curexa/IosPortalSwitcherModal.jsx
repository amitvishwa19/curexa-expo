import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function IosPortalSwitcherModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { portalMode, setPortalMode } = useCurexa();

  const handleSelectMode = (mode) => {
    if (mode === portalMode) {
      onClose();
      return;
    }

    setPortalMode(mode);
    onClose();

    Toast.show({
      type: 'success',
      text1: mode === 'HOSPITAL' ? 'Hospital & Doctor Portal Active' : 'Patient Care Portal Active',
      text2:
        mode === 'HOSPITAL'
          ? 'Switched to Super Specialty HMS, Wards & Clinical Command Center'
          : 'Switched to My Medical Records, Queue Tokens & Telemedicine',
      visibilityTime: 2500,
    });
  };

  const isHospital = portalMode === 'HOSPITAL';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/60 px-3.5 pb-2">
          <TouchableWithoutFeedback>
            <View
              style={{
                paddingBottom: Math.max(insets.bottom, 14),
              }}
              className="w-full max-w-lg self-center"
            >
              {/* Top iOS Card Container */}
              <View
                className={`overflow-hidden rounded-[20px] ${
                  isDark ? 'bg-slate-900/95 border border-slate-800/80' : 'bg-white/95 border border-slate-200/80'
                } shadow-2xl backdrop-blur-xl`}
              >
                {/* Header description */}
                <View className="items-center px-4 py-3 border-b border-gray-200/15">
                  <View className="h-1 w-9 rounded-full bg-gray-400/40 mb-2" />
                  <Text className="text-[12px] font-bold uppercase tracking-[1px] text-emerald-600">
                    Switch App Portal Mode
                  </Text>
                  <Text className={`mt-0.5 text-center text-[11px] ${palette.textMuted}`}>
                    Choose between Hospital Clinical Suite and Patient Care Services
                  </Text>
                </View>

                {/* Option 1: Hospital & Doctor Portal */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectMode('HOSPITAL')}
                  className={`flex-row items-center justify-between p-3.5 ${
                    isHospital ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50/70') : ''
                  }`}
                >
                  <View className="flex-1 flex-row items-center gap-3 mr-2">
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-[14px] ${
                        isHospital ? 'bg-emerald-500/20' : 'bg-gray-500/15'
                      }`}
                    >
                      <Ionicons
                        name="business"
                        size={22}
                        color={isHospital ? '#059669' : palette.textMutedColor}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className={`text-[14.5px] font-bold ${palette.text}`}>
                          Hospital & Doctor Portal
                        </Text>
                        <View className="rounded-full bg-emerald-500/20 px-1.5 py-0.5">
                          <Text className="text-[9px] font-bold text-emerald-600">HMS</Text>
                        </View>
                      </View>
                      <Text className={`text-[11px] ${palette.textMuted} mt-0.5`}>
                        Super Specialty HMS, IPD Beds, ICU Telemetry & e-Rx
                      </Text>
                    </View>
                  </View>

                  <View className="items-center justify-center">
                    {isHospital ? (
                      <Ionicons name="checkmark-circle" size={22} color="#059669" />
                    ) : (
                      <View className="h-5 w-5 rounded-full border border-gray-400/40" />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View className="h-[0.5px] w-full bg-gray-200/20" />

                {/* Option 2: Patient Care Portal */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelectMode('PATIENT')}
                  className={`flex-row items-center justify-between p-3.5 ${
                    !isHospital ? (isDark ? 'bg-sky-500/10' : 'bg-sky-50/70') : ''
                  }`}
                >
                  <View className="flex-1 flex-row items-center gap-3 mr-2">
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-[14px] ${
                        !isHospital ? 'bg-sky-500/20' : 'bg-gray-500/15'
                      }`}
                    >
                      <Ionicons
                        name="person"
                        size={22}
                        color={!isHospital ? '#0284c7' : palette.textMutedColor}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className={`text-[14.5px] font-bold ${palette.text}`}>
                          Patient Care Portal
                        </Text>
                        <View className="rounded-full bg-sky-500/20 px-1.5 py-0.5">
                          <Text className="text-[9px] font-bold text-sky-600">PATIENT</Text>
                        </View>
                      </View>
                      <Text className={`text-[11px] ${palette.textMuted} mt-0.5`}>
                        My EMR Records, OPD Queue Tokens & Telemedicine Video
                      </Text>
                    </View>
                  </View>

                  <View className="items-center justify-center">
                    {!isHospital ? (
                      <Ionicons name="checkmark-circle" size={22} color="#0284c7" />
                    ) : (
                      <View className="h-5 w-5 rounded-full border border-gray-400/40" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Bottom Standalone iOS Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                className={`mt-2.5 items-center justify-center rounded-[16px] py-3.5 ${
                  isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
                } shadow-md`}
              >
                <Text className="text-[15px] font-bold text-emerald-600">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
