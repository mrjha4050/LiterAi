const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const auth = admin.auth();

const verifyToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = { verifyToken };