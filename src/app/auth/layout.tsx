import type { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
      <main className="w-full max-w-[1440px] p-4 md:p-6 2xl:p-10">
        {children}
      </main>
    </div>
  );
}
