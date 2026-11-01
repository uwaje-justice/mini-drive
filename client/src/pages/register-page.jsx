import { Link } from "react-router-dom";

import AuthShell from "@/components/layout/auth-shell.jsx";
import RegisterForm from "@/features/auth/components/register-form.jsx";

const RegisterPage = () => (
  <AuthShell
    kicker="New account"
    title="Create your account"
    description="Choose an email and password. Your drive starts empty."
    footer={
      <>
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign in
        </Link>
      </>
    }
  >
    <RegisterForm />
  </AuthShell>
);

export default RegisterPage;
