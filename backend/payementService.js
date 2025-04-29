const DodoPayments = require('dodopayments');

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
});

const createPaymentForAudio = async (textLength) => {
  try {
    const amount = calculatePaymentAmount(textLength);  
    const payment = await client.payments.create({
      payment_link: true,
      billing: {
        city: 'DefaultCity',
        country: 'INR',
        state: 'MH',
        street: '123 Main St',
        zipcode: 400001,
      },
      customer: {
        email: 'user@example.com', // Replace with dynamic user email from request
        name: 'Anonymous User',    // Replace with dynamic user name
      },
      product_cart: [{
        product_id: 'audio_generation',
        quantity: 1,
        price: amount,
      }],
    });

    return {
      paymentId: payment.payment_id,
      paymentLink: `https://test.dodopayments.com/pay/${payment.payment_id}`, // Test mode URL
      amount: amount,
    };
  } catch (error) {
    console.error('Payment creation failed:', error.message);
    throw new Error('Failed to create payment link');
  }
};

const calculatePaymentAmount = (textLength) => {
  const baseCost = 0.10;  
  const perCharCost = 0.0001;  
  const calculatedCost = (textLength / 100) * perCharCost;
  return Math.max(baseCost, calculatedCost).toFixed(2);
};

module.exports = { createPaymentForAudio };