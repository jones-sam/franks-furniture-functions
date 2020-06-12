const functions = require("firebase-functions")
require("dotenv").config()
const express = require("express")
const app = express()
const { resolve } = require("path")

const { createPaymentIntent } = require("./handlers/stripe")

app.use(express.static("."))
app.use(express.json())

const cors = require("cors")
app.use(cors())

// Stripe
app.post("/create-payment-intent", createPaymentIntent)

exports.api = functions.https.onRequest(app)
