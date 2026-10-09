import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type SanityWebhookPayload = {
  _type?: string;
  _id?: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { success: false, message: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  try {
    /*
     * Sanity signs the webhook request.
     * parseBody verifies the signature before we trust the payload.
     *
     * `true` waits briefly for Sanity's content to propagate before the
     * next cache miss fetches fresh content.
     */
    const { isValidSignature, body } =
      await parseBody<SanityWebhookPayload>(
        request,
        secret,
        true
      );

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { success: false, message: "Missing document type." },
        { status: 400 }
      );
    }

    // We only care about our landing page document.
    if (body._type === "landingPage") {
      revalidateTag("landing-page", "max");
    }

    return NextResponse.json({
      success: true,
      revalidated: body._type === "landingPage",
      documentType: body._type,
      documentId: body._id ?? null
    });
  } catch (error) {
    console.error("Revalidation webhook failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed."
      },
      { status: 500 }
    );
  }
}