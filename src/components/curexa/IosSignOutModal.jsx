import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppTheme } from '~/theme/AppTheme';
import { clearSession } from '~/utils/authStorage';

export default function IosSignOutModal({ visible, onClose }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await clearSession();
      onClose();
      Toast.show({
        type: 'info',
        text1: 'Signed Out',
        text2: 'You have been safely signed out of Curexa.',
        visibilityTime: 2000,
      });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
      onClose();
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

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
                paddingBottom: Math.max(insets.bottom, 20) + 16,
              }}
              className="w-full max-w-lg self-center"
            >
              {/* Top iOS Card Container */}
              <View
                className={`overflow-hidden rounded-[20px] ${
                  isDark
                    ? 'bg-slate-900/95 border border-slate-800/80'
                    : 'bg-white/95 border border-slate-200/80'
                } shadow-2xl backdrop-blur-xl`}
              >
                {/* Header Information */}
                <View className="items-center px-5 pt-4 pb-3">
                  <View className="h-1 w-9 rounded-full bg-gray-400/40 mb-3" />
                  
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-red-500/15 mb-2.5">
                    <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                  </View>

                  <Text className={`text-[16px] font-bold ${palette.text}`}>
                    Sign Out of Curexa
                  </Text>
                  
                  <Text className={`mt-1 text-center text-[12px] leading-4 ${palette.textMuted} px-2`}>
                    Are you sure you want to sign out? You will need to sign in again to access your patient records, appointments, and hospital workspace.
                  </Text>
                </View>

                {/* Divider */}
                <View className="h-[0.5px] w-full bg-gray-200/20" />

                {/* Destructive Action: Sign Out */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSignOut}
                  disabled={loading}
                  className="items-center justify-center py-3.5"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Text className="text-[16px] font-bold text-red-500">
                      Sign Out
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bottom Standalone iOS Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                disabled={loading}
                className={`mt-2.5 items-center justify-center rounded-[16px] py-3.5 ${
                  isDark
                    ? 'bg-slate-900 border border-slate-800'
                    : 'bg-white border border-slate-200'
                } shadow-md`}
              >
                <Text className={`text-[16px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
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
