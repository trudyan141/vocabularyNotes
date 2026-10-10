"use client";
import {ParentAiSettings} from "./parent-ai";
import {ArchiveTools} from "@/components/features/archive-tools";
import Link from "next/link";
import {useState} from "react";
import { LibraryTools } from "./library-tools";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp, useHydrated } from "@/components/app/provider";
import { Back } from "@/components/app/shared";
export function Settings() {
  const hydrated = useHydrated();
  const { t, preferences: p, setPreferences, storageError, demo,selectLocalLibrary,repository } = useApp();
  const [switching,setSwitching]=useState(false);const [scopeStatus,setScopeStatus]=useState("");
  return (
    <div className="reading-page page-flow parent-page">
      <Back />
      <h1>{t("Tùy chọn của phụ huynh", "Parent options")}</h1>
      <p>
        {t(
          "Thiết lập nhỏ lưu trên thiết bị. Thư viện và bài mẫu được lưu riêng trong trình duyệt, vẫn còn sau khi tải lại.",
          "Small settings stay on this device. Your library and sample lessons are saved separately in this browser and survive reloads.",
        )}
      </p>
      {storageError && (
        <Alert variant="destructive">
          <AlertTitle>
            {t("Chưa lưu được thiết lập", "Settings could not be saved")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Thiết lập vẫn dùng trong phiên này. Cho phép lưu trữ trình duyệt rồi thử lại.",
              "Settings still apply for this session. Allow browser storage and try again.",
            )}
            <Button variant="outline" onClick={() => setPreferences({})}>
              {t("Thử lưu lại", "Try saving again")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field>
          <FieldLabel>
            {t("Ngôn ngữ giao diện", "Interface language")}
          </FieldLabel>
          <ToggleGroup
            disabled={!hydrated}
            type="single"
            value={p.locale}
            onValueChange={(value) => {
              if (value === "vi" || value === "en")
                setPreferences({ locale: value });
            }}
            aria-label={t("Ngôn ngữ giao diện", "Interface language")}
          >
            <ToggleGroupItem value="vi">Tiếng Việt</ToggleGroupItem>
            <ToggleGroupItem value="en">English</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel>{t("Trình độ", "Level")}</FieldLabel>
          <ToggleGroup
            disabled={!hydrated}
            type="single"
            value={p.level}
            onValueChange={(value) => {
              if (value === "Beginner" || value === "Intermediate")
                setPreferences({ level: value });
            }}
            aria-label={t("Trình độ", "Level")}
          >
            <ToggleGroupItem value="Beginner">Beginner</ToggleGroupItem>
            <ToggleGroupItem value="Intermediate">Intermediate</ToggleGroupItem>
          </ToggleGroup>
          <FieldDescription>
            {t(
              "Lựa chọn này dành cho các buổi học sau; bài mẫu chưa thay đổi theo trình độ.",
              "This choice is for future sessions; sample lessons do not adapt to level yet.",
            )}
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="child-mode">
              {t("Giao diện cho trẻ", "Child-friendly interface")}
            </FieldLabel>
            <FieldDescription>
              {t(
                "Chữ lớn và lời hướng dẫn ngắn.",
                "Larger text and short instructions.",
              )}
            </FieldDescription>
          </FieldContent>
          <Switch
            disabled={!hydrated}
            id="child-mode"
            checked={p.childFriendly}
            onCheckedChange={(v) => setPreferences({ childFriendly: v })}
          />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="motion-setting">
              {t("Giảm chuyển động", "Reduce motion")}
            </FieldLabel>
            <FieldDescription>
              {t(
                "Luôn tôn trọng thiết lập giảm chuyển động của máy.",
                "Your device’s reduced motion setting is always respected.",
              )}
            </FieldDescription>
          </FieldContent>
          <Switch
            disabled={!hydrated}
            id="motion-setting"
            checked={p.reduceMotion}
            onCheckedChange={(v) => setPreferences({ reduceMotion: v })}
          />
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="sound-setting">
              {t("Âm thanh khi bấm nghe", "Sound when you tap listen")}
            </FieldLabel>
            <FieldDescription>
              {t(
                "Không tự phát âm thanh. Dùng giọng tiếng Anh sẵn có trên máy.",
                "No autoplay. Uses an English voice installed on your device.",
              )}
            </FieldDescription>
          </FieldContent>
          <Switch
            disabled={!hydrated}
            id="sound-setting"
            checked={p.sound}
            onCheckedChange={(v) => setPreferences({ sound: v })}
          />
        </Field>
      </FieldGroup>
      <section>
        <h2>{t("Bài học và tài khoản", "Lessons and account")}</h2>
        <Button asChild variant="outline"><Link href="/account">{t("Tài khoản Google của phụ huynh","Parent Google account")}</Link></Button>
        <p>
          {t(
            "Bài học được lưu trên trình duyệt này. Google và đồng bộ cloud dùng khi đã cấu hình Supabase; AI dùng key riêng ở mục bên dưới.",
            "Lessons are stored in this browser. Google and cloud sync work when Supabase is configured; personal AI settings are below.",
          )}
        </p>
        {demo && (
          <Button asChild variant="outline">
            <Link prefetch={false} href="/capture">
              {t("Thử duyệt bài mẫu", "Try sample review")}
            </Link>
          </Button>
        )}
      </section>
      <section className="page-flow"><h2>{t("Thư viện đang mở","Current local library")}</h2><p>{demo?t("Đang dùng bài mẫu để thử. Bài của con thật được lưu riêng, chuyển qua lại không xóa hay gộp dữ liệu.","Using sample lessons. Your own library is stored separately; switching does not delete or merge content."):t("Đang dùng thư viện của con trên máy này. Bài mẫu là một thư viện riêng.","Using your own local library. Sample lessons are stored separately.")}</p><Button variant="outline" disabled={switching||!repository} onClick={async()=>{setSwitching(true);try{await selectLocalLibrary(!demo);setScopeStatus(t("Đã chuyển thư viện; dữ liệu thư viện trước vẫn còn.","Library switched; previous content is preserved."));}catch{setScopeStatus(t("Chưa chuyển được. Thử lại; dữ liệu vẫn còn.","Could not switch. Retry; your content is preserved."));}finally{setSwitching(false);}}}>{demo?t("Dùng thư viện riêng của con","Use my child's library"):t("Mở bài mẫu để thử","Open sample lessons")}</Button><p role="status">{scopeStatus}</p></section>
      <ParentAiSettings/><LibraryTools/><ArchiveTools/>
      <Back href="/today" label={t("Về Hôm nay", "Back to Today")}/>
    </div>
  );
}
