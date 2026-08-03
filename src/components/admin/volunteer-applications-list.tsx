"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CalendarDays, Mail, Phone, Search } from "lucide-react";

interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  college_id: string;
  collegeName: string;
  stream: string;
  semester: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreement_q1: string;
  agreement_q2: string;
  agreement_q3: string;
  created_at: string;
}

export function VolunteerApplicationsList({
  applications,
}: {
  applications: VolunteerApplication[];
}) {
  const [query, setQuery] = useState("");

  const filteredApplications = applications.filter((app) => {
    if (!query.trim()) return true;

    const lowerQuery = query.toLowerCase();
    return (
      app.name.toLowerCase().includes(lowerQuery) ||
      app.email.toLowerCase().includes(lowerQuery) ||
      app.mobile.includes(lowerQuery)
    );
  });

  return (
    <div className="space-y-4">
      {applications.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Search by name, email, or mobile..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50 shadow-sm"
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredApplications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-xl">{app.name}</CardTitle>
                <Badge variant="secondary">{app.collegeName}</Badge>
              </div>
              <CardDescription className="flex flex-col gap-1 mt-2">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <CalendarDays className="size-3.5" />
                  {new Date(app.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {app.mobile}
                  </span>
                  <span className="hidden sm:inline mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" /> {app.email}
                  </span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Stream
                  </p>
                  <p className="font-medium">{app.stream}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Semester
                  </p>
                  <p className="font-medium">{app.semester}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Instagram
                  </p>
                  <p className="font-medium">@{app.instagram_handle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    Referred by
                  </p>
                  <p className="font-medium">{app.referred_by || "—"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">Q1: {app.agreement_q1}</Badge>
                <Badge variant="outline">Q2: {app.agreement_q2}</Badge>
                <Badge variant="outline">Q3: {app.agreement_q3}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredApplications.length === 0 && applications.length > 0 ? (
          <div className="text-center py-8 bg-card rounded-lg border border-border/50 border-dashed">
            <p className="text-muted-foreground text-sm">
              No applications match your search.
            </p>
          </div>
        ) : null}

        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No volunteer applications yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
