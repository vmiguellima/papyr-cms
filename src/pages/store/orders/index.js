import React, { useState, useEffect, useContext } from 'react'
import Error from 'next/error'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import userContext from '@/context/userContext'
import styles from './orders.module.scss'


const Orders = () => {

  const { currentUser } = useContext(userContext)
  if (!currentUser || !currentUser.isAdmin) return <Error statusCode={403} />

  const [orders, setOrders] = useState([])
  useEffect(() => {
    const resetOrders = async () => {
      if (currentUser && currentUser.isAdmin) {
        const { data: foundOrders } = await axios.get('/api/store/orders')
        setOrders(foundOrders)
      }
    }
    resetOrders()
  }, [currentUser])


  const renderProducts = (products) => {
    return _.map(products, product => {
      return <p className="order__product" key={product._id}>{product.title}</p>
    })
  }

  const markShipped = (shippedOrder) => {
    const newOrder = { ...shippedOrder, shipped: !shippedOrder.shipped }
    axios.put(`/api/store/orders/${shippedOrder._id}`, newOrder)
      .then(response => {
        const newOrders = _.map(orders, order => {
          if (order._id === newOrder._id) {
            order = newOrder
          }
          return order
        })
        setOrders(newOrders)
      }).catch(error => {
        console.error(error)
      })
  }

  const deleteOrder = (deletedOrder) => {
    const confirm = window.confirm('Are you sure you want to delete this order?')
    if (!confirm) return

    axios.delete(`/api/store/orders/${deletedOrder._id}`)
      .then(response => {
        const newOrders = _.filter(orders, order => order._id !== deletedOrder._id)
        setOrders(newOrders)
      }).catch(error => {
        console.error(error)
      })
  }

  const renderOrders = () => {
    return _.map(orders, order => {
      const { created, user, products, _id, notes, shipped } = order

      return (
        <li key={_id} className={styles["order"]}>
          <p>This has {!shipped && 'not '}been shipped.</p>
          <div className={styles["order__info"]}>

            { // Address info is based on a user bound to the order
            // If the user was logged out, this breaks.
            // The address should already be in the notes 100% of the time anyway

             /* <div className="order__info--address">
              <h3 className="heading-tertiary">Ship to:</h3>
              <p>
                {user.shippingFirstName || user.firstName}
                {' '}
                {user.shippingLastName || user.lastName}
              </p>
              <p>{user.shippingAddress1 || user.address1}</p>
              {() => {
                if (user.shippingAddress2 || user.address2)
                return <p>{user.shippingAddress2 || user.address2}</p>
              }}
              <p>
                {user.shippingCity || user.city}
                {', '}
                {user.shippingState || user.state}
                {' '}
                {user.shippingZip || user.zip}
              </p>
              <p>{user.shippingCountry || user.country}</p>
            </div> */}

            <div className={styles["order__info--products"]}>
              <h3 className="heading-tertiary">Products:</h3>
              <ul className={styles["order__products"]}>{renderProducts(products)}</ul>
            </div>

            <div className={styles["order__info--notes"]}>
              <h3 className="heading-tertiary">Order Notes:</h3>
              <p>{notes || 'none'}</p>
            </div>

            <div className={styles["order__info--created"]}>
              <h3 className="heading-tertiary">Created:</h3>
              <p>{moment(created).format('MMMM Do, YYYY')}</p>
            </div>
          </div>

          <div className={styles["order__actions"]}>
            <button
              className={`${styles["order__ship"]} button button-primary`}
              onClick={() => markShipped(order)}
            >
              Mark {order.shipped && 'not '}shipped
            </button>
            <button
              className={`${styles["order__delete"]} button button-delete`}
              onClick={() => deleteOrder(order)}
            >
              Delete
            </button>
          </div>
        </li>
      )
    })
  }

  return (
    <div className={styles["orders"]}>
      <h2 className="heading-secondary u-margin-bottom-small">Orders</h2>
      <ul className={styles["orders__list"]}>
        {renderOrders()}
      </ul>
    </div>
  )
}


export default Orders
