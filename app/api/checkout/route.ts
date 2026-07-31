import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(apiKey);
}

export async function POST() {
  console.log("[Stripe Checkout] Starting checkout...");

  try {
    const priceId = process.env.STRIPE_GROWTH_PRICE_ID;

    if (!priceId) {
      console.error(
        "[Stripe Checkout] STRIPE_GROWTH_PRICE_ID is missing",
      );

      return NextResponse.json(
        {
          error: "Stripe Price IDが設定されていません",
        },
        { status: 500 },
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripe = getStripe();

    console.log("[Stripe Checkout] Creating session...");
    console.log("[Stripe Checkout] Price ID:", priceId);
    console.log("[Stripe Checkout] App URL:", appUrl);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url:
        `${appUrl}/pricing?success=true`,

      cancel_url:
        `${appUrl}/pricing?canceled=true`,
    });

    console.log(
      "[Stripe Checkout] Session created:",
      session.id,
    );

    console.log(
      "[Stripe Checkout] URL:",
      session.url,
    );

    if (!session.url) {
      return NextResponse.json(
        {
          error:
            "Stripe Checkout URLを取得できませんでした",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(
      "[Stripe Checkout] Unexpected error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        error: "Stripe決済作成エラー",
        detail: message,
      },
      { status: 500 },
    );
  }
}