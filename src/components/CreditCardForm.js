import React, { useState, useEffect, useContext } from 'react'
import {
  StripeProvider,
  Elements,
  CardCVCElement,
  CardExpiryElement,
  CardNumberElement,
  injectStripe
} from 'react-stripe-elements'
import keysContext from '@/context/keysContext'
import Button from './Button'


const CreditCardForm = injectStripe((props) => {

  const { className = "", stripe, onSubmit } = props
  const [validation, setValidation] = useState('')

  if (!stripe) return null

  const handleSubmit = async (event, resetButton) => {
    event.preventDefault()

    const data = await stripe.createSource({ type: "card" })

    if (data.error) {
      setValidation(data.error.message || '')
      resetButton()
      return
    }

    onSubmit(data.source, resetButton, setValidation)
  }

  const fieldStyle = {
    base: {
      color: "#333",
      fontSize: "16px",
      lineHeight: 1,
      letterSpacing: "1px",
    }
  }

  return (
    <div className={`credit-card-form ${className}`}>
      <div className="credit-card-form__section credit-card-form__section--number">
        <label className="credit-card-form__label">Card Number *</label>
        <div className="credit-card-form__input">
          <CardNumberElement style={fieldStyle} />
        </div>
      </div>

      <div className="credit-card-form__section credit-card-form__section--expiration">
        <label className="credit-card-form__label">Card Expiration *</label>
        <div className="credit-card-form__input">
          <CardExpiryElement style={fieldStyle} />
        </div>
      </div>

      <div className="credit-card-form__section credit-card-form__section--cvc">
        <label className="credit-card-form__label">Card CVC *</label>
        <div className="credit-card-form__input">
          <CardCVCElement style={fieldStyle} />
        </div>
      </div>

      <p className="credit-card-form__validation">{validation}</p>

      <Button
        className="credit-card-form__submit"
        onClick={handleSubmit}
        submittedText="Processing"
      >
        Submit
      </Button>
    </div>
  )
})


const StripeForm = (props) => {

  const { className, onSubmit } = props
  const [stripe, setStripe] = useState(null)
  const { keys } = useContext(keysContext)

  useEffect(() => {
    const stripeInstance = window.Stripe(keys.stripePublishableKey)
    setStripe(stripeInstance)
  }, [])

  return (
    <StripeProvider stripe={stripe}>
      <Elements>
        <CreditCardForm className={className} onSubmit={onSubmit} />
      </Elements>
    </StripeProvider>
  )
}


export default StripeForm
