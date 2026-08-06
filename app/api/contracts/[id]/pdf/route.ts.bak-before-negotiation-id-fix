import { NextResponse } from "next/server";
import { generateNegotiationTermsPdf } from "@/lib/contract-actions";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;
   const pdf = await generateNegotiationTermsPdf(id);

   return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="brandbridge-contract-${id}.pdf"`,
    },
  });
}

