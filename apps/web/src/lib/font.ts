import { DM_Sans, Space_Grotesk } from "next/font/google";

export const spaceGroteskHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});
