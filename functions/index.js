const functions = require("firebase-functions")
const express = require("express")
const app = express()
const { resolve } = require("path")
const algoliasearch = require("algoliasearch")

const { createPaymentIntent } = require("./handlers/stripe")

app.use(express.static("."))
app.use(express.json())

const cors = require("cors")
app.use(cors())

// Stripe
app.post("/create-payment-intent", createPaymentIntent)

exports.api = functions.https.onRequest(app)

const client = algoliasearch(
  functions.config().algolia.appid,
  functions.config().algolia.apikey
)
const itemsIndex = client.initIndex(`items`)

exports.algoliaItemsSync = functions.firestore
  .document(`items/{doc}`)
  .onWrite(async (change, _context) => {
    const oldData = change.before
    const newData = change.after
    const data = newData.data()
    const objectID = newData.id // <-- prop name is important

    if (!oldData.exists && newData.exists) {
      // creating
      return itemsIndex.addObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data
        )
      )
    } else if (!newData.exists && oldData.exists) {
      // deleting
      return itemsIndex.deleteObject(objectID)
    } else {
      // updating
      return itemsIndex.saveObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data
        )
      )
    }
  })
