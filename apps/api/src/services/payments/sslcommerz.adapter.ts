import type {
  PaymentProviderAdapter,
  CreateIntentInput,
  CreateIntentResult,
  CaptureInput,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from './provider'

// SSLCommerz adapter — Bangladesh-focused payment gateway. Hosted-page model.
// Docs: https://developer.sslcommerz.com
//
// Sandbox host: https://sandbox.sslcommerz.com
// Live host:    https://securepay.sslcommerz.com

const apiHost = (): string =>
  process.env.SSLCOMMERZ_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com'

const requireCreds = () => {
  const storeId = process.env.SSLCOMMERZ_STORE_ID
  const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD
  if (!storeId || !storePass) throw new Error('SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD not set')
  return { storeId, storePass }
}

const centsToAmount = (cents: bigint): string => {
  const whole = cents / 100n
  const frac = cents % 100n
  return `${whole}.${frac.toString().padStart(2, '0')}`
}

export const sslcommerzAdapter: PaymentProviderAdapter = {
  name: 'SSLCOMMERZ',

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const { storeId, storePass } = requireCreds()
    const tranId = `${input.orderId}-${Date.now()}`
    const body: Record<string, string> = {
      store_id: storeId,
      store_passwd: storePass,
      total_amount: centsToAmount(input.amountCents),
      currency: input.currency,
      tran_id: tranId,
      success_url: input.successUrl ?? '',
      fail_url: input.cancelUrl ?? '',
      cancel_url: input.cancelUrl ?? '',
      cus_email: input.customerEmail ?? 'noreply@example.com',
      cus_name: 'Customer',
      cus_phone: '0000000000',
      cus_add1: 'N/A',
      cus_city: 'N/A',
      cus_country: 'BD',
      shipping_method: 'NO',
      product_name: `Order ${input.orderId}`,
      product_category: 'general',
      product_profile: 'general',
      value_a: input.orderId,
      value_b: input.storeId,
    }

    const res = await fetch(`${apiHost()}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    })
    const json: any = await res.json()
    if (json.status !== 'SUCCESS') {
      throw new Error(`SSLCommerz session failed: ${json?.failedreason ?? 'unknown'}`)
    }
    return {
      providerRef: tranId,
      redirectUrl: json.GatewayPageURL,
      raw: json,
    }
  },

  async capture(_input: CaptureInput): Promise<{ raw: unknown }> {
    // SSLCommerz hosted flow auto-captures on success. No explicit capture call.
    return { raw: { note: 'SSLCommerz auto-captures on hosted page success' } }
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const { storeId, storePass } = requireCreds()
    const params = new URLSearchParams({
      bank_tran_id: input.providerRef,
      refund_amount: centsToAmount(input.amountCents),
      refund_remarks: input.reason ?? 'customer-request',
      store_id: storeId,
      store_passwd: storePass,
      v: '1',
    })
    const res = await fetch(`${apiHost()}/validator/api/merchantTransIDvalidationAPI.php?${params}`)
    const json: any = await res.json()
    if (json.APIConnect !== 'DONE') {
      throw new Error(`SSLCommerz refund failed: ${JSON.stringify(json)}`)
    }
    return { providerRef: json.refund_ref_id ?? input.providerRef, raw: json }
  },

  async parseWebhook(rawBody, _headers): Promise<WebhookEvent> {
    // SSLCommerz IPN POSTs form-encoded data. Validate by re-querying their validation API.
    const params = new URLSearchParams(rawBody)
    const valId = params.get('val_id')
    const tranId = params.get('tran_id')
    const status = params.get('status')
    if (!valId || !tranId) throw new Error('Missing val_id / tran_id in SSLCommerz IPN')

    const { storeId, storePass } = requireCreds()
    const validateUrl =
      `${apiHost()}/validator/api/validationserverAPI.php` +
      `?val_id=${encodeURIComponent(valId)}&store_id=${storeId}&store_passwd=${storePass}&v=1&format=json`
    const res = await fetch(validateUrl)
    const json: any = await res.json()
    if (json.status !== 'VALID' && json.status !== 'VALIDATED') {
      throw new Error(`SSLCommerz validation failed: ${json.status}`)
    }

    const map: Record<string, WebhookEvent['status']> = {
      VALID: 'CAPTURED',
      VALIDATED: 'CAPTURED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    }

    return {
      type: status ? `sslcommerz.${status.toLowerCase()}` : 'sslcommerz.unknown',
      providerRef: tranId,
      status: map[status ?? ''],
      amountCents:
        json.amount != null ? BigInt(Math.round(parseFloat(json.amount) * 100)) : undefined,
      currency: json.currency_type,
      raw: json,
    }
  },
}
