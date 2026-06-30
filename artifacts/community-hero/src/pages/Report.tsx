import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  useCategorizeIssue,
  reverseGeocode,
  useCreateIssue,
  useVerifyIssue,
  useCheckDuplicate,
  useListIssues,
  IssueInputCategory,
  IssueInputSeverity,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  MapPin,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Check,
  SkipForward,
  Bot,
} from "lucide-react";
import { getIssueImageUrl } from "@/lib/image-fallback";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationPicker({
  position,
  onPositionChange,
}: {
  position: [number, number] | null;
  onPositionChange: (p: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

export default function Report() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [imageBase64, setImageBase64] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<IssueInputCategory | "">("");
  const [severity, setSeverity] = useState<IssueInputSeverity | "">("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiConfidence, setAiConfidence] = useState(0);

  // Smart Triage state
  const [priority, setPriority] = useState("");
  const [department, setDepartment] = useState("");
  const [estimatedUrgency, setEstimatedUrgency] = useState("");
  const [reasoning, setReasoning] = useState("");

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  const { data: allIssues } = useListIssues();

  const categorizeMutation = useCategorizeIssue({
    mutation: {
      onSuccess: (data: any) => {
        if (data.category) setCategory(data.category as IssueInputCategory);
        if (data.severity) setSeverity(data.severity as IssueInputSeverity);
        if (data.descriptionSuggestion)
          setDescription(data.descriptionSuggestion);
        if (data.tags) setTags(data.tags);
        if (data.confidence) setAiConfidence(data.confidence);
        if (data.priority) setPriority(data.priority);
        if (data.department) setDepartment(data.department);
        if (data.estimatedUrgency) setEstimatedUrgency(data.estimatedUrgency);
        if (data.reasoning) setReasoning(data.reasoning);
        if (data.error) {
          toast({
            title: "AI unavailable",
            description: data.error,
            variant: "destructive",
          });
        }
        setStep(2);
      },
      onError: () => {
        toast({
          title: "Analysis failed",
          description:
            "Could not auto-categorize. Please fill in details manually.",
          variant: "destructive",
        });
        setStep(2);
      },
    },
  });

  const checkDuplicateMutation = useCheckDuplicate({
    mutation: {
      onSuccess: (data: any) => {
        if (data.isDuplicate && data.confidence > 0.85 && data.matchedIssueId) {
          // Extremely high confidence duplicate -> Automatically convert to verification
          verifyIssueMutation.mutate({ issueId: data.matchedIssueId });
        } else if (
          data.isDuplicate &&
          data.confidence > 0.6 &&
          data.matchedIssueId
        ) {
          // Moderate confidence duplicate -> Ask user
          setDuplicateWarning(data);
        } else {
          submitIssue();
        }
      },
      onError: () => {
        submitIssue();
      },
    },
  });

  const createIssueMutation = useCreateIssue({
    mutation: {
      onSuccess: (data: any) => {
        toast({
          title: "Issue reported! 🎉",
          description:
            "Thank you for being a CommunityHero. +10 points earned!",
        });
        setLocation(`/issue/${data.id}`);
      },
      onError: () => {
        toast({
          title: "Submission failed",
          description: "There was a problem reporting this issue.",
          variant: "destructive",
        });
      },
    },
  });

  const verifyIssueMutation = useVerifyIssue({
    mutation: {
      onSuccess: (data: any) => {
        toast({
          title: "Issue verified! 🎉",
          description:
            "This issue was already reported. You just upvoted it and earned +5 points!",
        });
        // navigate to the matched issue
        if (duplicateWarning?.matchedIssueId) {
          setLocation(`/issue/${duplicateWarning.matchedIssueId}`);
        } else if (data.id) {
          setLocation(`/issue/${data.id}`);
        } else {
          setLocation("/");
        }
      },
      onError: () => {
        toast({
          title: "Verification failed",
          description: "There was a problem verifying this issue.",
          variant: "destructive",
        });
      },
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please choose an image under 5MB.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = () => {
    if (!imageBase64) return;
    categorizeMutation.mutate({ data: { imageBase64, description: "" } });
  };

  const handleSkipPhoto = () => {
    setStep(2);
  };

  const doReverseGeocode = async (lat: number, lon: number) => {
    setGeoLoading(true);
    try {
      const result = await reverseGeocode({ lat, lon });
      setAddress(result.address);
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(coords);
        doReverseGeocode(coords[0], coords[1]);
      },
      () => {
        toast({
          title: "Location access denied",
          description: "Please click a location on the map instead.",
          variant: "destructive",
        });
      },
    );
  };

  const submitIssue = () => {
    if (!category || !severity || !position) return;
    createIssueMutation.mutate({
      data: {
        title,
        description,
        category: category as IssueInputCategory,
        severity: severity as IssueInputSeverity,
        imageUrl: imageBase64 || getIssueImageUrl("", category) || "url",
        latitude: position[0],
        longitude: position[1],
        address:
          address || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`,
        aiTags: tags,
        aiConfidence,
      },
    });
  };

  const handleFinalSubmit = () => {
    if (!imageBase64 || !title.trim() || !description.trim() || !position) {
      toast({
        title: "Missing Information",
        description: "Please add a photo, description, and location.",
        variant: "destructive",
      });
      return;
    }

    // Calculate distance and sort if position is available
    let nearby = (allIssues || []).filter((i: any) => i.status !== "resolved");
    if (position) {
      const toRad = (val: number) => (val * Math.PI) / 180;
      const getDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
      ) => {
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      nearby.sort((a: any, b: any) => {
        const distA = getDistance(
          position[0],
          position[1],
          a.latitude,
          a.longitude,
        );
        const distB = getDistance(
          position[0],
          position[1],
          b.latitude,
          b.longitude,
        );
        return distA - distB;
      });
    }

    const nearbyIssues = nearby
      .slice(0, 10)
      .map((i: any) => ({ id: i.id, title: i.title, description: i.description }));

    checkDuplicateMutation.mutate({
      data: { title, description, nearbyIssues },
    });
  };

  const steps = ["Photo", "Details", "Location", "Submit"];

  return (
    <div className="container mx-auto p-4 max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Report an Issue</h1>
        <div className="flex items-center gap-1 mt-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  step === i + 1
                    ? "bg-primary text-primary-foreground"
                    : step > i + 1
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>1. Take a Photo</CardTitle>
              <CardDescription>
                A clear photo helps AI categorize the issue automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              {imageBase64 ? (
                <div className="relative rounded-lg overflow-hidden border aspect-video">
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageBase64("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors aspect-video"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium">Click to upload a photo</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={handleSkipPhoto} type="button">
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Photo
              </Button>
              <Button
                onClick={handleAnalyzePhoto}
                disabled={!imageBase64 || categorizeMutation.isPending}
              >
                {categorizeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze & Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>2. Issue Details</CardTitle>
              <CardDescription>
                {aiConfidence > 0
                  ? `AI analyzed your photo (${Math.round(aiConfidence * 100)}% confidence). Verify or adjust below.`
                  : "Fill in the details for this issue."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {reasoning && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
                  <h4 className="font-bold text-primary mb-1 flex items-center gap-1">
                    <Bot className="w-4 h-4" /> AI Triage Insights
                  </h4>
                  <p className="text-muted-foreground mb-2">{reasoning}</p>
                  <div className="flex gap-4 font-medium text-xs">
                    <span className="text-primary">Dept: {department}</span>
                    <span className="text-orange-500">
                      Urgency: {estimatedUrgency}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={category}
                  onValueChange={(val) =>
                    setCategory(val as IssueInputCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(IssueInputCategory).map((c) => (
                      <SelectItem key={c as string} value={c as string}>
                        {(c as string).replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select
                  value={severity}
                  onValueChange={(val) =>
                    setSeverity(val as IssueInputSeverity)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Low — Minor inconvenience
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium — Affects daily use
                    </SelectItem>
                    <SelectItem value="high">
                      High — Significant disruption
                    </SelectItem>
                    <SelectItem value="critical">
                      Critical — Safety hazard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what you see..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!category || !severity}
              >
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>3. Location</CardTitle>
              <CardDescription>
                Where is this issue located? Click on the map or use GPS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="secondary"
                onClick={handleGetLocation}
                className="w-full"
                disabled={geoLoading}
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Getting
                    location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" /> Use My Current Location
                  </>
                )}
              </Button>

              <div className="h-[300px] border rounded-lg overflow-hidden relative z-0">
                <MapContainer
                  center={position || [11.0168, 76.9558]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    position={position}
                    onPositionChange={(p) => {
                      setPosition(p);
                      doReverseGeocode(p[0], p[1]);
                    }}
                  />
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Click anywhere on the map to drop a pin
              </p>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    geoLoading
                      ? "Fetching address..."
                      : "Address will appear here after selecting location"
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!position}>
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>4. Final Review</CardTitle>
              <CardDescription>
                Give your report a clear title and submit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {duplicateWarning && (
                <Alert className="bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800 dark:text-orange-200">
                    Possible Duplicate (
                    {Math.round(duplicateWarning.confidence * 100)}% match)
                  </AlertTitle>
                  <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2">
                    <p className="mb-2">
                      {duplicateWarning.reasoning ||
                        "A similar issue may already exist nearby."}
                    </p>
                    <p className="font-semibold text-xs">
                      You can still submit — or go back and search the Feed
                      first.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole near Main St junction"
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue clearly..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium capitalize">
                    {category?.replace(/_/g, " ") || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Severity:</span>{" "}
                  <span className="font-medium capitalize">
                    {severity || "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Location:</span>{" "}
                  <span className="font-medium">{address || "—"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setDuplicateWarning(null);
                  setStep(3);
                }}
              >
                Back
              </Button>
              <Button
                onClick={
                  duplicateWarning
                    ? () => {
                        verifyIssueMutation.mutate({
                          issueId: duplicateWarning.matchedIssueId,
                        });
                      }
                    : handleFinalSubmit
                }
                disabled={
                  createIssueMutation.isPending ||
                  checkDuplicateMutation.isPending ||
                  verifyIssueMutation.isPending
                }
                className="bg-primary hover:bg-primary/90"
              >
                {createIssueMutation.isPending ||
                checkDuplicateMutation.isPending ||
                verifyIssueMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {duplicateWarning ? "Verify Existing Instead" : "Submit Report"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
