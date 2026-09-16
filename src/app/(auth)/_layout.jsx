import { Slot, useSegments } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View
} from 'react-native';

import AppScreen from '~/components/AppScreen';
import BrandLogo from '~/components/BrandLogo';

const authRouteCopy = {
  login: {
    badge: 'CUREXA',
    title: 'Welcome to Curexa',
    subtitle: 'Sign in to access your clinic, hospital EMR, and patient care management portal.'
  },
  signup: {
    badge: 'CREATE ACCOUNT',
    title: 'Join Curexa Health',
    subtitle: 'Set up your medical staff or patient profile to get started.'
  },
  'forgot-password': {
    badge: 'RECOVERY',
    title: 'Reset your password',
    subtitle:
    'Enter your email and we will send you verification instructions for password recovery.'
  },
  verify: {
    badge: 'VERIFICATION',
    title: 'Confirm your access',
    subtitle:
    'Enter the six-digit verification code to access the Curexa portal.'
  }
};

export default function AuthLayout() {
  const segments = useSegments();
  const routeKey = segments[segments.length - 1];
  const copy = authRouteCopy[routeKey] ?? authRouteCopy.login;

  return (
    <AppScreen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1">
          <View className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-teal-700/10" />
          <View className="absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-sky-500/10" />

          <View className="flex-1">
            <View className="min-h-full justify-center px-6 py-7">
              <View className="mb-6 items-center">
                
                <BrandLogo size={200} />
                <Text className="mt-5 text-center text-3xl font-bold text-slate-900">
                  {copy.title}
                </Text>
                <Text className="mt-2.5 max-w-80 text-center text-[15px] leading-6 text-slate-600">
                  {copy.subtitle}
                </Text>
              </View>

              <View className="rounded-[28px] p-5 shadow-xl shadow-slate-900/10">
                <Slot />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>);

}