import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ImagePlus, Send, Bug, Lightbulb, Star, X } from "lucide-react";
import type { UploadResult } from "@uppy/core";

const feedbackSchema = z.object({
  type: z.enum(["bug", "suggestion", "feature_request"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

interface PhotoUpload {
  id: string;
  url: string;
  name: string;
}

export default function FeedbackPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "bug",
      title: "",
      description: "",
      email: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackData & { photos: string[] }) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Sent",
        description: "Thank you for your feedback! We'll review it shortly.",
      });
      form.reset();
      setPhotos([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send feedback",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (data: FeedbackData) => {
    setIsSubmitting(true);
    const photoUrls = photos.map(p => p.url);
    submitMutation.mutate({ ...data, photos: photoUrls });
  };

  const handlePhotoUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newPhotos: PhotoUpload[] = result.successful.map((file: any) => ({
        id: file.id || Math.random().toString(),
        url: file.uploadURL || "",
        name: file.name || "Unknown",
      }));
      
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 10)); // Max 10 photos
      
      toast({
        title: "Photos Uploaded",
        description: `${result.successful?.length || 0} photo(s) uploaded successfully`,
      });
    }
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to get upload URL");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return <Bug className="h-4 w-4" />;
      case "suggestion": return <Lightbulb className="h-4 w-4" />;
      case "feature_request": return <Star className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug": return "destructive";
      case "suggestion": return "secondary";
      case "feature_request": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback & Bug Reports</h1>
        <p className="text-gray-600 mt-2">
          Help us improve QRMenu by reporting bugs, suggesting features, or sharing your ideas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Your feedback helps us make QRMenu better. You can attach up to 10 screenshots or photos.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Type Selection */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4" />
                            Bug Report - Something is broken or not working
                          </div>
                        </SelectItem>
                        <SelectItem value="suggestion">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Suggestion - Ideas to improve existing features
                          </div>
                        </SelectItem>
                        <SelectItem value="feature_request">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Feature Request - New features you'd like to see
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief summary of your feedback"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed information about your feedback..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (Optional) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com - for follow-up contact"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Screenshots / Photos (Optional)</FormLabel>
                  <p className="text-sm text-gray-600">
                    Upload up to 10 photos to help us understand the issue better.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <Badge variant="secondary" className="pr-8">
                        {photo.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-1"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    </div>
                  ))}
                </div>

                {photos.length < 10 && (
                  <ObjectUploader
                    maxNumberOfFiles={10 - photos.length}
                    maxFileSize={10485760} // 10MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handlePhotoUploadComplete}
                    buttonClassName="w-full"
                  >
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      <span>Add Photos ({photos.length}/10)</span>
                    </div>
                  </ObjectUploader>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setPhotos([]);
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Bug Reports:</strong> Include steps to reproduce the issue, expected vs actual behavior, and screenshots if possible.</p>
            <p><strong>Suggestions:</strong> Describe how the current feature could be improved and why.</p>
            <p><strong>Feature Requests:</strong> Explain what new functionality you'd like and how it would benefit you.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}