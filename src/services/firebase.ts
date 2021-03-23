import * as admin from 'firebase-admin';
import firebaseConfig from '../firebaseSdk';

const serviceAccount = firebaseConfig as admin.ServiceAccount;

const options = {
  priority: 'High',
  TimeToLive: 60 * 60 * 24,
};
interface Notification {
  data: {
    title: string;
    body: string;
  };
}

export const initializeFirebase = async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

export const notify = (registrationToken: string, payload: Notification) => {
  admin
    .messaging()
    .sendToDevice(registrationToken, payload, options)
    .then((response) => {
      console.log('Successfully send message', response);
    })
    .catch((error) => {
      console.log('Error sending messages', error);
    });
};
