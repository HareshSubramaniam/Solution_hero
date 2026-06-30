import { useState } from "react";
import { useRoute } from "wouter";
import {
  useGetIssue,
  useVerifyIssue,
  useCreateComment,
  useUpdateIssue,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { StatusStepper } from "@/components/StatusStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQueryClient } from "@tanstack/react-query";
import { getIssueImageUrl } from "@/lib/image-fallback";

export default function IssueDetail() {
  const [, params] = useRoute("/issue/:id");
  const id = params?.id || "";
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    data: issue,
    isLoading,
    error,
  } = useGetIssue(id, { query: { enabled: !!id } } as any);

  const [comment, setComment] = useState("");

  const verifyMutation = useVerifyIssue({
    mutation: {
      onSuccess: (data: any) => {
        toast.success(`Issue verified! +${data.pointsEarned} points`);
        queryClient.invalidateQueries({ queryKey: [`/api/issues/${id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/auth/me`] });
      },
    },
  });

  const updateMutation = useUpdateIssue({
    mutation: {
      onSuccess: () => {
        toast.success(`Issue updated!`);
        queryClient.invalidateQueries({ queryKey: [`/api/issues/${id}`] });
      },
    },
  });

  const commentMutation = useCreateComment({
    mutation: {
      onSuccess: () => {
        setComment("");
        toast.success("Comment added");
        queryClient.invalidateQueries({ queryKey: [`/api/issues/${id}`] });
      },
    },
  });

  const handleVerify = () => {
    verifyMutation.mutate({ id });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate({ id, data: { text: comment } });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="container mx-auto p-4 max-w-4xl py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Issue not found</h2>
        <p className="text-muted-foreground mt-2">
          This issue may have been deleted or doesn't exist.
        </p>
      </div>
    );
  }

  const hasVerified = issue.verifiedBy?.includes(user?.id || "");

  return (
    <div className="container mx-auto p-4 max-w-4xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {issue.category.replace("_", " ")}
            </Badge>
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            >
              {issue.severity} priority
            </Badge>
            {issue.aiTags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-heading font-bold">{issue.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{issue.address}</span>
            <span className="px-2">•</span>
            <Clock className="w-4 h-4" />
            <span>
              Reported{" "}
              {formatDistanceToNow(new Date(issue.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {user?.role === "admin" || true ? (
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                updateMutation.mutate({ id, data: { status: "resolved" } })
              }
              disabled={updateMutation.isPending || issue.status === "resolved"}
            >
              🛠️ Simulate City Repair
            </Button>
          ) : null}

          <Button
            size="lg"
            onClick={handleVerify}
            disabled={
              hasVerified ||
              verifyMutation.isPending ||
              issue.status === "resolved"
            }
            className={
              hasVerified
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-primary-foreground"
            }
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {hasVerified
              ? "Verified by You"
              : `✅ Community Verify (${issue.verifiedCount})`}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="rounded-xl overflow-hidden border bg-muted aspect-video relative">
            {getIssueImageUrl(issue.imageUrl, issue.category) && (
              <img
                src={getIssueImageUrl(issue.imageUrl, issue.category)}
                alt={issue.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resolution Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusStepper currentStatus={issue.status} />

              {issue.resolutionImageUrl && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-2">Resolution Photo</h4>
                  <div className="rounded-lg overflow-hidden border aspect-video">
                    <img
                      src={issue.resolutionImageUrl}
                      alt="Resolved"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Community Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleComment} className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={commentMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!comment.trim() || commentMutation.isPending}
                >
                  Post
                </Button>
              </form>

              <Separator />

              <div className="space-y-4">
                {issue.comments?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No comments yet. Be the first to discuss!
                  </p>
                ) : (
                  issue.comments?.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          style={{ backgroundColor: c.userAvatarColor }}
                          className="text-white text-xs"
                        >
                          {c.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between bg-muted/30 rounded-lg rounded-tl-none p-3 border">
                          <p className="text-sm">{c.text}</p>
                        </div>
                        <div className="flex gap-2 mt-1 px-1">
                          <span className="text-xs font-medium">
                            {c.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(c.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full rounded-lg overflow-hidden border relative z-0">
                <MapContainer
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[issue.latitude, issue.longitude]} />
                </MapContainer>
              </div>
              <p className="text-sm mt-3 text-muted-foreground">
                {issue.address}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reporter</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback
                  style={{ backgroundColor: issue.reporterAvatarColor }}
                  className="text-white"
                >
                  {issue.reporterName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{issue.reporterName}</p>
                <p className="text-xs text-muted-foreground">
                  Community Member
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issue.statusHistory?.map((history) => (
                  <div
                    key={history.id}
                    className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-muted last:before:hidden"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10 border border-primary/20 text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium">
                        Status changed to{" "}
                        <span className="capitalize">
                          {history.status.replace("_", " ")}
                        </span>
                      </p>
                      {history.note && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          "{history.note}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        by {history.updatedByName} •{" "}
                        {format(new Date(history.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
