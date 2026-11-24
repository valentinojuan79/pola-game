import { ImageResponse } from "next/og";
import { renderPolaBrandIcon } from "@/lib/brandIcon";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    renderPolaBrandIcon({ size: 64, variant: "favicon" }),
    {
      width: 64,
      height: 64,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );
}
