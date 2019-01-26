// https://github.com/vipinkrishna


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

// console.log(stripeSecretKey, stripePublicKey)

const express = require('express')
const app = express()
const fs = require('fs')

//STRIPE SECRET KEY
const stripe = require('stripe')(stripeSecretKey)

//EJS
app.set('view engine', 'ejs')

//JSON
app.use(express.json())

//PUBLIC
app.use(express.static('public'))

//STORE (GET)
app.get('/', function(req, res) {
  fs.readFile('items.json', function(error, data) {
    if (error) {
      res.status(500).end()
    } else {
      // console.log(JSON.parse(data))
      res.render('index.ejs', {
        stripePublicKey: stripePublicKey,
        items: JSON.parse(data)
      })
      // res.json(JSON.parse(data));
    }
  })
})

//PURCHASE (POST)
app.post('/', function(req, res) {
  fs.readFile('items.json', function(error, data) {
    if (error) {
      res.status(500).end()
    } else {
      const itemsJson = JSON.parse(data)
      const itemsArray = itemsJson.music.concat(itemsJson.electronics)
      let total = 0
      req.body.items.forEach(function(item) {
        const itemJson = itemsArray.find(function(i) {
          return i.id == item.id
        })
        total = total + itemJson.price * item.quantity
      })


      // STRIPE.CHARGES.CREATE
      stripe.charges.create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: 'usd'
      }).then(function() {
        console.log('PAYMENT SUCCESSFUL')
        res.json({ message: 'Successfully purchased items' })
      }).catch(function() {
        console.log('PAYMENT FAILED')
        res.status(500).end()
      })
    }
  })
})

//LISTEN
app.listen(3000, console.log('SERVER ON'))