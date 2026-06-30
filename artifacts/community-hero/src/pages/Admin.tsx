import { useState } from "react";
import { useListIssues, useUpdateIssue, IssueUpdateStatus, IssueUpdateSeverity, useGetInsights } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Admin() {
  const { data: issues, isLoading } = useListIssues();
  const { data: insightsData, isLoading: insightsLoading } = useGetInsights();
  const queryClient = useQueryClient();
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolveImage, setResolveImage] = useState("");

  const updateMutation = useUpdateIssue({
    mutation: {
      onSuccess: () => {
        toast.success("Issue updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
        setResolveModalOpen(false);
        setResolveNote("");
        setResolveImage("");
      }
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "resolved") {
      setSelectedIssueId(id);
      setResolveModalOpen(true);
    } else {
      updateMutation.mutate({ id, data: { status: newStatus as IssueUpdateStatus } });
    }
  };

  const handleSeverityChange = (id: string, newSeverity: string) => {
    updateMutation.mutate({ id, data: { severity: newSeverity as IssueUpdateSeverity } });
  };

  const submitResolution = () => {
    if (!selectedIssueId) return;
    updateMutation.mutate({
      id: selectedIssueId,
      data: {
        status: "resolved",
        note: resolveNote,
        resolutionImageUrl: resolveImage || undefined
      }
    });
  };

  if (isLoading) return <div className="p-8">Loading administration panel...</div>;

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-2">Administration Panel</h1>
      <p className="text-muted-foreground mb-8">Manage and update civic issues.</p>

      <Card className="mb-8 border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Bot className="w-5 h-5" /> AI Dashboard Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {insightsLoading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating insights...
            </div>
          ) : insightsData?.insights ? (
            <div className="grid gap-3">
              {insightsData.insights.map((insight, idx) => (
                <div key={idx} className="flex gap-2 p-3 bg-muted/30 rounded-lg text-sm">
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No insights available.</p>
          )}
        </CardContent>
      </Card>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verifications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues?.map((issue: any) => (
              <TableRow key={issue.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{issue.id.substring(0, 8)}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{issue.title}</TableCell>
                <TableCell className="text-sm">{format(new Date(issue.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell><Badge variant="outline">{issue.category}</Badge></TableCell>
                <TableCell>
                  <Select 
                    value={issue.severity} 
                    onValueChange={(val) => handleSeverityChange(issue.id, val)}
                    disabled={issue.status === "resolved"}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={issue.status} 
                    onValueChange={(val) => handleStatusChange(issue.id, val)}
                    disabled={issue.status === "resolved"}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reported">Reported</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">{issue.verifiedCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Issue as Resolved</DialogTitle>
            <DialogDescription>
              Provide resolution details. This will award bonus points to the reporter and verifiers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea 
                placeholder="What was done to fix this issue?" 
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Resolution Photo URL (Optional)</Label>
              <Input 
                placeholder="https://example.com/after-photo.jpg" 
                value={resolveImage}
                onChange={(e) => setResolveImage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>Cancel</Button>
            <Button onClick={submitResolution} disabled={!resolveNote || updateMutation.isPending}>
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
