import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(apiKey);
}

export async function POST() {
  try {
    console.log(
      "STRIPE_SECRET_KEY prefix:",
      process.env.STRIPE_SECRET_KEY?.substring(0, 12)
    );

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "ログインしてください" },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      line_items: [
        {
          price: process.env.STRIPE_GROWTH_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error: "Stripe決済作成エラー",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}