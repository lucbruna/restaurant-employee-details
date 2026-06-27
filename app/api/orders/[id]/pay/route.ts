import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isPaymentMethodCode } from '@/lib/payments/config';
import { collectManualPayment } from '@/lib/payments/service';
import { PaymentServiceError } from '@/lib/payments/types';

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toSafeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
    const paymentMethodValue = normalizeOptionalText(body?.paymentMethod) ?? 'cash';

    if (!isPaymentMethodCode(paymentMethodValue)) {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }

    const amountPaid =
      body?.amountPaid == null ? undefined : toSafeNumber(body.amountPaid);

    const result = await collectManualPayment({
      orderId: id,
      outletId: session.user.outletId,
      cashierId: session.user.id,
      paymentMethod: paymentMethodValue,
      amountPaid,
      reference: normalizeOptionalText(body?.reference),
      transactionId: normalizeOptionalText(body?.transactionId),
    });

    return NextResponse.json({
      order: result.order,
      paymentId: result.paymentId,
      paymentAttemptId: result.paymentAttemptId,
      changeAmount: result.changeAmount,
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

    console.error('[ORDERS_PAY_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
