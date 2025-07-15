import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, Save, Image } from "lucide-react";

interface PageContent {
  id: string;
  page_slug: string;
  title: string;
  content: any;
  meta_description: string;
  featured_image_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ContentSection {
  type: string;
  title: string;
  subtitle?: string;
  content: string;
  image_url?: string;
}

interface PageEditorProps {
  pageSlug: string;
  pageName: string;
}

const PageEditor = ({ pageSlug, pageName }: PageEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pageContent, isLoading } = useQuery({
    queryKey: ["pageContent", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .maybeSingle();

      if (error) throw error;
      return data as PageContent | null;
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (updatedData: Partial<PageContent>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      if (pageContent) {
        const { data, error } = await supabase
          .from("page_content")
          .update(updatedData)
          .eq("id", pageContent.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("page_content")
          .insert({
            page_slug: pageSlug,
            title: updatedData.title || pageName,
            content: updatedData.content || { sections: [] },
            meta_description: updatedData.meta_description || "",
            featured_image_url: updatedData.featured_image_url || "",
            created_by: user.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageContent", pageSlug] });
      toast({ title: "Success", description: "Page content updated successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (pageContent) {
      setPageTitle(pageContent.title);
      setMetaDescription(pageContent.meta_description || "");
      setFeaturedImage(pageContent.featured_image_url || "");
      setSections(pageContent.content?.sections || []);
    } else {
      setSections([{ type: "content", title: pageName, content: "" }]);
    }
  }, [pageContent, pageName]);

  const handleSave = () => {
    updatePageMutation.mutate({
      title: pageTitle,
      content: { sections },
      meta_description: metaDescription,
      featured_image_url: featuredImage,
    });
  };

  const addSection = () => {
    setSections([...sections, { type: "content", title: "", content: "" }]);
  };

  const updateSection = (index: number, field: keyof ContentSection, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{pageName} Content</CardTitle>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Page
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={updatePageMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updatePageMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pageTitle">Page Title</Label>
                <Input
                  id="pageTitle"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Content Sections</h3>
                <Button onClick={addSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sections.map((section, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Section {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(index, "title", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Section Subtitle (optional)</Label>
                        <Input
                          value={section.subtitle || ""}
                          onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Image URL (optional)</Label>
                      <Input
                        value={section.image_url || ""}
                        onChange={(e) => updateSection(index, "image_url", e.target.value)}
                        placeholder="https://example.com/section-image.jpg"
                      />
                    </div>

                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateSection(index, "content", e.target.value)}
                        rows={6}
                        placeholder="Enter the content for this section..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{pageTitle}</h3>
              {metaDescription && (
                <p className="text-muted-foreground">{metaDescription}</p>
              )}
            </div>

            {featuredImage && (
              <div>
                <img
                  src={featuredImage}
                  alt={pageTitle}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {sections.map((section, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">{section.title}</h4>
                {section.subtitle && (
                  <p className="text-muted-foreground">{section.subtitle}</p>
                )}
                {section.image_url && (
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="w-full h-32 object-cover rounded my-2"
                  />
                )}
                <p className="whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageEditor;