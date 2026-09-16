import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurexa } from '~/providers/CurexaProvider';
import { useAppTheme } from '~/theme/AppTheme';
import { useCurexaDrawer } from './CurexaDrawer';
import IosPortalSwitcherModal from './IosPortalSwitcherModal';

export default function CurexaHeader({
  title,
  subtitle,
  rightAction,
  showBack = false,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { portalMode } = useCurexa();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const isHospital = portalMode === 'HOSPITAL';

  const defaultTitle = title || (isHospital ? 'Curexa HMS' : 'Curexa Patient Portal');
  const defaultSubtitle =
    subtitle || (isHospital ? 'Hospital Command Center' : 'Patient Care & Medical Records');

  let openDrawer = () => {};
  try {
    const drawerCtx = useCurexaDrawer();
    if (drawerCtx?.openDrawer) {
      openDrawer = drawerCtx.openDrawer;
    }
  } catch {}

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const renderRightAction = () => {
    if (React.isValidElement(rightAction)) {
      return rightAction;
    }

    if (rightAction && typeof rightAction === 'object' && typeof rightAction.onPress === 'function') {
      return (
        <Pressable
          onPress={rightAction.onPress}
          className="flex-row items-center gap-1 rounded-[12px] bg-emerald-500/15 px-2.5 py-1.5"
        >
          {rightAction.icon && (
            <Ionicons
              name={rightAction.icon}
              size={15}
              color={rightAction.color || '#059669'}
            />
          )}
          {rightAction.label && (
            <Text className="text-[11px] font-bold text-emerald-600">
              {rightAction.label}
            </Text>
          )}
        </Pressable>
      );
    }

    return (
      <View className="flex-row items-center gap-1.5">
        {/* Switcher Pill Shortcut */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowSwitcher(true)}
          className={`flex-row items-center gap-1 rounded-[10px] px-2 py-1 ${
            isHospital ? 'bg-emerald-500/15' : 'bg-sky-500/15'
          }`}
        >
          <Ionicons
            name={isHospital ? 'business-outline' : 'person-outline'}
            size={13}
            color={isHospital ? '#059669' : '#0284c7'}
          />
          <Text
            className={`text-[10px] font-bold ${
              isHospital ? 'text-emerald-700' : 'text-sky-700'
            }`}
          >
            {isHospital ? 'HMS' : 'PATIENT'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={11}
            color={isHospital ? '#059669' : '#0284c7'}
          />
        </TouchableOpacity>

        {/* Hub Button */}
        <Pressable
          onPress={openDrawer}
          className="flex-row items-center gap-1 rounded-[12px] bg-emerald-500/15 px-2.5 py-1.5"
        >
          <Ionicons name="grid-outline" size={15} color="#059669" />
          <Text className="text-[11px] font-bold text-emerald-600">Hub</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <View
        className={`border-b ${palette.surface} ${palette.border}`}
        style={{ paddingTop: Math.max(insets.top, 10), paddingBottom: 8, paddingHorizontal: 12 }}
      >
        <View className="flex-row items-center justify-between">
          {/* Left: Drawer Toggle or Back */}
          <View className="flex-row items-center gap-2.5 flex-1 mr-2">
            <Pressable
              onPress={showBack ? handleBack : openDrawer}
              className={`h-9 w-9 items-center justify-center rounded-[14px] ${palette.surfaceAlt}`}
            >
              <Ionicons
                name={showBack ? 'arrow-back-outline' : 'menu-outline'}
                size={20}
                color={palette.textColor}
              />
            </Pressable>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowSwitcher(true)}
              className="flex-1"
            >
              <View className="flex-row items-center gap-1.5">
                <Text className={`text-[14.5px] font-bold ${palette.text}`} numberOfLines={1}>
                  {defaultTitle}
                </Text>
                <View
                  className={`rounded-full px-1.5 py-0.5 ${
                    isHospital ? 'bg-emerald-500/20' : 'bg-sky-500/20'
                  }`}
                >
                  <Text
                    className={`text-[8.5px] font-bold ${
                      isHospital ? 'text-emerald-600' : 'text-sky-600'
                    }`}
                  >
                    {isHospital ? 'HMS' : 'PATIENT'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color={palette.textMutedColor}
                />
              </View>
              <Text className={`text-[10.5px] ${palette.textMuted}`} numberOfLines={1}>
                {defaultSubtitle}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right Action */}
          {renderRightAction()}
        </View>
      </View>

      {/* iOS Portal Switcher Modal */}
      <IosPortalSwitcherModal
        visible={showSwitcher}
        onClose={() => setShowSwitcher(false)}
      />
    </>
  );
}
