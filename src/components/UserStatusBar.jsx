import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useCurexaDrawer } from '~/components/curexa/CurexaDrawer';
import IosPortalSwitcherModal from '~/components/curexa/IosPortalSwitcherModal';
import { useNotificationStore } from '~/contexts/NotificationStore';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';
import { getSession } from '~/utils/authStorage';

export default function UserStatusBar({ showDrawerButton = true, rightAction }) {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { portalMode, currentPatientProfile, hospitalInfo, loggedInUser } = useCurexa();
  const { unreadCount } = useNotificationStore();
  const [user, setUser] = useState(null);
  const [showSwitcherModal, setShowSwitcherModal] = useState(false);

  let openDrawer = () => { };
  try {
    const drawerCtx = useCurexaDrawer();
    if (drawerCtx?.openDrawer) {
      openDrawer = drawerCtx.openDrawer;
    }
  } catch { }

  const isPatient = portalMode === 'PATIENT';

  useEffect(() => {
    getSession().then((s) => setUser(s?.user ?? null));
  }, []);

  const activeUser = loggedInUser || user;
  const avatarUri = activeUser?.avatar || activeUser?.photo || currentPatientProfile?.avatar;

  const userDisplayName =
    activeUser?.displayName ||
    activeUser?.name ||
    (activeUser?.email ? activeUser.email.split('@')[0] : null);

  const patientDisplayName =
    userDisplayName ||
    (currentPatientProfile?.displayName !== 'Patient' ? currentPatientProfile?.displayName : null) ||
    'Patient';

  const hospitalDisplayName = activeUser?.displayName
    ? (activeUser.displayName.startsWith('Dr.') ? activeUser.displayName : `Dr. ${activeUser.displayName}`)
    : (activeUser?.name ? (activeUser.name.startsWith('Dr.') ? activeUser.name : `Dr. ${activeUser.name}`) : 'Dr. Rajesh Sharma');

  const displayName = isPatient ? patientDisplayName : hospitalDisplayName;
  const initial = displayName?.[0]?.toUpperCase() || (isPatient ? 'P' : 'D');

  const emailDisplay = activeUser?.email || currentPatientProfile?.email || '';
  const subtitle = isPatient
    ? `UHID: ${currentPatientProfile?.uhid || 'CUX-889102'}${emailDisplay ? ` • ${emailDisplay}` : ''}`
    : `${hospitalInfo?.name || 'Curexa Super Specialty'} • On Duty`;

  return (
    <>
      <View className={`flex-row items-center justify-between px-3 py-2 border-b ${palette.surface} ${palette.border}`}>
        {/* Left: Drawer Toggle (optional) & User Profile */}
        <View className="flex-1 flex-row items-center gap-2 mr-2">
          {showDrawerButton && (
            <Pressable
              onPress={openDrawer}
              className={`h-8 w-8 items-center justify-center rounded-[12px] ${palette.surfaceAlt}`}
            >
              <Ionicons name="menu-outline" size={18} color={palette.textColor} />
            </Pressable>
          )}

          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            className="flex-1 flex-row items-center gap-2"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="h-8 w-8 rounded-[12px]" />
            ) : (
              <View
                className={`h-8 w-8 items-center justify-center rounded-[12px] shadow-sm ${isPatient ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}
              >
                <Text className="text-[12px] font-bold text-white">{initial}</Text>
              </View>
            )}

            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className={`text-[13px] font-bold ${palette.text}`} numberOfLines={1}>
                  {displayName}
                </Text>
                <View
                  className={`rounded-full px-1.5 py-0.5 ${isPatient ? 'bg-sky-500/20' : 'bg-emerald-500/20'
                    }`}
                >
                  <Text
                    className={`text-[8px] font-extrabold ${isPatient ? 'text-sky-600' : 'text-emerald-600'
                      }`}
                  >
                    {isPatient ? 'PATIENT' : 'DOCTOR'}
                  </Text>
                </View>
              </View>
              <Text className={`text-[10px] ${palette.textMuted}`} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Right: Actions, Portal Switcher Pill & Notification Bell */}
        <View className="flex-row items-center gap-1.5">
          {rightAction}

          {/* iOS Portal Switcher Pill Button */}


          {/* Notifications Center Bell */}
          <Pressable
            onPress={() => router.push('/(misc)/notifications')}
            className={`relative h-8 w-8 items-center justify-center rounded-[12px] ${palette.surfaceAlt}`}
          >
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={16}
              color={unreadCount > 0 ? (isPatient ? '#0284c7' : '#059669') : palette.textMutedColor}
            />
            {unreadCount > 0 && (
              <View
                className={`absolute -right-0.5 -top-0.5 h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 ${isPatient ? 'bg-sky-600' : 'bg-emerald-600'
                  }`}
              >
                <Text className="text-[7.5px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* iOS Portal Switcher Sheet Modal */}
      <IosPortalSwitcherModal
        visible={showSwitcherModal}
        onClose={() => setShowSwitcherModal(false)}
      />
    </>
  );
}