import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function requestNotificationPermission(userId: string) {
  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY // You'll need to generate this in Firebase Console -> Project Settings -> Cloud Messaging
      });

      if (token) {
        // Save token to user profile
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: token
        });
        console.log('FCM Token successfully stored.');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return false;
  }
}

export function onMessageListener() {
  const messaging = getMessaging();
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
