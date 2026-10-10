"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "./provider";
export function ParentGate({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { t } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Nhờ bố mẹ giúp nhé", "Ask a parent to help")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Khu này dành cho bố mẹ chuẩn bị bài và cài đặt. Mời bố mẹ tiếp tục cùng con.",
              "This area is for parents to prepare lessons and change settings. Please continue together.",
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("Quay lại", "Go back")}</Button>
          </DialogClose>
          <Button
            onClick={() => {
              setOpen(false);
              router.push(href);
            }}
          >
            <ShieldCheck data-icon="inline-start" />
            {t("Bố mẹ tiếp tục", "Parent continues")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
