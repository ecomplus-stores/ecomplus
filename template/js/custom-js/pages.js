// Add your custom JavaScript for storefront pages here.
import ecomCart from '@ecomplus/shopping-cart'

// Landing page: ao comprar o plano, mantém 1 unidade no carrinho
// e leva direto para o checkout.
ecomCart.on('addItem', ({ item }) => {
  if (item && item.quantity > 1) {
    ecomCart.increaseItemQnt(item._id, 1 - item.quantity)
  }
  window.location.href = '/app/#/checkout'
})
