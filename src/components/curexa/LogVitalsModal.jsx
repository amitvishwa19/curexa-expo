import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export const METRIC_OPTIONS = [
  { id: 'bp', name: 'Blood Pressure', unit: 'mmHg', icon: 'speedometer-outline', color: '#0284c7', tone: 'bg-sky-500/15', defaultVal: '120/80', timings: ['Resting / Morning', 'Post-Exercise', 'Evening Check', 'Bedtime'] },
  { id: 'glucose', name: 'Glucose / Sugar', unit: 'mg/dL', icon: 'water-outline', color: '#059669', tone: 'bg-emerald-500/15', defaultVal: '95', timings: ['Fasting (Morning)', 'Post-Meal (2 Hours)', 'Pre-Meal', 'Random'] },
  { id: 'hr', name: 'Heart Rate', unit: 'bpm', icon: 'heart-outline', color: '#ef4444', tone: 'bg-rose-500/15', defaultVal: '72', timings: ['Resting Pulse', 'Post-Walk', 'During Stress', 'Recovery'] },
  { id: 'spo2', name: 'Blood Oxygen (SpO2)', unit: '%', icon: 'fitness-outline', color: '#06b6d4', tone: 'bg-cyan-500/15', defaultVal: '99', timings: ['Pulse Oximetry', 'Post-Activity', 'Room Air', 'Oxygen Assisted'] },
  { id: 'weight', name: 'Body Weight', unit: 'kg', icon: 'body-outline', color: '#8b5cf6', tone: 'bg-purple-500/15', defaultVal: '64.0', timings: ['Morning Fasting', 'Post-Workout', 'Evening Scale'] },
  { id: 'temp', name: 'Body Temperature', unit: '°F', icon: 'thermometer-outline', color: '#f59e0b', tone: 'bg-amber-500/15', defaultVal: '98.6', timings: ['Oral Probe', 'Tympanic / Ear', 'Forehead IR', 'Axillary'] },
  { id: 'waist', name: 'Waist Circumference', unit: 'cm', icon: 'resize-outline', color: '#ec4899', tone: 'bg-pink-500/15', defaultVal: '78', timings: ['Morning Measurement', 'Routine Check'] },
  { id: 'cholesterol', name: 'Total Cholesterol', unit: 'mg/dL', icon: 'analytics-outline', color: '#6366f1', tone: 'bg-indigo-500/15', defaultVal: '185', timings: ['Fasting Lab Panel', 'Home Meter Test'] },
];

export default function LogVitalsModal({ visible, onClose }) {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { addVitalRecord } = useCurexa();

  const [selectedMetric, setSelectedMetric] = useState(METRIC_OPTIONS[0]);
  const [val, setVal] = useState(METRIC_OPTIONS[0].defaultVal);
  const [selectedTiming, setSelectedTiming] = useState(METRIC_OPTIONS[0].timings[0]);
  const [status, setStatus] = useState('Optimal');
  const [notes, setNotes] = useState('');

  const handleSelectMetric = (m) => {
    setSelectedMetric(m);
    setVal(m.defaultVal);
    setSelectedTiming(m.timings[0]);
  };

  const handleSave = () => {
    if (!val.trim()) {
      Alert.alert('Required Field', 'Please enter a vital reading value.');
      return;
    }

    addVitalRecord({
      metric: selectedMetric.name,
      value: val.trim(),
      unit: selectedMetric.unit,
      timing: selectedTiming,
      status: status,
      notes: notes.trim() || undefined,
    });

    Alert.alert('✅ Vitals Logged', `${selectedMetric.name} (${val} ${selectedMetric.unit}) recorded to your personal health timeline.`);
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
          className={`max-h-[85%] rounded-t-[24px] p-4 shadow-xl border-t ${palette.surface} ${palette.border}`}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200/15 pb-3 mb-3">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-teal-500/20">
                <Ionicons name="pulse" size={18} color="#0d9488" />
              </View>
              <View>
                <Text className={`text-[15px] font-bold ${palette.text}`}>Log Daily Health Vitals</Text>
                <Text className={`text-[11px] ${palette.textMuted}`}>Record 8-parameter biometrics & trends</Text>
              </View>
            </View>
            <Pressable onPress={onClose} className="rounded-full bg-gray-500/20 p-1.5">
              <Ionicons name="close" size={16} color={palette.textMutedColor} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Metric Selector Chips */}
            <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-teal-600 mb-2">
              Select Biomarker / Metric
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-1.5">
                {METRIC_OPTIONS.map((m) => {
                  const isSel = selectedMetric.id === m.id;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => handleSelectMetric(m)}
                      className={`flex-row items-center gap-1.5 rounded-[12px] px-3 py-1.5 border ${
                        isSel
                          ? 'bg-teal-600 border-teal-600'
                          : `${palette.surfaceInset} border-gray-200/20`
                      }`}
                    >
                      <Ionicons
                        name={m.icon}
                        size={14}
                        color={isSel ? '#ffffff' : m.color}
                      />
                      <Text
                        className={`text-[11px] font-bold ${
                          isSel ? 'text-white' : palette.text
                        }`}
                      >
                        {m.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Reading Input Box */}
            <View className={`rounded-[14px] p-3 mb-3 ${palette.surfaceInset}`}>
              <Text className={`text-[11px] font-bold ${palette.textMuted} mb-1`}>
                Reading Value ({selectedMetric.unit})
              </Text>
              <View className="flex-row items-center justify-between">
                <TextInput
                  value={val}
                  onChangeText={setVal}
                  placeholder={`e.g. ${selectedMetric.defaultVal}`}
                  placeholderTextColor={palette.textMutedColor}
                  className={`flex-1 text-[20px] font-extrabold ${palette.text} py-1`}
                  keyboardType="numbers-and-punctuation"
                />
                <View className="rounded-[8px] bg-teal-500/20 px-2.5 py-1">
                  <Text className="text-[12px] font-bold text-teal-700">{selectedMetric.unit}</Text>
                </View>
              </View>
            </View>

            {/* Timing / Context Selection */}
            <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-teal-600 mb-1.5">
              Measurement Timing / Context
            </Text>
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {selectedMetric.timings.map((t) => {
                const isSel = selectedTiming === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setSelectedTiming(t)}
                    className={`rounded-[10px] px-2.5 py-1.5 ${
                      isSel ? 'bg-sky-600' : palette.surfaceInset
                    }`}
                  >
                    <Text
                      className={`text-[10.5px] font-semibold ${
                        isSel ? 'text-white font-bold' : palette.text
                      }`}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Clinical Status Tag */}
            <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-teal-600 mb-1.5">
              Clinical Assessment Status
            </Text>
            <View className="flex-row gap-1.5 mb-3">
              {[
                { label: 'Optimal', color: 'bg-emerald-600', text: 'text-white' },
                { label: 'Normal', color: 'bg-sky-600', text: 'text-white' },
                { label: 'Elevated', color: 'bg-amber-600', text: 'text-white' },
                { label: 'High Alert', color: 'bg-rose-600', text: 'text-white' },
              ].map((s) => {
                const isSel = status === s.label;
                return (
                  <Pressable
                    key={s.label}
                    onPress={() => setStatus(s.label)}
                    className={`flex-1 items-center rounded-[10px] py-1.5 ${
                      isSel ? s.color : palette.surfaceInset
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        isSel ? 'text-white' : palette.text
                      }`}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Notes / Symptoms Input */}
            <View className={`rounded-[14px] p-2.5 mb-4 ${palette.surfaceInset}`}>
              <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                Optional Patient Notes / Symptoms
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Measured before taking breakfast medication..."
                placeholderTextColor={palette.textMutedColor}
                className={`text-[11.5px] ${palette.text} min-h-[40px]`}
                multiline
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2 pb-6">
              <Pressable
                onPress={onClose}
                className={`flex-1 items-center justify-center rounded-[12px] py-2.5 ${palette.surfaceInset}`}
              >
                <Text className={`text-[12px] font-bold ${palette.text}`}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-teal-600 py-2.5 shadow-md"
              >
                <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                <Text className="text-[12px] font-bold text-white">Save Vital Record</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
