import * as admin from 'firebase-admin';

import firebaseConfig from '../firebaseSdk';

const serviceAccount = firebaseConfig as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const options = {
  priority: 'High',
  TimeToLive: 60 * 60 * 24,
};

export const notify = (
  registrationToken: string,
  title: string,
  body: string,
) => {
  const payload = {
    data: {
      title,
      body,
    },
  };

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
