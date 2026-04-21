import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleDailyVerse(verse = 'በመጀመሪያ መጉሥጠር በዓለም።') {
  if (Platform.OS === 'web') {
    alert(`Daily Verse Scheduled: ${verse}`);
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Please enable notifications in settings to receive daily verses.');
    return;
  }

  const trigger: any = {
    type: 'daily',
    hour: 8,
    minute: 0,
  };
  try {
    await Notifications.scheduleNotificationAsync({
       content: {
         title: 'Daily Bible Verse',
         body: verse,
       },
       trigger,
     });
     alert('Daily Verse reminder set for 8:00 AM!');
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    alert('Failed to set reminder. Please try again.');
  }
}


