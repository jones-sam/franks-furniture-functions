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

// import Stripe from "stripe"
// const stripe = new Stripe(process.env.STRIPE_SK)
// For some reason I don't get intellisense when importing using "require"
const stripe = require("stripe")(process.env.STRIPE_SK)

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body

  let itemIds = items.map((item) => db.doc(`items/${item.itemId}`))
  let totalCostCents = 0
  db.getAll(...itemIds)
    .then((docs) => {
      docs.forEach((doc, index) => {
        totalCostCents += doc.data().price * 100 * items[index].quantity
      })
    })
    .then(() => {
      stripe.paymentIntents
        .create({
          amount: totalCostCents,
          currency: "cad",
        })
        .then((data) => {
          res.send({
            clientSecret: data.client_secret,
          })
        })
        .catch((err) => {
          console.error(err)
          res.status(400).send({ error: err })
        })
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send({ error: "Something went wrong" })
    })
})

exports.api = functions.https.onRequest(app)
