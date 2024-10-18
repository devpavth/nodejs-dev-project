require('dotenv').config();
const express = require("express");
const Stripe = require('stripe');
const cors = require("cors");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());
app.use(cors());
const port = 3000;
const host = '0.0.0.0';

app.post("/payment-sheet", async(req, res, next) => {
    try{
        const data = req.body;
        console.log(req.body);
        const params= {
            email: data.email,
            name: data.name,
        };
        const customer = await stripe.customers.create(params);
        console.log(customer.id);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2020-08-27'}
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id,
            automatic_payment_methods:{
                enabled: true,
            },
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    }catch(e){
        next(e);
    }
});

app.listen(port, host, ()=>{
    console.log(`Server is running at http://${host}:${port}`);
});

