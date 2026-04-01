"use client";

import * as React from "react";
import { getIconMap } from "@/lib/icon-map";
import { createClient } from "@/lib/supabase";
import { DEFAULT_TOKENS, type TokenState } from "@/lib/tokens";
import { Github, ExternalLink, Unlink } from "lucide-react";
import { Button } from "@/registry/new-york/ui/button";
import { Avatar, AvatarFallback } from "@/registry/new-york/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/registry/new-york/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york/ui/alert-dialog";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { NativeSelect } from "@/registry/new-york/ui/native-select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/registry/new-york/ui/sidebar";

export interface DesignSystem {
  id: string;
  slug: string;
  name: string;
  tokens: TokenState;
  icon_library: string;
  style_preset: string;
  default_mode: "light" | "dark" | null;
  github_repo: string | null;
  github_branch: string | null;
  github_token: string | null;
  github_installation_id: number | null;
  created_at: string;
  updated_at: string;
}

interface AppSidebarProps {
  designSystems: DesignSystem[];
  activeId: string | null;
  onSelect: (ds: DesignSystem) => void;
  onCreated: (ds: DesignSystem) => void;
  onDeleted: (id: string) => void;
  onRenamed: (id: string, name: string) => void;
  onGithubUpdated?: (ds: DesignSystem) => void;
  userName: string;
  userEmail: string;
  iconLibrary: string;
}

export function AppSidebar({
  designSystems,
  activeId,
  onSelect,
  onCreated,
  onDeleted,
  onRenamed,
  onGithubUpdated,
  userName,
  userEmail,
  iconLibrary,
}: AppSidebarProps) {
  const icons = getIconMap(iconLibrary);
  const supabase = createClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [cloneFrom, setCloneFrom] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DesignSystem | null>(null);
  const [renameTarget, setRenameTarget] = React.useState<DesignSystem | null>(null);
  const [renameName, setRenameName] = React.useState("");
  const [githubTarget, setGithubTarget] = React.useState<DesignSystem | null>(null);
  const [ghRepo, setGhRepo] = React.useState("");
  const [ghBranch, setGhBranch] = React.useState("main");
  const [ghToken, setGhToken] = React.useState("");
  const [ghSaving, setGhSaving] = React.useState(false);
  const [ghRepos, setGhRepos] = React.useState<{ full_name: string; default_branch: string }[]>([]);
  const [ghReposLoading, setGhReposLoading] = React.useState(false);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40) + "-" + Date.now().toString(36);
  }

  /** 기존 이름 목록에서 충돌 없는 복제 이름 생성 */
  function deduplicateName(base: string): string {
    const existing = new Set(designSystems.map((ds) => ds.name));
    if (!existing.has(base)) return base;
    for (let i = 2; i <= 100; i++) {
      const candidate = `${base} ${i}`;
      if (!existing.has(candidate)) return candidate;
    }
    return `${base} ${Date.now().toString(36)}`;
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const source = cloneFrom
      ? designSystems.find((ds) => ds.id === cloneFrom)
      : null;

    const slug = generateSlug(newName);
    const finalName = deduplicateName(newName.trim());

    const { data, error } = await supabase
      .from("design_systems")
      .insert({
        user_id: user.id,
        name: finalName,
        slug,
        tokens: source?.tokens ?? DEFAULT_TOKENS,
        icon_library: source?.icon_library ?? "lucide",
        style_preset: source?.style_preset ?? "vega",
        default_mode: source?.default_mode ?? null,
      })
      .select()
      .single();

    if (error) {
      alert(`Creation failed: ${error.message}`);
    } else if (data) {
      onCreated(data as DesignSystem);
      setCreateOpen(false);
      setNewName("");
      setCloneFrom(null);
    }
    setCreating(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("design_systems")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      onDeleted(deleteTarget.id);
    }
    setDeleteTarget(null);
  }

  async function handleRename() {
    if (!renameTarget || !renameName.trim()) return;
    const { error } = await supabase
      .from("design_systems")
      .update({ name: renameName.trim() })
      .eq("id", renameTarget.id);

    if (!error) {
      onRenamed(renameTarget.id, renameName.trim());
    }
    setRenameTarget(null);
    setRenameName("");
  }

  async function handleGithubSave() {
    if (!githubTarget) return;
    setGhSaving(true);
    const updateData: Record<string, unknown> = {
      github_repo: ghRepo.trim() || null,
      github_branch: ghBranch.trim() || "main",
      // 기존 토큰이 있고 새 토큰을 입력 안 했으면 기존 유지
      github_token: ghToken.trim() || githubTarget.github_token || null,
    };
    const { error } = await supabase
      .from("design_systems")
      .update(updateData)
      .eq("id", githubTarget.id);

    if (error) {
      alert(`GitHub 연결 실패: ${error.message}`);
    } else {
      // Update local state
      const updated = {
        ...githubTarget,
        github_repo: updateData.github_repo as string | null,
        github_branch: updateData.github_branch as string | null,
        github_token: updateData.github_token as string | null,
      };
      onGithubUpdated?.(updated);
      setGithubTarget(null);
    }
    setGhSaving(false);
  }

  async function handleGithubDisconnect(ds: DesignSystem) {
    const { error } = await supabase
      .from("design_systems")
      .update({ github_repo: null, github_branch: "main", github_token: null })
      .eq("id", ds.id);

    if (!error) {
      onGithubUpdated?.({ ...ds, github_repo: null, github_branch: "main", github_token: null });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function getBrandColor(ds: DesignSystem): string {
    try {
      return ds.tokens?.primitives?.brand?.["600"] || "oklch(0.48 0.22 250)";
    } catch {
      return "oklch(0.48 0.22 250)";
    }
  }

  return (
    <>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <div className="cursor-default">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="logo" className="size-8 rounded-[var(--ds-element-radius)] object-cover shrink-0" />
                    <span className="font-semibold text-sm truncate">{":designSystem:"}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>My Design Systems</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {designSystems.map((ds) => (
                    <SidebarMenuItem key={ds.id}>
                      <SidebarMenuButton
                        size="lg"
                        onClick={() => onSelect(ds)}
                        isActive={activeId === ds.id}
                        tooltip={ds.name}
                        className="group-data-[collapsible=icon]:hidden"
                      >
                        <div
                          className="size-3 rounded-full shrink-0 ring-1 ring-sidebar-border"
                          style={{ backgroundColor: getBrandColor(ds) }}
                        />
                        <div className="flex flex-col gap-0 leading-none min-w-0">
                          <span className="text-sm truncate">{ds.name}</span>
                          <span className="text-[10px] text-sidebar-foreground/50 truncate flex items-center gap-1">
                            {ds.slug}
                            {ds.github_repo && <Github className="w-2.5 h-2.5 shrink-0" />}
                          </span>
                        </div>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover/menu-item:opacity-100"
                          >
                            <icons.moreHorizontal className="w-3.5 h-3.5" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem onClick={() => { setRenameTarget(ds); setRenameName(ds.name); }}>
                            <icons.edit className="w-3.5 h-3.5 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setCloneFrom(ds.id); setNewName(deduplicateName(`${ds.name} (copy)`)); setCreateOpen(true); }}>
                            <icons.copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          {ds.github_repo ? (
                            <DropdownMenuItem onClick={() => handleGithubDisconnect(ds)}>
                              <Unlink className="w-3.5 h-3.5 mr-2" /> Disconnect
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={async () => {
                              setGithubTarget(ds);
                              setGhRepo(ds.github_repo || "");
                              setGhBranch(ds.github_branch || "main");
                              setGhToken(ds.github_token || "");
                              setGhRepos([]);
                              // App이 설치되어 있으면 레포 목록 로드
                              if (ds.github_installation_id) {
                                setGhReposLoading(true);
                                try {
                                  const res = await fetch(`/api/github-app/repos?dsId=${ds.id}`);
                                  const data = await res.json();
                                  if (data.repos) setGhRepos(data.repos);
                                } catch {}
                                setGhReposLoading(false);
                              }
                            }}>
                              <Github className="w-3.5 h-3.5 mr-2" /> Connect Project
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(ds)}
                            disabled={designSystems.length <= 1}
                          >
                            <icons.trash className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}

                  {/* 새로 만들기 */}
                  <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuButton
                      onClick={() => { setCloneFrom(null); setNewName(""); setCreateOpen(true); }}
                      tooltip="New Design System"
                    >
                      <icons.plus className="w-4 h-4" />
                      <span>New</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" tooltip={userName}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-sm font-medium truncate">{userName}</span>
                        <span className="text-xs text-sidebar-foreground/50 truncate">{userEmail}</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="end" className="w-48">
                    <DropdownMenuItem onClick={handleLogout}>
                      <icons.logout className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cloneFrom ? "Duplicate Design System" : "New Design System"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-[var(--ds-internal-gap)]">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My SaaS"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this design system?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot; will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>New name</Label>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Connect Dialog */}
      <Dialog open={!!githubTarget} onOpenChange={() => setGithubTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[var(--ds-element-radius)] bg-foreground flex items-center justify-center shrink-0">
                <Github className="w-4 h-4 text-background" />
              </div>
              Auto-sync to Project
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Design changes will be automatically proposed to your project on every save.
          </p>

          <div className="space-y-[var(--ds-internal-gap)]">
            {/* Case 1: App 설치됨 → 레포 선택 드롭다운 */}
            {githubTarget?.github_installation_id ? (
              <>
                <div className="flex items-center gap-2 p-3 rounded-[var(--ds-card-radius)] bg-muted/50">
                  <icons.check className="w-4 h-4 text-[color:var(--success-foreground)] shrink-0" />
                  <p className="text-xs text-muted-foreground">GitHub Connected</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Select Project</Label>
                  {ghReposLoading ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <icons.loader className="w-4 h-4 animate-spin" /> Loading projects...
                    </div>
                  ) : ghRepos.length > 0 ? (
                    <NativeSelect
                      value={ghRepo}
                      onChange={(e) => {
                        const selected = ghRepos.find(r => r.full_name === e.target.value);
                        setGhRepo(e.target.value);
                        if (selected) setGhBranch(selected.default_branch);
                      }}
                    >
                      <option value="">Select a project</option>
                      {ghRepos.map((r) => (
                        <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                      ))}
                    </NativeSelect>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={ghRepo}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/^https?:\/\/github\.com\//, "")
                            .replace(/\.git$/, "")
                            .replace(/\/$/, "");
                          setGhRepo(val);
                        }}
                        placeholder="Paste GitHub URL"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the URL from your GitHub project page
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Case 2: App 미설치 → 설치 버튼 */
              <>
                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      const appSlug = "designsync-app";
                      const state = githubTarget?.id || "";
                      window.location.href = `https://github.com/apps/${appSlug}/installations/new?state=${state}`;
                    }}
                  >
                    <Github className="w-4 h-4" />
                    Connect from GitHub
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Select a project on GitHub and you will be redirected back
                  </p>
                </div>

                {/* PAT fallback (접혀있음) */}
                <details className="group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Manual setup (advanced)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <Input
                      value={ghRepo}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/^https?:\/\/github\.com\//, "")
                          .replace(/\.git$/, "")
                          .replace(/\/$/, "");
                        setGhRepo(val);
                      }}
                      placeholder="Paste GitHub URL"
                    />
                    <Input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="GitHub 토큰 (ghp_...)"
                    />
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=DesignSync"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      Create token <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </details>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGithubTarget(null)}>Cancel</Button>
            <Button
              onClick={handleGithubSave}
              disabled={ghSaving || !ghRepo.trim() || (!githubTarget?.github_installation_id && !ghToken.trim() && !githubTarget?.github_token)}
            >
              {ghSaving ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
