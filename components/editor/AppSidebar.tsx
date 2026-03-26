"use client";

import * as React from "react";
import { Plus, LogOut, MoreHorizontal, Copy, Trash2, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { DEFAULT_TOKENS, type TokenState } from "@/lib/tokens";
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
  userName: string;
  userEmail: string;
}

export function AppSidebar({
  designSystems,
  activeId,
  onSelect,
  onCreated,
  onDeleted,
  onRenamed,
  userName,
  userEmail,
}: AppSidebarProps) {
  const supabase = createClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [cloneFrom, setCloneFrom] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<DesignSystem | null>(null);
  const [renameTarget, setRenameTarget] = React.useState<DesignSystem | null>(null);
  const [renameName, setRenameName] = React.useState("");

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
                          <span className="text-[10px] text-sidebar-foreground/50 truncate">{ds.slug}</span>
                        </div>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover/menu-item:opacity-100"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                            <span className="sr-only">메뉴</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem onClick={() => { setRenameTarget(ds); setRenameName(ds.name); }}>
                            <Edit className="w-3.5 h-3.5 mr-2" /> 이름 변경
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setCloneFrom(ds.id); setNewName(`${ds.name} (사본)`); setCreateOpen(true); }}>
                            <Copy className="w-3.5 h-3.5 mr-2" /> 복제
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(ds)}
                            disabled={designSystems.length <= 1}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> 삭제
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
                      <Plus className="w-4 h-4" />
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
                      <LogOut className="w-3.5 h-3.5 mr-2" /> 로그아웃
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
    </>
  );
}
