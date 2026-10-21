import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BackButton } from "@/components/site/back-button";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4">
      <BackButton className="absolute top-4 left-4" />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>
            Sign in with your registered admin Google account to view the
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton next="/admin" />
        </CardContent>
      </Card>
    </div>
  );
}
