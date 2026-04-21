import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getRandomVerse } from './bibleLoader';

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

export async function setupBackgroundNotifications() {
  if (Platform.OS === 'web') return;
  
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return; // Don't prompt here, just check

  // Check if we already scheduled them
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.length > 5) return; // We have plenty scheduled

  // Schedule next 7 days (to not overwhelm the system)
  for (let i = 1; i <= 7; i++) {
    const randomVerseData = await getRandomVerse();
    if (!randomVerseData) continue;

    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(8, 0, 0, 0);

    const trigger: any = {
      type: 'date',
      date: date.getTime(),
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Manna',
          body: randomVerseData.textAm,
        },
        trigger,
      });
    } catch (e) {
      console.log('Could not schedule notification', e);
    }
  }
}
