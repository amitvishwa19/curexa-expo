import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaRosterScreen() {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' | 'SBAR_HANDOVER'
  const [showAddHandover, setShowAddHandover] = useState(false);

  // SBAR form
  const [patientName, setPatientName] = useState('');
  const [situation, setSituation] = useState('');
  const [background, setBackground] = useState('');
  const [assessment, setAssessment] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const [shifts, setShifts] = useState([
    {
      dept: 'Cardiology & CCU',
      onCallDoctor: 'Dr. Rajesh Sharma, MD',
      phone: '+91 98101 22334',
      shift: '08:00 AM - 08:00 PM (Day Lead)',
      resident: 'Dr. Ananya Roy',
      status: 'ON_DUTY',
    },
    {
      dept: 'Emergency & Trauma (ER)',
      onCallDoctor: 'Dr. Vikram Sen, MD',
      phone: '+91 98112 34567',
      shift: '08:00 PM - 08:00 AM (Night On-Call)',
      resident: 'Dr. Priya Sharma',
      status: 'ON_DUTY',
    },
    {
      dept: 'Neurology & Stroke Unit',
      onCallDoctor: 'Dr. Amit Malhotra, MD',
      phone: '+91 98220 89123',
      shift: '08:00 AM - 04:00 PM (Morning)',
      resident: 'Dr. Maya Patel',
      status: 'ON_DUTY',
    },
    {
      dept: 'Obstetrics & Gynecology',
      onCallDoctor: 'Dr. Priya Nair, MD',
      phone: '+91 98330 45678',
      shift: '24-Hour Emergency Coverage',
      resident: 'Dr. Kavita Rao',
      status: 'ON_STANDBY',
    },
  ]);

  const [handovers, setHandovers] = useState([
    {
      id: 'sbar-1',
      patient: 'Deepika Joshi (Bed 302)',
      time: '08:00 AM Shift Change',
      outgoingDr: 'Dr. Vikram Sen',
      incomingDr: 'Dr. Rajesh Sharma',
      s: 'Situation: Post-CABG Day 1, chest drainage minimal (30ml/hr).',
      b: 'Background: 38yo female, CAD, post-op telemetry normal sinus rhythm.',
      a: 'Assessment: Hemodynamically stable, extubated, pain controlled on PCA pump.',
      r: 'Recommendation: Taper IV inotropes by 14:00 if MAP > 70 mmHg.',
    },
  ]);

  const handleSaveHandover = () => {
    if (!patientName || !situation) return;
    setHandovers((prev) => [
      {
        id: `sbar-${Date.now()}`,
        patient: patientName,
        time: 'Just now',
        outgoingDr: 'Dr. Rajesh Sharma',
        incomingDr: 'Incoming Duty Attending',
        s: `Situation: ${situation}`,
        b: `Background: ${background || 'Standard clinical history.'}`,
        a: `Assessment: ${assessment || 'Stable under observation.'}`,
        r: `Recommendation: ${recommendation || 'Continue current treatment protocol.'}`,
      },
      ...prev,
    ]);
    setShowAddHandover(false);
    setPatientName('');
    setSituation('');
    setBackground('');
    setAssessment('');
    setRecommendation('');
  };

  return (
    <AppScreen>
      <CurexaHeader
        title="Doctor Roster & Shift Handovers"
        subtitle="On-Call Schedules & Clinical SBAR Handover Records"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => setShowAddHandover(true),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* Tab Switcher */}
        <View className={`mb-2.5 flex-row rounded-[12px] p-1 ${palette.surfaceInset}`}>
          {[
            { id: 'ROSTER', label: 'On-Call Doctors Roster', icon: 'people-outline' },
            { id: 'SBAR_HANDOVER', label: 'SBAR Handover Logs', icon: 'swap-horizontal-outline' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-[9px] py-1.5 ${
                activeTab === tab.id ? 'bg-emerald-600 shadow-sm' : ''
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={activeTab === tab.id ? '#ffffff' : palette.textMutedColor}
              />
              <Text
                className={`text-[11px] font-bold ${
                  activeTab === tab.id ? 'text-white' : palette.textMuted
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Doctor Roster Tab */}
        {activeTab === 'ROSTER' && (
          <View className="gap-2">
            {shifts.map((shift, idx) => (
              <View
                key={idx}
                className={`rounded-[16px] p-3 shadow-sm ${palette.surface} border border-gray-200/10`}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-[12px] font-bold text-emerald-600">{shift.dept}</Text>
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      shift.status === 'ON_DUTY' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    }`}
                  >
                    <Text
                      className={`text-[9px] font-bold ${
                        shift.status === 'ON_DUTY' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {shift.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <Text className={`text-[13px] font-bold ${palette.text}`}>{shift.onCallDoctor}</Text>
                <Text className={`text-[10px] ${palette.textMuted} mt-0.5`}>
                  Shift: {shift.shift} • Resident: {shift.resident}
                </Text>

                <View className="mt-2 flex-row gap-2 pt-2 border-t border-gray-200/10">
                  <Pressable
                    onPress={() => Alert.alert('Speed Dial', `Calling ${shift.onCallDoctor} at ${shift.phone}...`)}
                    className="flex-1 flex-row items-center justify-center gap-1 rounded-[10px] bg-emerald-600 py-1.5"
                  >
                    <Ionicons name="call" size={12} color="#ffffff" />
                    <Text className="text-[10.5px] font-bold text-white">Direct Line</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => Alert.alert('Pager Alert', `Priority pager broadcast sent to ${shift.onCallDoctor}.`)}
                    className={`flex-1 flex-row items-center justify-center gap-1 rounded-[10px] ${palette.surfaceInset} py-1.5`}
                  >
                    <Ionicons name="notifications-outline" size={12} color="#059669" />
                    <Text className="text-[10.5px] font-bold text-emerald-600">Stat Page</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SBAR Handover Tab */}
        {activeTab === 'SBAR_HANDOVER' && (
          <View className="gap-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-emerald-600">
                Standardized SBAR Shift Logs
              </Text>
              <Pressable
                onPress={() => setShowAddHandover(true)}
                className="rounded-[8px] bg-emerald-600 px-2 py-0.5"
              >
                <Text className="text-[10px] font-bold text-white">+ New SBAR</Text>
              </Pressable>
            </View>

            {handovers.map((h) => (
              <View
                key={h.id}
                className={`rounded-[16px] p-3 shadow-sm ${palette.surface} border border-emerald-500/20`}
              >
                <View className="flex-row items-center justify-between border-b border-gray-200/10 pb-1.5 mb-2">
                  <View>
                    <Text className={`text-[13px] font-bold ${palette.text}`}>{h.patient}</Text>
                    <Text className={`text-[9.5px] ${palette.textMuted}`}>
                      {h.outgoingDr} ➔ {h.incomingDr}
                    </Text>
                  </View>
                  <Text className="text-[10px] font-medium text-emerald-600">{h.time}</Text>
                </View>

                <View className="gap-1.5">
                  <View className={`rounded-[8px] p-2 ${palette.surfaceInset}`}>
                    <Text className="text-[10px] font-bold text-sky-600">S (Situation)</Text>
                    <Text className={`text-[11px] ${palette.text}`}>{h.s}</Text>
                  </View>
                  <View className={`rounded-[8px] p-2 ${palette.surfaceInset}`}>
                    <Text className="text-[10px] font-bold text-purple-600">B (Background)</Text>
                    <Text className={`text-[11px] ${palette.text}`}>{h.b}</Text>
                  </View>
                  <View className={`rounded-[8px] p-2 ${palette.surfaceInset}`}>
                    <Text className="text-[10px] font-bold text-amber-600">A (Assessment)</Text>
                    <Text className={`text-[11px] ${palette.text}`}>{h.a}</Text>
                  </View>
                  <View className={`rounded-[8px] p-2 ${palette.surfaceInset}`}>
                    <Text className="text-[10px] font-bold text-emerald-600">R (Recommendation)</Text>
                    <Text className={`text-[11px] ${palette.text}`}>{h.r}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Create SBAR Handover Modal */}
        <Modal visible={showAddHandover} transparent animationType="slide" onRequestClose={() => setShowAddHandover(false)}>
          <View className="flex-1 justify-end bg-black/70">
            <Pressable className="absolute inset-0" onPress={() => setShowAddHandover(false)} />
            <View
              className={`rounded-t-[28px] p-4 ${palette.surface}`}
              style={{ paddingBottom: Math.max(insets.bottom, 28) + 24, maxHeight: '90%' }}
            >
              <View className="mb-2 flex-row items-center justify-between border-b border-gray-200/15 pb-2">
                <Text className={`text-[15px] font-bold ${palette.text}`}>Record Clinical SBAR Handover</Text>
                <Pressable onPress={() => setShowAddHandover(false)} className={`rounded-full p-1 ${palette.surfaceAlt}`}>
                  <Ionicons name="close" size={18} color={palette.textMutedColor} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="gap-2 mb-2">
                <View>
                  <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Patient Name & Bed *</Text>
                  <TextInput
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="e.g. Deepika Joshi (Bed 302)"
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
                <View>
                  <Text className={`text-[10px] font-semibold mb-1 text-sky-600`}>Situation (Current state) *</Text>
                  <TextInput
                    value={situation}
                    onChangeText={setSituation}
                    placeholder="Current clinical problem / event..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
                <View>
                  <Text className={`text-[10px] font-semibold mb-1 text-purple-600`}>Background (History & context)</Text>
                  <TextInput
                    value={background}
                    onChangeText={setBackground}
                    placeholder="Brief background & admissions info..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
                <View>
                  <Text className={`text-[10px] font-semibold mb-1 text-amber-600`}>Assessment (Clinical finding)</Text>
                  <TextInput
                    value={assessment}
                    onChangeText={setAssessment}
                    placeholder="What is your assessment of condition..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
                <View>
                  <Text className={`text-[10px] font-semibold mb-1 text-emerald-600`}>Recommendation (Action plan)</Text>
                  <TextInput
                    value={recommendation}
                    onChangeText={setRecommendation}
                    placeholder="What specific actions are recommended next..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
              </ScrollView>

              <View className="flex-row gap-2 pt-2 border-t border-gray-200/15">
                <Pressable onPress={() => setShowAddHandover(false)} className="flex-1 rounded-[12px] bg-gray-500/15 py-3 items-center">
                  <Text className={`text-[12px] font-bold ${palette.text}`}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveHandover} className="flex-1 rounded-[12px] bg-emerald-600 py-3 items-center">
                  <Text className="text-[12px] font-bold text-white">Save Handover Log</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AppScreen>
  );
}
