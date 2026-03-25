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
import { Separator } from "@/registry/new-york/ui/separator";

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

    const sourceTokens = cloneFrom
      ? designSystems.find((ds) => ds.id === cloneFrom)?.tokens ?? DEFAULT_TOKENS
      : DEFAULT_TOKENS;

    const slug = generateSlug(newName);

    const { data, error } = await supabase
      .from("design_systems")
      .insert({
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

  // Brand color swatch for each DS
  function getBrandColor(ds: DesignSystem): string {
    try {
      return ds.tokens?.primitives?.brand?.["600"] || "oklch(0.48 0.22 250)";
    } catch {
      return "oklch(0.48 0.22 250)";
    }
  }

  return (
    <>
      <div className="w-14 flex-shrink-0 border-r border-border bg-sidebar flex flex-col items-center py-3 gap-2">
        {/* Logo */}
        <div className="w-9 h-9 rounded-[var(--ds-element-radius)] bg-primary flex items-center justify-center mb-2">
          <span className="text-primary-foreground text-xs font-bold">DS</span>
        </div>

        <Separator className="w-8 bg-sidebar-border" />

        {/* DS List */}
        <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto py-1">
          {designSystems.map((ds) => (
            <div key={ds.id} className="relative group">
              <button
                onClick={() => onSelect(ds)}
                title={ds.name}
                className={`w-9 h-9 rounded-[var(--ds-element-radius)] border-2 transition-all flex items-center justify-center text-[10px] font-bold ${
                  activeId === ds.id
                    ? "border-foreground shadow-md scale-110"
                    : "border-transparent hover:border-border hover:scale-105"
                }`}
                style={{ backgroundColor: getBrandColor(ds) }}
              >
                <span className="text-white mix-blend-difference">
                  {ds.name.charAt(0).toUpperCase()}
                </span>
              </button>

              {/* Context menu on hover */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-card border border-border items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
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
            </div>
          ))}
        </div>

        <Separator className="w-8 bg-sidebar-border" />

        {/* Add new */}
        <button
          onClick={() => { setCloneFrom(null); setNewName(""); setCreateOpen(true); }}
          className="w-9 h-9 rounded-[var(--ds-element-radius)] border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          title="새 디자인 시스템"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-1" title={userEmail}>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium">{userName}</p>
              <p className="text-[10px] text-muted-foreground">{userEmail}</p>
            </div>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-3.5 h-3.5 mr-2" /> 로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cloneFrom ? "디자인 시스템 복제" : "새 디자인 시스템"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
