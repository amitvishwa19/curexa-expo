import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaScannerScreen() {
  const { palette } = useAppTheme();
  const { patients, medicines } = useCurexa();

  const [scanMode, setScanMode] = useState('PATIENT'); // 'PATIENT' | 'MEDICINE' | 'LAB_SAMPLE'
  const [scannedData, setScannedData] = useState(null);
  const [manualCode, setManualCode] = useState('');

  const handleSimulateScan = (code) => {
    const inputCode = code || manualCode;
    if (!inputCode) {
      // Pick first patient as sample
      const p = patients[0] || { displayName: 'Eleanor Vance', sku: 'PAT-2026-001', ward: 'Cardiology 3B', bed: 'Bed 302', bloodGroup: 'O+' };
      setScannedData({
        type: scanMode,
        code: p.sku,
        patient: p,
        verifiedAt: new Date().toLocaleTimeString(),
        status: 'VERIFIED_MATCH',
      });
      return;
    }

    setScannedData({
      type: scanMode,
      code: inputCode,
      patient: patients[0],
      verifiedAt: new Date().toLocaleTimeString(),
      status: 'VERIFIED_MATCH',
    });
  };

  const handleClear = () => {
    setScannedData(null);
    setManualCode('');
  };

  return (
    <AppScreen>
      <CurexaHeader
        title="Bedside QR & Barcode Scanner"
        subtitle="Patient Wristband, Drug & Lab Sample Verification"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* Scanner Mode Filter */}
        <View className={`mb-2.5 flex-row rounded-[12px] p-1 ${palette.surfaceInset}`}>
          {[
            { id: 'PATIENT', label: 'Patient Wristband', icon: 'person-outline' },
            { id: 'MEDICINE', label: 'Medicine Barcode', icon: 'medkit-outline' },
            { id: 'LAB_SAMPLE', label: 'Lab Sample Vials', icon: 'flask-outline' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => {
                setScanMode(tab.id);
                setScannedData(null);
              }}
              className={`flex-1 flex-row items-center justify-center gap-1 rounded-[9px] py-1.5 ${
                scanMode === tab.id ? 'bg-emerald-600 shadow-sm' : ''
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={scanMode === tab.id ? '#ffffff' : palette.textMutedColor}
              />
              <Text
                className={`text-[10px] font-bold ${
                  scanMode === tab.id ? 'text-white' : palette.textMuted
                }`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Camera Viewfinder Mockup */}
        <View className="relative mb-3 h-56 w-full items-center justify-center overflow-hidden rounded-[24px] bg-gray-950 shadow-md">
          {/* Target Reticle */}
          <View className="h-36 w-48 rounded-[16px] border-2 border-dashed border-emerald-400/80 items-center justify-center bg-emerald-500/5">
            <Ionicons name="scan-outline" size={48} color="#10b981" />
            <Text className="mt-1 text-[10px] font-bold tracking-wider text-emerald-300">
              ALIGN {scanMode} CODE
            </Text>
          </View>

          {/* Top Scan Status overlay */}
          <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
              <View className="h-2 w-2 rounded-full bg-emerald-400" />
              <Text className="text-[10px] font-bold text-white">Laser Engine Active</Text>
            </View>
            <Pressable
              onPress={() => Alert.alert('Torch', 'Camera flash toggled.')}
              className="rounded-full bg-black/60 p-1.5"
            >
              <Ionicons name="flashlight-outline" size={16} color="#ffffff" />
            </Pressable>
          </View>

          {/* Trigger Scan Overlay */}
          <Pressable
            onPress={() => handleSimulateScan()}
            className="absolute bottom-3 rounded-full bg-emerald-600 px-4 py-1.5 shadow-lg"
          >
            <Text className="text-[11px] font-bold text-white">Capture / Tap to Scan</Text>
          </Pressable>
        </View>

        {/* Manual Barcode Entry */}
        <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
          <Text className={`text-[11px] font-bold mb-1.5 ${palette.text}`}>Manual Barcode / SKU Input</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="e.g. PAT-2026-001 or MED-409"
              placeholderTextColor={palette.textMutedColor}
              className={`flex-1 rounded-[12px] p-2 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
            />
            <Pressable
              onPress={() => handleSimulateScan(manualCode)}
              className="rounded-[12px] bg-emerald-600 px-3.5 items-center justify-center shadow-sm"
            >
              <Text className="text-[11px] font-bold text-white">Lookup</Text>
            </Pressable>
          </View>
        </View>

        {/* Scan Results Card */}
        {scannedData && (
          <View className={`rounded-[18px] p-3.5 shadow-md ${palette.surface} border border-emerald-500/40`}>
            <View className="flex-row items-center justify-between border-b border-gray-200/15 pb-2 mb-2">
              <View className="flex-row items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500/20">
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                </View>
                <View>
                  <Text className={`text-[13px] font-bold ${palette.text}`}>Wristband Identity Match</Text>
                  <Text className={`text-[10px] ${palette.textMuted}`}>Timestamp: {scannedData.verifiedAt}</Text>
                </View>
              </View>
              <Pressable onPress={handleClear} className={`rounded-full p-1 ${palette.surfaceAlt}`}>
                <Ionicons name="close" size={16} color={palette.textMutedColor} />
              </Pressable>
            </View>

            {/* Patient Profile Card */}
            <View className={`rounded-[14px] p-2.5 ${palette.surfaceInset} mb-2`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-[13px] font-bold ${palette.text}`}>{scannedData.patient.displayName}</Text>
                  <Text className={`text-[10px] ${palette.textMuted}`}>
                    MRN #{scannedData.patient.sku} • {scannedData.patient.gender} • {scannedData.patient.age} yrs
                  </Text>
                </View>
                <View className="rounded-full bg-emerald-500/20 px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-emerald-700">{scannedData.patient.bloodGroup}</Text>
                </View>
              </View>

              <View className="mt-2 flex-row gap-2 border-t border-gray-200/10 pt-2">
                <View className="flex-1">
                  <Text className={`text-[9px] uppercase ${palette.textMuted}`}>Ward & Bed</Text>
                  <Text className={`text-[11px] font-bold ${palette.text}`}>
                    {scannedData.patient.ward || 'Cardiology 3B'} ({scannedData.patient.bed || 'Bed 302'})
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-[9px] uppercase ${palette.textMuted}`}>Vitals Status</Text>
                  <Text className="text-[11px] font-bold text-emerald-600">BP: 120/80 • SpO2: 99%</Text>
                </View>
              </View>
            </View>

            {/* 5 Rights of Medication Admin Confirmation */}
            <View className="mb-2.5 rounded-[12px] bg-emerald-500/10 p-2 border border-emerald-500/20">
              <Text className="text-[10px] font-bold text-emerald-700 uppercase">
                Clinical Safety Checklist: 5 Rights Verified
              </Text>
              <Text className={`text-[10px] ${palette.text} mt-0.5`}>
                Right Patient • Right Drug • Right Dose • Right Time • Right Route
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => Alert.alert('Administer Dose', 'Medication administration logged in patient EMR.')}
                className="flex-1 items-center rounded-[12px] bg-emerald-600 py-2.5 shadow-sm"
              >
                <Text className="text-[12px] font-bold text-white">Confirm Dose Administration</Text>
              </Pressable>
              <Pressable
                onPress={handleClear}
                className={`rounded-[12px] px-3 py-2.5 ${palette.surfaceInset}`}
              >
                <Text className={`text-[12px] font-semibold ${palette.text}`}>Scan Next</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}
