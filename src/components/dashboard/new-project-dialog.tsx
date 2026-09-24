"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input, Label } from "~/components/ui/core";
import { createProject, indexProject } from "~/server/actions/projects";

type FormInput = { name: string; githubUrl: string; githubToken?: string };

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormInput>();

  async function onSubmit(data: FormInput) {
    try {
      const project = await createProject({
        name: data.name,
        githubUrl: data.githubUrl,
        githubToken: data.githubToken || undefined,
      });
      onOpenChange(false);
      reset();
      router.push(`/dashboard/${project.id}`);
      router.refresh(); // pulls the new project into the sidebar list

      // Fire and move on — the project page polls status and shows live progress.
      void indexProject({
        projectId: project.id,
        githubUrl: data.githubUrl,
        githubToken: data.githubToken || undefined,
      }).catch(() => {
        toast.error("Indexing hit a snag — check the project page for details");
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create the project");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Index a repository</DialogTitle>
          <DialogDescription>Paste a GitHub URL. Public repos work out of the box.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div>
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="My API" autoComplete="off" {...register("name", { required: true })} />
          </div>
          <div>
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/owner/repo"
              autoComplete="off"
              {...register("githubUrl", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="githubToken">
              Access token <span className="font-normal text-muted/60">— optional, for private repos</span>
            </Label>
            <Input id="githubToken" type="password" placeholder="ghp_…" autoComplete="off" {...register("githubToken")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Start indexing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
