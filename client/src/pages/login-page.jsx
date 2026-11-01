import { Link } from "react-router-dom";

import AuthShell from "@/components/layout/auth-shell.jsx";
import LoginForm from "@/features/auth/components/login-form.jsx";

const LoginPage = () => (
  <AuthShell
    kicker="Welcome back"
    title="Sign in to your drive"
    description="Enter the email and password for your account."
    footer={
      <>
        New here?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Create an account
        </Link>
      </>
    }
  >
    <LoginForm />
  </AuthShell>
);

export default LoginPage;
