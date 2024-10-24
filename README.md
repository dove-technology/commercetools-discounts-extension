## Shipping Discounts

Shipping Discounts can be integrated in two different ways:

1. Using Direct Discounts (the default)
2. Using Custom Line Items

[Direct Discounts](https://docs.commercetools.com/api/pricing-and-discounts-overview#direct-discounts) provide a better integration into commercetools (they create actual discounts on a cart just like the built in commercetools ones do), but they can't be used alongside the built in commercetools discount functionality.

[Custom Line Items](https://docs.commercetools.com/api/carts-orders-overview#custom-line-items) on the other hand can be used alongside the commercetools discount functionality, but don't create actual discounts on the cart. The Custom Line Item will need to be used to display the shipping discount amount.

The Custom Line Item used for shipping discounts has a slug of `dovetech-shippingCustomLineItem`

If you're starting a new project we would recommend using Direct Discounts. Using a mix of commercetools discounts and Dovetech discounts could lead to confusing results.

The `USE_DIRECT_DISCOUNTS_FOR_SHIPPING` environment variable can be used to change from using Direct Discounts to Custom Line Items by setting the value to `false`.

If you use a Custom Line Item for shipping discounts you need to specify the tax category for the Custom Line Item using the `CTP_TAX_CATEGORY_ID` environment variable.

### Carts with Multiple Shipping Methods

Carts with multiple Shipping Methods (i.e. carts with a Shipping Mode of `Multiple`) do not have their shipping cost passed to Dovetech so no shipping discounts setup in Dovetech will apply.
