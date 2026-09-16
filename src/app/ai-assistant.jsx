import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaAiAssistantScreen() {
  const { palette } = useAppTheme();
  const { portalMode, addAppointmentLocally, addPatientLocally } = useCurexa();

  const isPatient = portalMode === 'PATIENT';

  const [inputSymptom, setInputSymptom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('TRIAGE'); // 'TRIAGE' | 'INTERACTION' | 'SUMMARIZE'

  const handleRunTriage = () => {
    if (!inputSymptom.trim()) {
      Alert.alert('Please describe symptoms', 'Enter patient symptoms or complaints to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        urgency: inputSymptom.toLowerCase().includes('chest') || inputSymptom.toLowerCase().includes('breath') ? 'EMERGENCY / HIGH' : 'MODERATE / OPD',
        urgencyColor: inputSymptom.toLowerCase().includes('chest') || inputSymptom.toLowerCase().includes('breath') ? '#ef4444' : '#f59e0b',
        primaryDifferential: 'Acute Coronary Syndrome vs. Gastroesophageal Reflux',
        confidence: '92%',
        differentials: [
          { name: 'Angina Pectoris / Ischemic Heart Disease', likelihood: 'High (84%)', recommendedDept: 'Cardiology' },
          { name: 'Gastroesophageal Reflux Disease (GERD)', likelihood: 'Moderate (48%)', recommendedDept: 'Gastroenterology' },
          { name: 'Costochondritis / Musculoskeletal Strain', likelihood: 'Low (22%)', recommendedDept: 'Orthopedics / General' },
        ],
        recommendedActions: [
          'Immediate 12-lead Electrocardiogram (ECG)',
          'Serum Troponin-I & CK-MB cardiac enzyme panel',
          'Vitals telemetry: SpO2, BP & Continuous HR monitor',
          'Administer Sublingual Nitroglycerin if SBP > 100 mmHg',
        ],
        suggestedRx: [
          { medicine: 'Aspirin 325mg (Chewable)', dosage: 'Stat dose', note: 'Immediate antiplatelet' },
          { medicine: 'Atorvastatin 40mg', dosage: '1 Tab Nightly', note: 'Plaque stabilization' },
          { medicine: 'Pantoprazole 40mg', dosage: '1 Tab Before Food', note: 'Gastric protection' },
        ],
      });
    }, 1200);
  };

  const handleQuickPrompt = (symptom) => {
    setInputSymptom(symptom);
  };

  return (
    <AppScreen>
      <CurexaHeader
        title={isPatient ? 'AI Health Triage' : 'AI Clinical Copilot'}
        subtitle={isPatient ? 'Intelligent Symptom Checker & Care Advisor' : 'Differential Diagnosis & e-Rx Generation'}
        rightAction={{
          icon: 'sparkles',
          onPress: () => Alert.alert('Curexa Clinical AI', 'Powered by medical diagnostic heuristics and clinical guidelines.'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* Mode Switcher */}
        <View className={`mb-2.5 flex-row rounded-[12px] p-1 ${palette.surfaceInset}`}>
          {[
            { id: 'TRIAGE', label: 'Clinical Triage', icon: 'git-network-outline' },
            { id: 'INTERACTION', label: 'Drug Interactions', icon: 'shield-checkmark-outline' },
            { id: 'SUMMARIZE', label: 'EMR Summary', icon: 'document-text-outline' },
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

        {/* Input Card */}
        <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <View className="h-6 w-6 items-center justify-center rounded-[6px] bg-emerald-500/15">
                <Ionicons name="sparkles" size={13} color="#059669" />
              </View>
              <Text className={`text-[12px] font-bold ${palette.text}`}>
                {activeTab === 'TRIAGE'
                  ? 'Clinical Symptoms & Vitals Presentation'
                  : activeTab === 'INTERACTION'
                  ? 'Drug Interaction Cross-Check'
                  : 'Patient EMR Discharge / Case Notes'}
              </Text>
            </View>
            <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
              <Text className="text-[9px] font-bold text-emerald-700">AI ACTIVE</Text>
            </View>
          </View>

          <TextInput
            value={inputSymptom}
            onChangeText={setInputSymptom}
            multiline
            numberOfLines={3}
            placeholder={
              activeTab === 'TRIAGE'
                ? 'e.g. 54-year old male presents with retrosternal chest tightness radiating to left arm, diaphoresis, BP 145/95, SpO2 96%...'
                : activeTab === 'INTERACTION'
                ? 'e.g. Prescribing Clopidogrel with Omeprazole and Warfarin...'
                : 'e.g. Summarize 5-day post CABG patient history, drain outputs, and antiplatelet regimen...'
            }
            placeholderTextColor={palette.textMutedColor}
            className={`min-h-[80px] rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
          />

          {/* Quick Prompts */}
          <View className="mt-2">
            <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Quick Case Templates:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5">
              {[
                'Acute chest pain radiating to jaw with diaphoresis',
                'High fever 102F, persistent dry cough, SpO2 94%',
                'Acute right lower quadrant abdominal pain with rebound tenderness',
                'Severe throbbing unilateral headache with photophobia',
              ].map((q, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleQuickPrompt(q)}
                  className={`rounded-[8px] px-2.5 py-1 ${palette.surfaceInset} border border-gray-200/20`}
                >
                  <Text className={`text-[10px] ${palette.text}`} numberOfLines={1}>
                    {q}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Run Button */}
          <Pressable
            onPress={handleRunTriage}
            disabled={isAnalyzing}
            className="mt-3 flex-row items-center justify-center gap-1.5 rounded-[12px] bg-emerald-600 py-2.5 shadow-sm"
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={15} color="#ffffff" />
                <Text className="text-[12px] font-bold text-white">Generate AI Clinical Differential</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* AI Results Section */}
        {analysisResult && (
          <View className="gap-2.5">
            {/* Triage Urgency Header */}
            <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface} border border-emerald-500/30`}>
              <View className="flex-row items-center justify-between border-b border-gray-200/10 pb-2 mb-2">
                <View className="flex-row items-center gap-2">
                  <View
                    style={{ backgroundColor: `${analysisResult.urgencyColor}20` }}
                    className="h-8 w-8 items-center justify-center rounded-[10px]"
                  >
                    <Ionicons name="alert-circle" size={18} color={analysisResult.urgencyColor} />
                  </View>
                  <View>
                    <Text className={`text-[13px] font-bold ${palette.text}`}>Triage Level: {analysisResult.urgency}</Text>
                    <Text className={`text-[10px] ${palette.textMuted}`}>Confidence: {analysisResult.confidence}</Text>
                  </View>
                </View>
                <View
                  style={{ backgroundColor: analysisResult.urgencyColor }}
                  className="rounded-full px-2 py-0.5"
                >
                  <Text className="text-[9px] font-bold text-white">ACUTE PROTOCOL</Text>
                </View>
              </View>

              {/* Differentials */}
              <Text className="text-[11px] font-bold text-emerald-600 uppercase mb-1.5">
                Top Differential Diagnoses
              </Text>
              <View className="gap-1.5">
                {analysisResult.differentials.map((diff, i) => (
                  <View key={i} className={`rounded-[10px] p-2 ${palette.surfaceInset} flex-row items-center justify-between`}>
                    <View className="flex-1 mr-2">
                      <Text className={`text-[11.5px] font-semibold ${palette.text}`}>{diff.name}</Text>
                      <Text className={`text-[9.5px] ${palette.textMuted}`}>Dept: {diff.recommendedDept}</Text>
                    </View>
                    <View className="rounded-[6px] bg-emerald-500/15 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-emerald-700">{diff.likelihood}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Recommended Protocol Actions */}
            <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
              <View className="flex-row items-center gap-1.5 mb-2">
                <Ionicons name="checkbox-outline" size={15} color="#0284c7" />
                <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-sky-600">
                  Evidence-Based Clinical Protocol
                </Text>
              </View>
              <View className="gap-1.5">
                {analysisResult.recommendedActions.map((action, i) => (
                  <View key={i} className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text className={`flex-1 text-[11.5px] ${palette.text}`}>{action}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Suggested e-Rx Plan */}
            <View className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="medkit-outline" size={15} color="#8b5cf6" />
                  <Text className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-600">
                    Suggested e-Rx Formulary
                  </Text>
                </View>
                <Pressable
                  onPress={() => Alert.alert('Prescription Prepared', 'Pre-filled into e-Prescription generator.')}
                  className="rounded-[8px] bg-purple-600 px-2 py-0.5"
                >
                  <Text className="text-[10px] font-bold text-white">Import to Rx</Text>
                </Pressable>
              </View>

              <View className="gap-1.5">
                {analysisResult.suggestedRx.map((rx, i) => (
                  <View key={i} className={`rounded-[10px] p-2 ${palette.surfaceInset}`}>
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-[11.5px] font-bold ${palette.text}`}>{rx.medicine}</Text>
                      <Text className="text-[10px] font-bold text-emerald-600">{rx.dosage}</Text>
                    </View>
                    <Text className={`text-[9.5px] ${palette.textMuted} mt-0.5`}>{rx.note}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}
