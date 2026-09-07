import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-primary-800 mb-4">
          دخل و خرج
        </h1>
        <p className="text-gray-600 mb-8">
          مدیریت هوشمند درآمدها و هزینه‌های شما
        </p>
        <div className="space-y-3">
          <Link href="/login" className="block btn-primary w-full">
            ورود
          </Link>
          <Link href="/register" className="block btn-secondary w-full">
            ثبت‌نام
          </Link>
        </div>
      </div>
    </main>
  );
}