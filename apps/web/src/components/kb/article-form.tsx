/**
 * Article Form Component
 *
 * Form for creating and editing KB articles
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface ArticleFormInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category: string;
    tags?: string[];
    isPublished?: boolean;
}

interface ArticleFormProps {
    onSubmit: (data: ArticleFormInput) => void;
    onCancel: () => void;
    initialData?: Partial<ArticleFormInput>;
}

export function ArticleForm({ onSubmit, onCancel, initialData }: ArticleFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<ArticleFormInput>({
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            content: initialData?.content || "",
            excerpt: initialData?.excerpt || "",
            category: initialData?.category || "general",
            isPublished: initialData?.isPublished || false,
            tags: initialData?.tags || [],
        },
    });

    const title = watch("title");
    const isPublished = watch("isPublished");
    const category = watch("category");

    // Auto-generate slug from title if not manually edited
    useEffect(() => {
        if (!initialData?.slug) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            setValue("slug", slug);
        }
    }, [title, setValue, initialData]);

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Article" : "Create New Article"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register("title", { required: "Title is required" })}
                            placeholder="How to reset password"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                            id="slug"
                            {...register("slug", { required: "Slug is required" })}
                            placeholder="how-to-reset-password"
                        />
                        {errors.slug && (
                            <p className="text-sm text-destructive">{errors.slug.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={category}
                            onValueChange={(value) => setValue("category", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="account">Account</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            {...register("excerpt")}
                            placeholder="Brief summary of the article"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content * (Markdown)</Label>
                        <Textarea
                            id="content"
                            {...register("content", { required: "Content is required" })}
                            placeholder="# Article content..."
                            rows={10}
                            className="font-mono text-sm"
                        />
                        {errors.content && (
                            <p className="text-sm text-destructive">{errors.content.message}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isPublished"
                            checked={isPublished}
                            onCheckedChange={(checked: boolean) => setValue("isPublished", checked)}
                        />
                        <Label htmlFor="isPublished">Publish immediately</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {initialData ? "Update Article" : "Create Article"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
