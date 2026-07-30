import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecret || !webhookSecret) {
      return NextResponse.json(
        {
          error: "Stripe keys are missing",
        },
        {
          status: 500,
        }
      );
    }

    const stripe = new Stripe(stripeSecret);

    const body = await req.text();

    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          error: "Missing stripe signature",
        },
        {
          status: 400,
        }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const supabase = await createClient();

      await supabase
        .from("profiles")
        .update({
          plan: "growth",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq("id", session.client_reference_id);
    }

    return NextResponse.json({
      received: true,
    });

  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        error: "Webhook error",
      },
      {
        status: 400,
      }
    );
  }
}