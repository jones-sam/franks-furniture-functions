const functions = require("firebase-functions")
require("dotenv").config()
const express = require("express")
const app = express()
const { db } = require("./util/admin")
const { resolve } = require("path")

app.use(express.static("."))
app.use(express.json())

const cors = require("cors")
app.use(cors())

import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SK)
// For some reason I don't get intellisense when importing using "require"
const stripe = require("stripe")(process.env.STRIPE_SK)

const calculatePrice = (items) => {
  // this function calculates the price server side, to make sure it wasn't tampered with on the client
  console.log(items)
  let totalCost = 0
  items.forEach((item) => {
    db.doc(`/items/${item.itemId}`)
      .get()
      .then((data) => {})
  })
  return 12345
}

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatePrice(items),
      currency: "cad",
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    res.status(500).send({ error: error })
  }
})

exports.api = functions.https.onRequest(app)
