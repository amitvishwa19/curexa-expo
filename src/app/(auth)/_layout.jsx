import { Slot, useSegments } from 'expo-router';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View
} from 'react-native';

import AppScreen from '~/components/AppScreen';
import BrandLogo from '~/components/BrandLogo';

const authRouteCopy = {
    login: {
        badge: 'CUREXA',
        title: 'Welcome to Curexa',
        subtitle:
            'Your trusted healthcare access portal with end-to-end data security. Built to comply with strict HIPAA and GDPR standards, safeguarding all personal records and clinical workflows with enterprise-grade encryption.'
    },
    signup: {
        badge: 'CREATE ACCOUNT',
        title: 'Join Curexa Health',
        subtitle:
            'Create your account backed by full HIPAA and GDPR compliance. We protect your sensitive health information and identity with industry-standard data safety protocols and encryption.'
    },
    'forgot-password': {
        badge: 'RECOVERY',
        title: 'Reset your password',
        subtitle:
            'Protecting your account integrity is our top priority. Enter your registered email address to receive secure, encrypted password recovery instructions complying with healthcare privacy standards.'
    },
    verify: {
        badge: 'VERIFICATION',
        title: 'Confirm your access',
        subtitle:
            'Enhanced two-factor authentication ensures safe access to sensitive health data. Please enter the six-digit verification code sent to your registered contact to confirm your identity.'
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

                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingTop: 44,
                            paddingBottom: 40,
                            paddingHorizontal: 24
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>


                        <View className='flex-1 justify-between'>
                            <View className="items-center h-[40%]">
                                <BrandLogo size={600} />

                                <View className="mt-2.5 min-h-[64px] justify-center px-2">
                                    <Text className="max-w-[320px] text-center text-[12px] leading-5 text-slate-600">
                                        {copy.subtitle}
                                    </Text>
                                </View>
                            </View>

                            <View className="h-[60%]">
                                <Slot />
                            </View>

                        </View>

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </AppScreen>
    );
}