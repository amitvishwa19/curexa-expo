import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppScreen from '~/components/AppScreen';
import { useAppTheme } from '~/theme/AppTheme';
import CurexaHeader from '~/components/curexa/CurexaHeader';

export default function CurexaCrmScreen() {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [leads, setLeads] = useState([
    {
      id: 'lead-1',
      name: 'Priya Sundaram',
      phone: '+91 98112 34567',
      treatment: 'Full Cardiac Health Package',
      source: 'Direct Website Inquiry',
      value: '₹24,000',
      stage: 'NEW_LEAD',
      date: '2026-09-15',
    },
    {
      id: 'lead-2',
      name: 'Vikram Patel',
      phone: '+91 98220 89123',
      treatment: 'Knee Replacement Surgery Consult',
      source: 'Doctor Referral',
      value: '₹85,000',
      stage: 'CONSULTED',
      date: '2026-09-14',
    },
    {
      id: 'lead-3',
      name: 'Neha Agarwal',
      phone: '+91 99341 55678',
      treatment: 'Comprehensive MRI & Spine Check',
      source: 'Health Camp',
      value: '₹18,000',
      stage: 'FOLLOW_UP',
      date: '2026-09-13',
    },
    {
      id: 'lead-4',
      name: 'Rohan Malhotra',
      phone: '+91 97412 66789',
      treatment: 'Bariatric Consultation & Diet Plan',
      source: 'Website',
      value: '₹42,000',
      stage: 'CONVERTED',
      date: '2026-09-11',
    },
  ]);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [treatment, setTreatment] = useState('');
  const [value, setValue] = useState('₹15,000');

  const stages = ['ALL', 'NEW_LEAD', 'CONSULTED', 'FOLLOW_UP', 'CONVERTED'];

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => selectedStage === 'ALL' || l.stage === selectedStage);
  }, [leads, selectedStage]);

  const handleAddLead = () => {
    if (!name || !phone) return;
    const newL = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      treatment: treatment || 'Executive Health Package',
      source: 'Mobile App Lead',
      value: value || '₹15,000',
      stage: 'NEW_LEAD',
      date: new Date().toISOString().split('T')[0],
    };
    setLeads((prev) => [newL, ...prev]);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setTreatment('');
  };

  const advanceStage = (id) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const next =
            l.stage === 'NEW_LEAD'
              ? 'CONSULTED'
              : l.stage === 'CONSULTED'
              ? 'FOLLOW_UP'
              : 'CONVERTED';
          return { ...l, stage: next };
        }
        return l;
      })
    );
  };

  return (
    <AppScreen>
      <CurexaHeader
        title="Patient Care CRM"
        subtitle={`${filteredLeads.length} Inquiries & Leads`}
        showBack
        rightAction={
          <Pressable
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center gap-1 rounded-[12px] bg-pink-600 px-2.5 py-1.5"
          >
            <Ionicons name="add" size={15} color="#ffffff" />
            <Text className="text-[11px] font-bold text-white">New Lead</Text>
          </Pressable>
        }
      />

      <View className="flex-1 px-3 pt-2">
        {/* Stage Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 max-h-8">
          <View className="flex-row gap-1.5">
            {stages.map((st) => (
              <Pressable
                key={st}
                onPress={() => setSelectedStage(st)}
                className={`rounded-[10px] px-2.5 py-1 ${
                  selectedStage === st ? 'bg-pink-600' : palette.surface
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold ${
                    selectedStage === st ? 'text-white font-bold' : palette.text
                  }`}
                >
                  {st.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Leads List */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-24">
          <View className="gap-2">
            {filteredLeads.map((lead) => (
              <View
                key={lead.id}
                className={`rounded-[16px] p-3 shadow-sm ${palette.surface}`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <View className="h-9 w-9 items-center justify-center rounded-[12px] bg-pink-500/15">
                      <Ionicons name="sparkles" size={17} color="#ec4899" />
                    </View>
                    <View>
                      <Text className={`text-[14px] font-bold ${palette.text}`}>{lead.name}</Text>
                      <Text className={`text-[10px] ${palette.textMuted}`}>
                        {lead.phone} • {lead.source}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-[13px] font-bold text-emerald-600">{lead.value}</Text>
                    <View
                      className={`mt-0.5 rounded-full px-2 py-0.5 ${
                        lead.stage === 'CONVERTED'
                          ? 'bg-emerald-500/20'
                          : lead.stage === 'CONSULTED'
                          ? 'bg-sky-500/20'
                          : 'bg-pink-500/20'
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-bold ${
                          lead.stage === 'CONVERTED'
                            ? 'text-emerald-700'
                            : lead.stage === 'CONSULTED'
                            ? 'text-sky-700'
                            : 'text-pink-700'
                        }`}
                      >
                        {lead.stage.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Treatment Box */}
                <View className={`mt-2 rounded-[10px] p-2 flex-row items-center justify-between ${palette.surfaceInset}`}>
                  <Text className={`text-[10px] font-medium ${palette.text}`} numberOfLines={1}>
                    Package: {lead.treatment}
                  </Text>
                  {lead.stage !== 'CONVERTED' && (
                    <Pressable
                      onPress={() => advanceStage(lead.id)}
                      className="rounded-[8px] bg-pink-600 px-2 py-0.5"
                    >
                      <Text className="text-[9px] font-bold text-white">Advance</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Add Lead Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <Pressable className="absolute inset-0" onPress={() => setShowAddModal(false)} />
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
            className={`max-h-[85%] rounded-t-[24px] p-3.5 ${palette.surface}`}
          >
            <View className="mb-2.5 flex-row items-center justify-between border-b border-gray-200/15 pb-2">
              <Text className={`text-[15px] font-bold ${palette.text}`}>Record Patient Inquiry</Text>
              <Pressable onPress={() => setShowAddModal(false)} className={`rounded-full p-1 ${palette.surfaceAlt}`}>
                <Ionicons name="close" size={18} color={palette.textMutedColor} />
              </Pressable>
            </View>

            <View className="gap-2 mb-3">
              <View>
                <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Prospect Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Rohan Malhotra"
                  placeholderTextColor={palette.textMutedColor}
                  className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                />
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Phone Number *</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
                <View className="w-28">
                  <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Est. Value</Text>
                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    placeholder="₹20,000"
                    placeholderTextColor={palette.textMutedColor}
                    className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                  />
                </View>
              </View>

              <View>
                <Text className={`text-[10px] font-semibold mb-1 ${palette.textMuted}`}>Inquiry / Treatment Interest</Text>
                <TextInput
                  value={treatment}
                  onChangeText={setTreatment}
                  placeholder="e.g. Total Knee Replacement"
                  placeholderTextColor={palette.textMutedColor}
                  className={`rounded-[12px] p-2.5 text-[12px] border ${palette.surfaceInset} ${palette.border} ${palette.text}`}
                />
              </View>
            </View>

            <View className="flex-row gap-2 pt-2 border-t border-gray-200/15">
              <Pressable onPress={() => setShowAddModal(false)} className="flex-1 rounded-[12px] bg-gray-500/15 py-2.5 items-center">
                <Text className={`text-[12px] font-bold ${palette.text}`}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddLead} className="flex-1 rounded-[12px] bg-pink-600 py-2.5 items-center">
                <Text className="text-[12px] font-bold text-white">Save Inquiry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}
