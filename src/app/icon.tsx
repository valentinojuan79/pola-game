import { ImageResponse } from "next/og";
import { renderPolaBrandIcon } from "@/lib/brandIcon";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    renderPolaBrandIcon({ size: 64, variant: "favicon" }),
    {
      ...size,
    }
  );
}
