import { Header } from "@/components/layout/Header";

/**
 * English route shell: owns the top nav with English labels.
 * Root Header hides itself on /en/* so this is the only header shown.
 */
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header mode="en-only" />
      {children}
    </>
  );
}
