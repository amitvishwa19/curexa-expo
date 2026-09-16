import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '~/theme/AppTheme';
import { getSession } from '~/utils/authStorage';

export default function AppEntryGate() {
  const { palette } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState(null);

  useEffect(() => {
    async function determineInitialRoute() {
      try {
        const mode = await AsyncStorage.getItem('devlomatix.curexa_portal_mode');
        setTargetRoute(mode === 'PATIENT' ? '/(misc)/onboarding-patient' : '/(misc)/onboarding-hospital');
      } catch (e) {
        setTargetRoute('/(misc)/onboarding-hospital');
      } finally {
        setLoading(false);
      }
    }
    determineInitialRoute();
  }, []);

  if (loading || !targetRoute) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.page}`}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return <Redirect href={targetRoute} />;
}
