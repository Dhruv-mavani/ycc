import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function StatusScreen({
  title,
  description,
  email,
}: {
  title: string;
  description: string;
  email?: string;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {email ? (
            <p className="text-muted-foreground text-sm">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          ) : null}
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
