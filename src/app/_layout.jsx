import "../../global.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";

import { setNotificationHandler } from "expo-notifications";
import Toast from "react-native-toast-message";
import { toastConfig } from "~/components/CustomToast";
import { CurexaDrawerProvider } from "~/components/curexa/CurexaDrawer";
import { NotificationProvider } from "~/contexts/NotificationContext";
import { NotificationStoreProvider } from "~/contexts/NotificationStore";
import { CurexaProvider } from "~/providers/CurexaProvider";
import { UniversalLoaderProvider } from "~/providers/UniversalLoaderProvider";
import { AppThemeProvider, useAppTheme } from "~/theme/AppTheme";

setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from "expo-router";

export const unstable_settings = {
    // Ensure that reloading on deeper routes keeps a back button present.
    initialRouteName: "index",
};

export default function RootLayout() {
    const [loaded, error] = useFonts({
        ...FontAwesome.font,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    if (!loaded) {
        return null;
    }

    return (
        <AppThemeProvider>
            <UniversalLoaderProvider>
                <CurexaProvider>
                    <CurexaDrawerProvider>
                        <RootLayoutNav />
                    </CurexaDrawerProvider>
                </CurexaProvider>
            </UniversalLoaderProvider>
        </AppThemeProvider>
    );
}

function RootLayoutNav() {
    const { palette } = useAppTheme();

    return (
        <ThemeProvider
            value={palette.navigation === "dark" ? DarkTheme : DefaultTheme}
        >
            <NotificationProvider>
                <NotificationStoreProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(misc)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="beds" />
                        <Stack.Screen name="pharmacy" />
                        <Stack.Screen name="laboratory" />
                        <Stack.Screen name="billing" />
                        <Stack.Screen name="departments" />
                        <Stack.Screen name="prescriptions" />
                        <Stack.Screen name="workflow" />
                        <Stack.Screen name="reports" />
                        <Stack.Screen name="crm" />
                        <Stack.Screen name="ai-assistant" />
                        <Stack.Screen name="scanner" />
                        <Stack.Screen name="telemetry" />
                        <Stack.Screen name="messaging-automation" />
                        <Stack.Screen name="telemedicine" />
                        <Stack.Screen name="roster" />
                        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                    </Stack>
                    <Toast config={toastConfig} topOffset={34} />
                </NotificationStoreProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
