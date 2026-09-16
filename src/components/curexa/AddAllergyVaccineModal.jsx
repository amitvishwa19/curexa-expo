import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';

export default function AddAllergyVaccineModal({ visible, onClose, initialMode = 'ALLERGY' }) {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { addAllergy, addVaccine } = useCurexa();

  const [mode, setMode] = useState(initialMode); // 'ALLERGY' | 'VACCINE'

  // Allergy form state
  const [allergyTitle, setAllergyTitle] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [allergyNotes, setAllergyNotes] = useState('');

  // Vaccine form state
  const [vaccineName, setVaccineName] = useState('');
  const [doseNumber, setDoseNumber] = useState('Dose 1');
  const [facility, setFacility] = useState('Curexa Preventive OPD');
  const [vaccineDate, setVaccineDate] = useState('Today');

  const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'Latex', 'Peanuts', 'Aspirin/NSAIDs', 'Shellfish', 'Pollen/Dust'];
  const commonVaccines = ['COVID-19 Booster', 'Influenza (Flu Shot)', 'Tetanus Toxoid (Tdap)', 'Hepatitis B', 'HPV Vaccine', 'MMR'];

  const handleSave = () => {
    if (mode === 'ALLERGY') {
      if (!allergyTitle.trim()) {
        Alert.alert('Required Field', 'Please enter or select an allergy name.');
        return;
      }
      addAllergy({
        title: allergyTitle.trim(),
        severity: severity,
        notes: allergyNotes.trim() || undefined,
      });
      Alert.alert('✅ Allergy Added', `${allergyTitle} added to your verified allergy list.`);
      setAllergyTitle('');
      setAllergyNotes('');
    } else {
      if (!vaccineName.trim()) {
        Alert.alert('Required Field', 'Please enter or select a vaccine name.');
        return;
      }
      addVaccine({
        name: vaccineName.trim(),
        dose: doseNumber,
        facility: facility.trim() || 'Curexa OPD',
        date: vaccineDate.trim() || 'Today',
      });
      Alert.alert('✅ Immunization Added', `${vaccineName} (${doseNumber}) recorded in your vaccination history.`);
      setVaccineName('');
    }
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
              <View
                className={`h-8 w-8 items-center justify-center rounded-[10px] ${
                  mode === 'ALLERGY' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                }`}
              >
                <Ionicons
                  name={mode === 'ALLERGY' ? 'warning-outline' : 'shield-checkmark-outline'}
                  size={18}
                  color={mode === 'ALLERGY' ? '#d97706' : '#059669'}
                />
              </View>
              <View>
                <Text className={`text-[15px] font-bold ${palette.text}`}>
                  {mode === 'ALLERGY' ? 'Add Known Allergy' : 'Record Vaccination'}
                </Text>
                <Text className={`text-[11px] ${palette.textMuted}`}>Personal Medical Vault Record</Text>
              </View>
            </View>
            <Pressable onPress={onClose} className="rounded-full bg-gray-500/20 p-1.5">
              <Ionicons name="close" size={16} color={palette.textMutedColor} />
            </Pressable>
          </View>

          {/* Mode Switcher */}
          <View className={`mb-3 flex-row rounded-[12px] p-1 ${palette.surfaceInset}`}>
            <Pressable
              onPress={() => setMode('ALLERGY')}
              className={`flex-1 items-center rounded-[9px] py-1.5 ${
                mode === 'ALLERGY' ? 'bg-amber-600 shadow-sm' : 'transparent'
              }`}
            >
              <Text className={`text-[11px] font-bold ${mode === 'ALLERGY' ? 'text-white' : palette.text}`}>
                ⚠️ Medical Allergy
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('VACCINE')}
              className={`flex-1 items-center rounded-[9px] py-1.5 ${
                mode === 'VACCINE' ? 'bg-emerald-600 shadow-sm' : 'transparent'
              }`}
            >
              <Text className={`text-[11px] font-bold ${mode === 'VACCINE' ? 'text-white' : palette.text}`}>
                💉 Immunization Record
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {mode === 'ALLERGY' ? (
              <>
                {/* Quick Selection Tags */}
                <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-amber-600 mb-1.5">
                  Common Allergens
                </Text>
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {commonAllergies.map((al) => (
                    <Pressable
                      key={al}
                      onPress={() => setAllergyTitle(al)}
                      className={`rounded-[10px] px-2.5 py-1 ${
                        allergyTitle === al ? 'bg-amber-600' : palette.surfaceInset
                      }`}
                    >
                      <Text
                        className={`text-[10.5px] font-semibold ${
                          allergyTitle === al ? 'text-white font-bold' : palette.text
                        }`}
                      >
                        {al}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Custom Allergy Name Input */}
                <View className={`rounded-[14px] p-2.5 mb-3 ${palette.surfaceInset}`}>
                  <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                    Allergen / Substance Name
                  </Text>
                  <TextInput
                    value={allergyTitle}
                    onChangeText={setAllergyTitle}
                    placeholder="e.g. Amoxicillin, Peanuts, Pollen..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`text-[13px] font-bold ${palette.text} py-1`}
                  />
                </View>

                {/* Severity Selection */}
                <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-amber-600 mb-1.5">
                  Reaction Severity
                </Text>
                <View className="flex-row gap-1.5 mb-3">
                  {[
                    { label: 'Mild (Rash/Itch)', color: 'bg-sky-600' },
                    { label: 'Moderate', color: 'bg-amber-600' },
                    { label: 'Severe (Anaphylaxis)', color: 'bg-rose-600' },
                  ].map((s) => {
                    const isSel = severity === s.label;
                    return (
                      <Pressable
                        key={s.label}
                        onPress={() => setSeverity(s.label)}
                        className={`flex-1 items-center rounded-[10px] py-1.5 ${
                          isSel ? s.color : palette.surfaceInset
                        }`}
                      >
                        <Text
                          className={`text-[9.5px] font-bold ${
                            isSel ? 'text-white' : palette.text
                          }`}
                        >
                          {s.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Notes */}
                <View className={`rounded-[14px] p-2.5 mb-4 ${palette.surfaceInset}`}>
                  <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                    Clinical Symptoms & Notes
                  </Text>
                  <TextInput
                    value={allergyNotes}
                    onChangeText={setAllergyNotes}
                    placeholder="e.g. Causes facial hives and difficulty breathing..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`text-[11.5px] ${palette.text} min-h-[40px]`}
                    multiline
                  />
                </View>
              </>
            ) : (
              <>
                {/* Vaccine Quick Selection */}
                <Text className="text-[11px] font-bold uppercase tracking-[0.8px] text-emerald-600 mb-1.5">
                  Common Vaccines
                </Text>
                <View className="flex-row flex-wrap gap-1.5 mb-3">
                  {commonVaccines.map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => setVaccineName(v)}
                      className={`rounded-[10px] px-2.5 py-1 ${
                        vaccineName === v ? 'bg-emerald-600' : palette.surfaceInset
                      }`}
                    >
                      <Text
                        className={`text-[10.5px] font-semibold ${
                          vaccineName === v ? 'text-white font-bold' : palette.text
                        }`}
                      >
                        {v}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Custom Vaccine Name */}
                <View className={`rounded-[14px] p-2.5 mb-3 ${palette.surfaceInset}`}>
                  <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                    Vaccine / Immunization Name
                  </Text>
                  <TextInput
                    value={vaccineName}
                    onChangeText={setVaccineName}
                    placeholder="e.g. Hepatitis B Recombinant..."
                    placeholderTextColor={palette.textMutedColor}
                    className={`text-[13px] font-bold ${palette.text} py-1`}
                  />
                </View>

                {/* Dose & Administration Date */}
                <View className="flex-row gap-2 mb-3">
                  <View className={`flex-1 rounded-[14px] p-2.5 ${palette.surfaceInset}`}>
                    <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                      Dose Number
                    </Text>
                    <TextInput
                      value={doseNumber}
                      onChangeText={setDoseNumber}
                      placeholder="e.g. Dose 2, Booster"
                      placeholderTextColor={palette.textMutedColor}
                      className={`text-[12px] font-bold ${palette.text}`}
                    />
                  </View>
                  <View className={`flex-1 rounded-[14px] p-2.5 ${palette.surfaceInset}`}>
                    <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                      Administered Date
                    </Text>
                    <TextInput
                      value={vaccineDate}
                      onChangeText={setVaccineDate}
                      placeholder="e.g. Sep 14, 2026"
                      placeholderTextColor={palette.textMutedColor}
                      className={`text-[12px] font-bold ${palette.text}`}
                    />
                  </View>
                </View>

                {/* Facility */}
                <View className={`rounded-[14px] p-2.5 mb-4 ${palette.surfaceInset}`}>
                  <Text className={`text-[10.5px] font-bold ${palette.textMuted} mb-1`}>
                    Administered At / Clinic
                  </Text>
                  <TextInput
                    value={facility}
                    onChangeText={setFacility}
                    placeholder="e.g. Curexa Hospital Immunization Wing"
                    placeholderTextColor={palette.textMutedColor}
                    className={`text-[12px] font-bold ${palette.text}`}
                  />
                </View>
              </>
            )}

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
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-[12px] py-2.5 shadow-md ${
                  mode === 'ALLERGY' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}
              >
                <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                <Text className="text-[12px] font-bold text-white">
                  {mode === 'ALLERGY' ? 'Save Allergy' : 'Save Immunization'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
