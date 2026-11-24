import { ImageResponse } from "next/og";
import { renderPolaBrandIcon } from "@/lib/brandIcon";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    renderPolaBrandIcon({ size: 180, variant: "standard" }),
    {
      ...size,
    }
  );
}
