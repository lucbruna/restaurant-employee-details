import { NextResponse } from 'next/server';
import { isPaymentProviderCode } from '@/lib/payments/config';
import { processPaymentWebhook } from '@/lib/payments/service';
import { PaymentServiceError } from '@/lib/payments/types';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;

    if (!isPaymentProviderCode(provider)) {
      return NextResponse.json({ error: 'Unsupported payment provider.' }, { status: 400 });
    }

    const rawBody = await req.text();
    const result = await processPaymentWebhook(provider, rawBody, req.headers);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details ?? null,
        },
        { status: error.statusCode },
      );
    }

    console.error('[PAYMENT_WEBHOOK_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
