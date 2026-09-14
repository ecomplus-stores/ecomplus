# Storefront

:shopping: :rocket:
[PWA](https://developers.google.com/web/progressive-web-apps) and
[JAMstack](https://jamstack.org/)
based e-commerce template for
[E-Com Plus](https://www.e-com.plus)
stores

> Gerenated from [@ecomplus/storefront-starter](https://github.com/ecomplus/storefront-starter)

:scroll: **[Get started](https://github.com/ecomplus/storefront-starter#getting-started)**
/ [Documentation](https://developers.e-com.plus/storefront/)

## Project setup

```
npm i
```

### Compiles and hot-reloads for development

```
npm run serve
```

It starts serving site on http://localhost:9100/.

### Compiles and minifies for production

```
npm run build
```

## Landing page com checkout digital

A home (`template/pages/index.ejs`) é uma landing page de página única com o
bloco de produto padrão do storefront (`@/sections/product-block`) para o plano
definido em `content/landing.json`. Não há cabeçalho, busca nem minicart.

- `content/landing.json`: textos da página e `product_id` do plano vendido.
- `template/js/custom-js/pages.js`: ao comprar, mantém 1 unidade no carrinho e
  redireciona para `/app/#/checkout`.
- `storefront.webpack.js`: alias que troca o componente `EcCheckout` do
  `@ecomplus/storefront-app` pela versão em `template/js/custom-js/checkout/`.
- `template/js/custom-js/checkout/EcCheckout.vue`: mesmo fluxo do checkout
  padrão (identificação, endereço, pagamento), mas sem escolha de frete: a
  calculadora roda oculta com o CEP do endereço e seleciona sozinha o serviço
  grátis "por e-mail" do app **Frete personalizado** (a API `@checkout` exige
  um frete). O endereço segue normalmente para o pedido e para a Vindi.
