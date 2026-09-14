<script>
/*
 * Substitui o componente EcCheckout do @ecomplus/storefront-app
 * (alias em ../../../../storefront.webpack.js) para venda de produto digital.
 *
 * O fluxo original é mantido (identificação, endereço, pagamento), mas a
 * escolha de frete fica oculta: a <shipping-calculator> roda escondida com o
 * CEP do endereço informado e seleciona sozinha o serviço grátis "por e-mail"
 * do app Frete personalizado, exigido pela API @checkout. O endereço (CEP e
 * número, com o resto preenchido pelo CEP) segue para o pedido e para a Vindi.
 * O template abaixo é uma versão reduzida do original em
 * storefront-app/src/components/html/EcCheckout.html.
 */
import { i18n } from '@ecomplus/utils'
import EcCheckoutBase from '@ecomplus/storefront-app/src/components/js/EcCheckout.js'

export default {
  name: 'EcCheckout',
  extends: EcCheckoutBase,

  computed: {
    i19identification: () => i18n({
      pt_br: 'Identificação',
      en_us: 'Identification'
    }),
    i19edit: () => i18n({
      pt_br: 'Editar',
      en_us: 'Edit'
    }),
    i19digitalDeliveryMsg: () => i18n({
      pt_br: 'Produto digital: nenhum envio físico. ' +
        'O endereço é usado apenas para o cadastro e a cobrança, ' +
        'e o acesso é liberado por e-mail após a confirmação do pagamento.',
      en_us: 'Digital product: nothing is shipped. ' +
        'The address is used for registration and billing only, ' +
        'and access is delivered by email once the payment is confirmed.'
    }),

    buyerName () {
      const { localCustomer } = this
      if (localCustomer.registry_type === 'j' && localCustomer.corporate_name) {
        return localCustomer.corporate_name
      }
      const { name } = localCustomer
      return name
        ? [name.given_name, name.middle_name, name.family_name].filter(Boolean).join(' ')
        : ''
    }
  },

  methods: {
    selectDigitalShipping (service) {
      this.$emit('update:shipping-service', service)
    }
  }
}
</script>

<template>
  <div class="checkout checkout--digital">
    <transition-group
      enter-active-class="animated fadeIn"
      leave-active-class="d-none"
    >
      <div
        v-if="shownCheckoutStep"
        :key="`app${checkoutAppId}`"
        class="checkout__app"
        :data-current-step="shownCheckoutStep"
        :data-enabled-step="enabledCheckoutStep"
      >
        <div class="row">
          <div :class="canHideSummary ? 'col' : 'col-lg-8'">
            <nav class="checkout__steps">
              <a
                href="#"
                class="checkout__step"
                v-for="(label, i) in [null, 'Buyer', 'Payment']"
                v-if="label"
                :class="'checkout__step--' + (
                  shownCheckoutStep === i ? 'current'
                    : enabledCheckoutStep < i ? 'disabled'
                      : shownCheckoutStep > i ? 'past' : 'next'
                )"
                @click.prevent="toCheckoutStep = i"
              >
                <small>{{ i }}</small>
                {{ i === 1 ? i19identification : i18n(label) }}
              </a>
            </nav>

            <div class="row">
              <div
                class="checkout__col col-md-6"
                :class="enabledCheckoutStep === 1 ? 'offset-lg-3' : null"
              >
                <div :class="shownCheckoutStep !== 1 ? 'd-none d-md-block' : null">
                  <div class="checkout__account mb-3">
                    <account-form
                      v-if="isGuestCheckout"
                      :customer.sync="localCustomer"
                      :is-short="true"
                      :is-guest-access="true"
                      :has-submit-btn="!hasBuyerInfo"
                      :btn-text="i19proceed"
                    />
                    <div
                      v-else-if="hasBuyerInfo"
                      class="checkout__buyer"
                    >
                      <strong>{{ buyerName }}</strong>
                      <span class="d-block">{{ customerEmail }}</span>
                      <span
                        v-if="localCustomer.doc_number"
                        class="d-block"
                      >
                        {{ localCustomer.doc_number }}
                      </span>
                      <a
                        href="#"
                        class="btn btn-sm btn-light mt-2"
                        @click.prevent="editAccount = true"
                      >
                        <i class="i-edit mr-1"></i>
                        {{ i19edit }}
                      </a>
                    </div>
                  </div>

                  <account-addresses
                    v-if="hasBuyerInfo"
                    :customer.sync="localCustomer"
                    :zip-code="shippingZipCode"
                    :form-btn-text="i19proceed"
                    :can-show-form="shownCheckoutStep === 1"
                    @select-address="selectAddress"
                    @show-form="isAddrForm => isEditingAddr = isAddrForm"
                  />

                  <div
                    v-if="shippingAddress && cart.items.length"
                    class="d-none"
                    aria-hidden="true"
                  >
                    <shipping-calculator
                      :key="`shipTo${localZipCode}-${skipShippingApps.length}`"
                      :can-select-services="true"
                      :can-auto-select-service="true"
                      :can-input-zip="false"
                      :shipped-items="cart.items"
                      :zip-code="localZipCode"
                      :skip-app-ids="skipShippingApps"
                      @select-service="selectDigitalShipping"
                    />
                  </div>

                  <p
                    v-if="hasBuyerInfo"
                    class="checkout__digital-note small text-muted"
                  >
                    <i class="i-envelope mr-1"></i>
                    {{ i19digitalDeliveryMsg }}
                  </p>

                  <transition
                    enter-active-class="animated fadeInDown"
                    leave-active-class="animated fadeOutUp"
                  >
                    <button
                      v-if="!isEditingAddr && shownCheckoutStep === 1 && enabledCheckoutStep >= 2"
                      class="checkout__btn-proceed btn btn-success mt-4"
                      @click="toCheckoutStep = 2"
                    >
                      <i class="i-chevron-right mr-1"></i>
                      {{ i18n('ProceedToPayment') }}
                    </button>
                  </transition>

                  <div
                    class="checkout__overlay fade"
                    :class="shownCheckoutStep !== 1 ? 'show' : null"
                    @click="toCheckoutStep = 1"
                  >
                  </div>
                </div>
              </div>

              <div class="checkout__col col-md-6">
                <transition
                  enter-active-class="animated fadeInRight slow"
                  leave-active-class="animated fadeOutRight fast position-absolute"
                >
                  <div
                    v-if="enabledCheckoutStep >= 2"
                    :class="shownCheckoutStep !== 2 ? 'd-none d-md-block' : null"
                  >
                    <payment-methods
                      :key="paymentsListKey"
                      :amount="paymentAmount"
                      :customer="localCustomer"
                      :payment-gateways.sync="paymentGateways"
                      @select-gateway="selectPaymentGateway"
                      @checkout="checkout"
                    />

                    <div
                      class="checkout__overlay fade"
                      :class="shownCheckoutStep !== 2 ? 'show' : null"
                      @click="toCheckoutStep = 2"
                    >
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <discount-applier
              v-if="canHideSummary && enabledCheckoutStep > 1"
              class="checkout__discount mt-4"
              :amount="amount"
              :coupon-code.sync="localDiscountCoupon"
              @set-discount-rule="discountRule => $emit('set-discount-rule', discountRule)"
              :modules-payload="modulesPayload"
              :payment-gateway="paymentGateway"
              :customer="customer"
              is-attention-wanted
            />
          </div>

          <div
            v-if="!canHideSummary"
            class="col-lg-4 checkout__info"
          >
            <div class="checkout__summary">
              <ec-summary
                :amount="amount"
                :items="cart.items"
                :buyer="customer"
                :shippingAddress="shippingAddress"
                :can-show-price-options="!(paymentGateway && paymentGateway.app_id)"
                :paid-in-advance="loyaltyPointsAmount"
                @click:account="editAccount = true"
              >
                <template v-if="enabledCheckoutStep > 1">
                  <discount-applier
                    class="checkout__discount"
                    :amount="amount"
                    :coupon-code.sync="localDiscountCoupon"
                    @set-discount-rule="discountRule => $emit('set-discount-rule', discountRule)"
                    :modules-payload="modulesPayload"
                    :payment-gateway="paymentGateway"
                    :customer="customer"
                    is-attention-wanted
                  />
                </template>
              </ec-summary>

              <div class="checkout__notes mt-4 mb-auto">
                <div class="form-group">
                  <label for="order-notes">{{ i19additionalComments }}</label>
                  <textarea
                    class="form-control"
                    :placeholder="i19orderNotesInputMsg"
                    id="order-notes"
                    rows="3"
                    v-model="localNotes"
                    maxlength="255"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!isUserIdentified"
        key="login"
      >
        <slot name="login">
          <login-block
            @login="login"
            @update="isUserIdentified = true"
            :customer-email.sync="customerEmail"
            :can-fetch-oauth="!isExternalAuth"
          />
        </slot>
      </div>

      <div
        v-else
        key="account"
        class="checkout__account"
      >
        <slot name="account">
          <p class="lead">
            {{ i18n('RegisterToBuy') }}:
          </p>
          <account-form
            :customer.sync="localCustomer"
            :is-short="true"
            :btn-text="i19proceed"
          />
        </slot>
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" src="@ecomplus/storefront-app/src/components/scss/EcCheckout.scss"></style>
