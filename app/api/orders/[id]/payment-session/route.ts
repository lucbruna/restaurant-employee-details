import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  isPaymentMethodCode,
  isPaymentProviderCode,
} from '@/lib/payments/config';
import { createOrderPaymentSession } from '@/lib/payments/service';
import { PaymentServiceError } from '@/lib/payments/types';

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!session.user.outletId) {
      return new NextResponse('User is not assigned to an outlet', { status: 403 });
    }

    const body = await req.json();
    const providerValue = normalizeOptionalText(body?.provider);
    const paymentMethodValue = normalizeOptionalText(body?.paymentMethod);
    const returnUrl = normalizeOptionalText(body?.returnUrl);

    if (providerValue && !isPaymentProviderCode(providerValue)) {
      return NextResponse.json({ error: 'Unsupported payment provider.' }, { status: 400 });
    }

    if (paymentMethodValue && !isPaymentMethodCode(paymentMethodValue)) {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }

    const provider = providerValue && isPaymentProviderCode(providerValue)
      ? providerValue
      : undefined;
    const paymentMethod = paymentMethodValue && isPaymentMethodCode(paymentMethodValue)
      ? paymentMethodValue
      : undefined;

    const result = await createOrderPaymentSession({
      orderId: id,
      outletId: session.user.outletId,
      cashierId: session.user.id,
      provider,
      paymentMethod,
      returnUrl,
    });

    return NextResponse.json(result);
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

    console.error('[ORDER_PAYMENT_SESSION_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
