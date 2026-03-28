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

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const sourceTokens = cloneFrom
      ? designSystems.find((ds) => ds.id === cloneFrom)?.tokens ?? DEFAULT_TOKENS
      : DEFAULT_TOKENS;

    const slug = generateSlug(newName);

    const { data, error } = await supabase
      .from("design_systems")
      .insert({
        user_id: user.id,
        name: newName.trim(),
        slug,
        tokens: sourceTokens,
        icon_library: "lucide",
        style_preset: "vega",
      })
      .select()
      .single();

    if (error) {
      alert(`생성 실패: ${error.message}`);
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
                    <div className="flex aspect-square size-8 items-center justify-center rounded-[var(--ds-element-radius)] bg-primary text-primary-foreground">
                      <span className="text-xs font-bold">DS</span>
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold text-sm">DesignSync</span>
                      <span className="text-xs text-sidebar-foreground/50">디자인 시스템</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>내 디자인 시스템</SidebarGroupLabel>
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
                            <span className="sr-only">메뉴</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem onClick={() => { setRenameTarget(ds); setRenameName(ds.name); }}>
                            <icons.edit className="w-3.5 h-3.5 mr-2" /> 이름 변경
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setCloneFrom(ds.id); setNewName(`${ds.name} (사본)`); setCreateOpen(true); }}>
                            <icons.copy className="w-3.5 h-3.5 mr-2" /> 복제
                          </DropdownMenuItem>
                          {ds.github_repo ? (
                            <DropdownMenuItem onClick={() => handleGithubDisconnect(ds)}>
                              <Unlink className="w-3.5 h-3.5 mr-2" /> 프로젝트 연결 해제
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
                              <Github className="w-3.5 h-3.5 mr-2" /> 내 프로젝트에 연결
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(ds)}
                            disabled={designSystems.length <= 1}
                          >
                            <icons.trash className="w-3.5 h-3.5 mr-2" /> 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))}

                  {/* 새로 만들기 */}
                  <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuButton
                      onClick={() => { setCloneFrom(null); setNewName(""); setCreateOpen(true); }}
                      tooltip="새 디자인 시스템"
                    >
                      <icons.plus className="w-4 h-4" />
                      <span>새로 만들기</span>
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
                      <icons.logout className="w-3.5 h-3.5 mr-2" /> 로그아웃
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
            <DialogTitle>{cloneFrom ? "디자인 시스템 복제" : "새 디자인 시스템"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-[var(--ds-internal-gap)]">
            <div className="space-y-1.5">
              <Label>이름</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="내 SaaS"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>취소</Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? "생성 중..." : "만들기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot;을(를) 삭제하면 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이름 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>새 이름</Label>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>취소</Button>
            <Button onClick={handleRename} disabled={!renameName.trim()}>저장</Button>
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
              내 프로젝트에 자동 반영
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            저장할 때마다 프로젝트에 디자인 변경사항이 자동 제안됩니다.
          </p>

          <div className="space-y-[var(--ds-internal-gap)]">
            {/* Case 1: App 설치됨 → 레포 선택 드롭다운 */}
            {githubTarget?.github_installation_id ? (
              <>
                <div className="flex items-center gap-2 p-3 rounded-[var(--ds-card-radius)] bg-muted/50">
                  <icons.check className="w-4 h-4 text-[var(--success-500)] shrink-0" />
                  <p className="text-xs text-muted-foreground">GitHub 연결됨</p>
                </div>
                <div className="space-y-1.5">
                  <Label>프로젝트 선택</Label>
                  {ghReposLoading ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                      <icons.loader className="w-4 h-4 animate-spin" /> 프로젝트 목록 불러오는 중...
                    </div>
                  ) : ghRepos.length > 0 ? (
                    <select
                      className="w-full h-[var(--ds-input-h)] rounded-[var(--ds-input-radius)] border border-input bg-background px-3 text-sm"
                      value={ghRepo}
                      onChange={(e) => {
                        const selected = ghRepos.find(r => r.full_name === e.target.value);
                        setGhRepo(e.target.value);
                        if (selected) setGhBranch(selected.default_branch);
                      }}
                    >
                      <option value="">프로젝트를 선택하세요</option>
                      {ghRepos.map((r) => (
                        <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                      ))}
                    </select>
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
                        placeholder="GitHub 주소를 붙여넣기"
                      />
                      <p className="text-xs text-muted-foreground">
                        GitHub 프로젝트 페이지의 URL을 그대로 붙여넣으세요
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
                      const appSlug = "designsync";
                      const state = githubTarget?.id || "";
                      window.location.href = `https://github.com/apps/${appSlug}/installations/new?state=${state}`;
                    }}
                  >
                    <Github className="w-4 h-4" />
                    GitHub에서 프로젝트 연결
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    GitHub에서 연결할 프로젝트를 선택하면 자동으로 돌아옵니다
                  </p>
                </div>

                {/* PAT fallback (접혀있음) */}
                <details className="group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    직접 연결하기 (개발자용)
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
                      placeholder="GitHub 주소 붙여넣기"
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
                      토큰 만들기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </details>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGithubTarget(null)}>취소</Button>
            <Button
              onClick={handleGithubSave}
              disabled={ghSaving || !ghRepo.trim() || (!githubTarget?.github_installation_id && !ghToken.trim() && !githubTarget?.github_token)}
            >
              {ghSaving ? "연결 중..." : "연결하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
