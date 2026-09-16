import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaTelemedicineScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { portalMode, currentPatientProfile } = useCurexa();

  const isPatient = portalMode === 'PATIENT';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState('08:42');
  const [clinicalNotes, setClinicalNotes] = useState('');

  return (
    <AppScreen>
      <CurexaHeader
        title="Telemedicine Virtual OPD"
        subtitle="Encrypted WebRTC HD Clinical Consultation"
        rightAction={{
          icon: 'shield-checkmark',
          onPress: () => Alert.alert('End-to-End Encrypted', 'Consultation room complies with HIPAA and clinical privacy regulations.'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* Main Video Consultation Stage */}
        <View className="relative mb-3 h-72 w-full overflow-hidden rounded-[24px] bg-gray-950 shadow-lg border border-gray-800">
          {/* Main Feed Simulator */}
          <View className="flex-1 items-center justify-center">
            {isVideoOff ? (
              <View className="items-center justify-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-2">
                  <Ionicons name="person" size={32} color="#9ca3af" />
                </View>
                <Text className="text-[12px] font-semibold text-gray-400">Camera Feed Paused</Text>
              </View>
            ) : (
              <View className="items-center justify-center">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 mb-2 border border-blue-400/40">
                  <Ionicons name="medkit" size={36} color="#38bdf8" />
                </View>
                <Text className="text-[14px] font-bold text-white">
                  {isPatient ? 'Dr. Sarah Lin, MD (Cardiology)' : 'Eleanor Vance (Patient)'}
                </Text>
                <Text className="text-[11px] text-emerald-400 font-mono mt-0.5">HD 1080p • 60 FPS Connected</Text>
              </View>
            )}
          </View>

          {/* Floating Self View Picture-in-Picture */}
          <View className="absolute top-3 right-3 h-24 w-20 rounded-[14px] bg-gray-800 border-2 border-emerald-500/60 items-center justify-center shadow-lg">
            <Ionicons name="person" size={24} color="#ffffff" />
            <Text className="text-[9px] font-bold text-white mt-1">You</Text>
          </View>

          {/* Top Status Overlay */}
          <View className="absolute top-3 left-3 flex-row items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-rose-500" />
            <Text className="font-mono text-[10px] font-bold text-white">LIVE {callDuration}</Text>
          </View>

          {/* Bottom Floating In-Call Media Controls */}
          <View className="absolute bottom-3 left-4 right-4 flex-row items-center justify-center gap-3">
            <Pressable
              onPress={() => setIsMuted((p) => !p)}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isMuted ? 'bg-rose-600' : 'bg-gray-800/90'
              }`}
            >
              <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={18} color="#ffffff" />
            </Pressable>

            <Pressable
              onPress={() => setIsVideoOff((p) => !p)}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isVideoOff ? 'bg-rose-600' : 'bg-gray-800/90'
              }`}
            >
              <Ionicons name={isVideoOff ? 'videocam-off' : 'videocam'} size={18} color="#ffffff" />
            </Pressable>

            <Pressable
              onPress={() => {
                Alert.alert('End Consultation', 'Are you sure you want to end this video OPD session?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'End Call', style: 'destructive', onPress: () => router.back() },
                ]);
              }}
              className="h-11 px-5 items-center justify-center rounded-full bg-rose-600 shadow-md"
            >
              <Ionicons name="call" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {/* Live In-Call Clinical Notes & E-Prescription */}
        {!isPatient && (
          <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`text-[12px] font-bold ${palette.text}`}>In-Consultation Clinical Notes</Text>
              <Pressable
                onPress={() => Alert.alert('Saved to EMR', 'Notes synced to patient medical record.')}
                className="rounded-[8px] bg-emerald-600 px-2 py-0.5"
              >
                <Text className="text-[10px] font-bold text-white">Save to EMR</Text>
              </Pressable>
            </View>

            <TextInput
              value={clinicalNotes}
              onChangeText={setClinicalNotes}
              multiline
              numberOfLines={3}
              placeholder="Record patient complaints, clinical observations, and diagnosis during this call..."
              placeholderTextColor={palette.textMutedColor}
              className={`min-h-[70px] rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
            />
          </View>
        )}

        {/* Quick Patient EMR Summary Strip */}
        <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
          <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-emerald-600">
            Consultation Patient Details
          </Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-[13px] font-bold ${palette.text}`}>Eleanor Vance</Text>
              <Text className={`text-[10px] ${palette.textMuted}`}>Age 38 • Female • Blood Group: O+</Text>
            </View>
            <View className="rounded-[8px] bg-sky-500/15 px-2.5 py-1">
              <Text className="text-[10px] font-bold text-sky-700">Token OPD-04</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
