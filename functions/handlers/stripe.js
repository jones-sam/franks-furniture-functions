const functions = require("firebase-functions")

// import Stripe from "stripe"
// const stripe = new Stripe(process.env.STRIPE_SK)
// For some reason I don't get intellisense when importing using "require"
const stripe = require("stripe")(functions.config().stripe.sk)

const { db } = require("../util/admin")

exports.createPaymentIntent = async (req, res) => {
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
}
