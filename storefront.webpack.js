/*
 * Config Webpack extra da loja, mesclada pelo @ecomplus/storefront-framework
 * (ver `tryConfigMerge` em storefront-framework/src/webpack.config.js).
 *
 * O alias abaixo substitui o componente EcCheckout do SPA de checkout
 * (@ecomplus/storefront-app) pela versão da loja, mantendo o restante do app
 * intacto. A chave é exatamente a string usada no `import` original em
 * storefront-app/src/views/js/Checkout.js.
 */
const path = require('path')

module.exports = {
  resolve: {
    alias: {
      './../../components/EcCheckout.vue$': path.resolve(
        __dirname,
        'template/js/custom-js/checkout/EcCheckout.vue'
      )
    }
  }
}
