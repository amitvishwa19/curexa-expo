import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import AppScreen from '~/components/AppScreen';
import CurexaHeader from '~/components/curexa/CurexaHeader';
import { useAppTheme } from '~/theme/AppTheme';

export default function CurexaMessagingAutomationScreen() {
  const { palette } = useAppTheme();

  const [campaigns, setCampaigns] = useState([
    {
      id: 'msg-1',
      title: 'OPD Queue Token & Timing Notification',
      trigger: 'When patient appointment is scheduled or doctor is delayed > 15m',
      channel: 'WhatsApp & SMS',
      sentToday: 42,
      active: true,
      color: '#16a34a',
    },
    {
      id: 'msg-2',
      title: 'Diagnostic Lab Report Ready Alert',
      trigger: 'Immediately upon lab technician authorizing verified PDF result',
      channel: 'WhatsApp with Secure PDF Link',
      sentToday: 19,
      active: true,
      color: '#06b6d4',
    },
    {
      id: 'msg-3',
      title: 'Post-Op Follow-up & Medication Reminder',
      trigger: 'Daily at 09:00 AM & 08:00 PM for active e-Rx prescriptions',
      channel: 'WhatsApp Interactive Reminder',
      sentToday: 88,
      active: true,
      color: '#8b5cf6',
    },
    {
      id: 'msg-4',
      title: 'Hospital Discharge Summary & Diet Plan',
      trigger: 'On Inpatient Ward Discharge authorization',
      channel: 'WhatsApp & Email Document',
      sentToday: 7,
      active: true,
      color: '#f59e0b',
    },
  ]);

  const toggleCampaign = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <AppScreen>
      <CurexaHeader
        title="WhatsApp & SMS Automation"
        subtitle="Automated Patient Journey Care Triggers & Notifications"
        rightAction={{
          icon: 'logo-whatsapp',
          onPress: () => Alert.alert('WhatsApp Gateway', 'Cloud API Gateway status: CONNECTED & ONLINE.'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1 px-3 pt-2"
      >
        {/* Top Summary Banner */}
        <View className={`mb-2.5 rounded-[16px] p-3 shadow-sm ${palette.surface}`}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-green-500/20">
                <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
              </View>
              <View>
                <Text className={`text-[13px] font-bold ${palette.text}`}>Patient Engagement Bot</Text>
                <Text className={`text-[10px] ${palette.textMuted}`}>Automated HIPAA / Clinical Compliant</Text>
              </View>
            </View>
            <View className="rounded-full bg-emerald-500/20 px-2 py-0.5">
              <Text className="text-[10px] font-bold text-emerald-700">156 SENT TODAY</Text>
            </View>
          </View>

          <Text className={`text-[11px] ${palette.textMuted}`}>
            Automated messaging keeps patients informed about their appointments, e-Rx dosing reminders, and instant lab results without manual staff effort.
          </Text>
        </View>

        {/* Campaign List */}
        <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-emerald-600">
          Active Automation Triggers
        </Text>

        <View className="gap-2">
          {campaigns.map((camp) => (
            <View
              key={camp.id}
              className={`rounded-[16px] p-3 shadow-sm ${palette.surface} border border-gray-200/10`}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-1 mr-2">
                  <Text className={`text-[12.5px] font-bold ${palette.text}`}>{camp.title}</Text>
                  <Text className={`text-[10px] font-medium text-emerald-600 mt-0.5`}>
                    Channel: {camp.channel}
                  </Text>
                </View>
                <Switch
                  value={camp.active}
                  onValueChange={() => toggleCampaign(camp.id)}
                  trackColor={{ false: '#767577', true: '#059669' }}
                />
              </View>

              <View className={`rounded-[10px] p-2 ${palette.surfaceInset} mb-2`}>
                <Text className={`text-[9.5px] uppercase font-bold text-gray-400`}>Trigger Condition</Text>
                <Text className={`text-[11px] font-medium ${palette.text} mt-0.5`}>{camp.trigger}</Text>
              </View>

              <View className="flex-row items-center justify-between pt-1 border-t border-gray-200/10">
                <Text className={`text-[10px] ${palette.textMuted}`}>Delivered today: {camp.sentToday} messages</Text>
                <Pressable
                  onPress={() => Alert.alert('Test Notification', `Dispatched sample test alert for "${camp.title}".`)}
                  className="rounded-[8px] bg-emerald-600 px-2.5 py-1"
                >
                  <Text className="text-[10px] font-bold text-white">Send Sample Test</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}
