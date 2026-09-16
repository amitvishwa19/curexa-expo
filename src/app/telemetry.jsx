import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaTelemetryScreen() {
  const { palette } = useAppTheme();
  const { patients } = useCurexa();

  const [selectedBed, setSelectedBed] = useState('ICU-01');
  const [heartRate, setHeartRate] = useState(76);
  const [spo2, setSpo2] = useState(99);
  const [respRate, setRespRate] = useState(16);
  const [bpSys, setBpSys] = useState(122);
  const [bpDia, setBpDia] = useState(82);

  // Live telemetry pulse simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate((prev) => 72 + Math.floor(Math.random() * 8));
      setSpo2((prev) => (Math.random() > 0.8 ? 98 : 99));
      setRespRate((prev) => 15 + Math.floor(Math.random() * 3));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const icuBeds = [
    { id: 'ICU-01', patient: 'Eleanor Vance', age: 38, condition: 'Post-CABG Day 1', hr: heartRate, spo2: spo2, bp: `${bpSys}/${bpDia}`, status: 'STABLE' },
    { id: 'ICU-02', patient: 'David Miller', age: 62, condition: 'Acute Respiratory Distress', hr: 94, spo2: 95, bp: '140/92', status: 'ALERT' },
    { id: 'ICU-03', patient: 'Sophia Taylor', age: 29, condition: 'Post-Trauma ICU Obs', hr: 78, spo2: 99, bp: '118/76', status: 'STABLE' },
    { id: 'ICU-04', patient: 'Arthur King', age: 71, condition: 'Severe Sepsis Protocol', hr: 104, spo2: 93, bp: '95/60', status: 'CRITICAL' },
  ];

  const currentBed = icuBeds.find((b) => b.id === selectedBed) || icuBeds[0];

  return (
    <AppScreen>
      <CurexaHeader
        title="Live ICU Telemetry & Vitals Monitor"
        subtitle="Continuous Multi-Parameter Ward & ICU Waveform Monitor"
        rightAction={{
          icon: 'radio-outline',
          onPress: () => Alert.alert('Central Telemetry Hub', 'Telemetry station streaming at 250 Hz sample rate.'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* ICU Bed Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2.5 flex-row gap-2">
          {icuBeds.map((bed) => {
            const isSelected = selectedBed === bed.id;
            return (
              <Pressable
                key={bed.id}
                onPress={() => setSelectedBed(bed.id)}
                className={`rounded-[14px] p-2.5 min-w-[130px] border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : `${palette.surfaceInset} ${palette.border}`
                }`}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`text-[12px] font-bold ${palette.text}`}>{bed.id}</Text>
                  <View
                    className={`h-2 w-2 rounded-full ${
                      bed.status === 'CRITICAL'
                        ? 'bg-rose-500'
                        : bed.status === 'ALERT'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </View>
                <Text className={`text-[11px] font-semibold ${palette.text}`} numberOfLines={1}>
                  {bed.patient}
                </Text>
                <Text className={`text-[9.5px] ${palette.textMuted}`} numberOfLines={1}>
                  HR: {bed.hr} • SpO2: {bed.spo2}%
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Live Patient Monitor Shell */}
        <View className="mb-3 rounded-[24px] bg-gray-950 p-4 shadow-xl border border-gray-800">
          {/* Top Bar of Monitor */}
          <View className="flex-row items-center justify-between border-b border-gray-800 pb-2 mb-3">
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[14px] font-bold text-white">{currentBed.patient}</Text>
                <View className="rounded bg-emerald-500/20 px-1.5 py-0.5">
                  <Text className="text-[9px] font-bold text-emerald-400">{currentBed.id}</Text>
                </View>
              </View>
              <Text className="text-[10px] text-gray-400">Diagnosis: {currentBed.condition}</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-1">
                <View className="h-2 w-2 rounded-full bg-emerald-400" />
                <Text className="text-[10px] font-mono font-bold text-emerald-400">LEAD II • SENS 1.0</Text>
              </View>
              <Text className="text-[9px] text-gray-500">Auto-Sweep 25mm/s</Text>
            </View>
          </View>

          {/* ECG Simulated Waveform Canvas */}
          <View className="mb-3 h-28 w-full rounded-[14px] bg-black/60 p-2.5 justify-center overflow-hidden border border-emerald-950">
            {/* Waveform graphic bars representation */}
            <View className="flex-row items-center justify-between opacity-90">
              <Text className="font-mono text-[10px] font-bold text-emerald-500 tracking-widest">
                /\_/\__/\__/\_/\__/\_/\__/\__/\_/\__/\_/\__/\__/\_/\__/\_/\__/\__/\_/\
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="font-mono text-[9px] text-emerald-400">P-Q-R-S-T Complex Normalized</Text>
              <Text className="font-mono text-[9px] text-emerald-400">QTc: 412ms • PR: 160ms</Text>
            </View>
          </View>

          {/* Real-time Numeric Vitals Matrix */}
          <View className="flex-row flex-wrap gap-2">
            {/* Heart Rate */}
            <View className="w-[48%] flex-1 min-w-[120px] rounded-[14px] bg-gray-900 p-2.5 border border-emerald-900/50">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-emerald-400">Heart Rate (HR)</Text>
                <Ionicons name="heart" size={14} color="#10b981" />
              </View>
              <View className="mt-1 flex-row items-baseline gap-1">
                <Text className="text-[26px] font-mono font-bold text-emerald-400">{currentBed.hr}</Text>
                <Text className="text-[10px] text-gray-400">bpm</Text>
              </View>
              <Text className="text-[9px] text-gray-500">Normal Range: 60 - 100</Text>
            </View>

            {/* SpO2 */}
            <View className="w-[48%] flex-1 min-w-[120px] rounded-[14px] bg-gray-900 p-2.5 border border-cyan-900/50">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-cyan-400">Oxygen (SpO2)</Text>
                <Ionicons name="water" size={14} color="#06b6d4" />
              </View>
              <View className="mt-1 flex-row items-baseline gap-1">
                <Text className="text-[26px] font-mono font-bold text-cyan-400">{currentBed.spo2}</Text>
                <Text className="text-[10px] text-gray-400">%</Text>
              </View>
              <Text className="text-[9px] text-gray-500">Pleth Plethysmograph: 99%</Text>
            </View>

            {/* Blood Pressure */}
            <View className="w-[48%] flex-1 min-w-[120px] rounded-[14px] bg-gray-900 p-2.5 border border-amber-900/50">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-amber-400">NIBP (Sys/Dia)</Text>
                <Ionicons name="speedometer" size={14} color="#f59e0b" />
              </View>
              <View className="mt-1 flex-row items-baseline gap-1">
                <Text className="text-[24px] font-mono font-bold text-amber-400">{currentBed.bp}</Text>
                <Text className="text-[10px] text-gray-400">mmHg</Text>
              </View>
              <Text className="text-[9px] text-gray-500">Mean Arterial MAP: 93</Text>
            </View>

            {/* Respiration */}
            <View className="w-[48%] flex-1 min-w-[120px] rounded-[14px] bg-gray-900 p-2.5 border border-purple-900/50">
              <View className="flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-purple-400">Resp Rate (RR)</Text>
                <Ionicons name="pulse" size={14} color="#a855f7" />
              </View>
              <View className="mt-1 flex-row items-baseline gap-1">
                <Text className="text-[26px] font-mono font-bold text-purple-400">{respRate}</Text>
                <Text className="text-[10px] text-gray-400">rpm</Text>
              </View>
              <Text className="text-[9px] text-gray-500">Capnography EtCO2: 36</Text>
            </View>
          </View>
        </View>

        {/* Telemetry Clinical Actions */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => Alert.alert('Stat 12-Lead ECG Strip', 'Captured and dispatched to cardiology EMR.')}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-emerald-600 py-2.5 shadow-sm"
          >
            <Ionicons name="print-outline" size={16} color="#ffffff" />
            <Text className="text-[12px] font-bold text-white">Record 12-Lead Strip</Text>
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Code Blue / Rapid Response', 'Alert sent to ICU attending and crash cart nurse.')}
            className="rounded-[12px] bg-rose-600 px-3.5 items-center justify-center shadow-sm"
          >
            <Text className="text-[12px] font-bold text-white">Trigger Stat Code</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
