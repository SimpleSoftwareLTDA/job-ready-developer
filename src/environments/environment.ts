export const environment = {
  production: false,
  firebase: {
    apiKey: import.meta.env['NG_APP_FIREBASE_API_KEY'] as string,
    authDomain: import.meta.env['NG_APP_FIREBASE_AUTH_DOMAIN'] as string,
    projectId: import.meta.env['NG_APP_FIREBASE_PROJECT_ID'] as string,
    storageBucket: import.meta.env['NG_APP_FIREBASE_STORAGE_BUCKET'] as string,
    messagingSenderId: import.meta.env['NG_APP_FIREBASE_SENDER_ID'] as string,
    appId: import.meta.env['NG_APP_FIREBASE_APP_ID'] as string,
    measurementId: import.meta.env['NG_APP_FIREBASE_MEASUREMENT_ID'] as string
  },
  adminUid: import.meta.env['NG_APP_ADMIN_UID'] as string
};


