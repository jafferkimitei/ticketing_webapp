import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(/^\/[^/]+/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1 rounded ${locale === "en" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("sw")}
        className={`px-3 py-1 rounded ${locale === "sw" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        aria-label="Switch to Swahili"
      >
        SW
      </button>
    </div>
  );
}