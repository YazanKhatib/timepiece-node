import * as admin from 'firebase-admin';

import firebaseConfig from '../firebaseSdk';

const serviceAccount = firebaseConfig as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken = '';

const payload = {
  data: {
    myKey: '',
  },
};

const options = {
  priority: 'High',
  TimeToLive: 60 * 60 * 24,
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
