import { ImageResponse } from "next/og";
import { renderPolaBrandIcon } from "@/lib/brandIcon";

export const dynamic = "force-static";

const ICON_SPECS: Record<
  string,
  { size: number; variant: "standard" | "maskable" }
> = {
  "icon-192.png": { size: 192, variant: "standard" },
  "icon-192-maskable.png": { size: 192, variant: "maskable" },
  "icon-512.png": { size: 512, variant: "standard" },
  "icon-512-maskable.png": { size: 512, variant: "maskable" },
};

export function generateStaticParams() {
  return Object.keys(ICON_SPECS).map((icon) => ({ icon }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ icon: string }> }
) {
  const { icon } = await context.params;
  const spec = ICON_SPECS[icon];
  if (!spec) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    renderPolaBrandIcon({ size: spec.size, variant: spec.variant }),
    {
      width: spec.size,
      height: spec.size,
    }
  );
}
