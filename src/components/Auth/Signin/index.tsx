import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <div className="w-full">
      <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Sign In to Admin Panel
      </h2>
      
      <SigninWithPassword />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Forgot your password?{" "}
          <a
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            Reset it here
          </a>
        </p>
      </div>
    </div>
  );
}
