const admin = require("firebase-admin")

const serviceAccount = require("./franks-furniture-firebase-adminsdk-phb64-e6e148f840.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://franks-furniture.firebaseio.com",
})

const db = admin.firestore()

module.exports = { admin, db }
