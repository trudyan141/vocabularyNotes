"use client";
import {ParentAiSettings} from "./parent-ai";
import {ArchiveTools} from "@/components/features/archive-tools";
import { Mail, UserRound } from "lucide-react";
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
  const { t, preferences: p, setPreferences, storageError } = useApp();
  return (
    <div className="reading-page page-flow parent-page">
      <Back />
      <h1>{t("Cài đặt", "Settings")}</h1>
      <p>
        {t(
          "Chọn cách hiển thị và âm thanh phù hợp với con.",
          "Choose the display and sound that suit your child.",
        )}
      </p>
      {storageError && (
        <Alert variant="destructive">
          <AlertTitle>
            {t("Chưa lưu được thiết lập", "Settings could not be saved")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "Lựa chọn vẫn dùng được lúc này. Bấm thử lưu lại nhé.",
              "Your choices still work for now. Try saving them again.",
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
      <ParentAiSettings/><ArchiveTools/>
      <section className="settings-author" aria-labelledby="settings-author-title">
        <h2 id="settings-author-title">{t("Về ứng dụng", "About the app")}</h2>
        <p><UserRound aria-hidden="true"/><span>{t("Tác giả", "Author")}: <strong>Ly Kien Trung</strong></span></p>
        <Button asChild variant="outline"><a href="mailto:trudyan141@gmail.com"><Mail aria-hidden="true"/>trudyan141@gmail.com</a></Button>
      </section>
      <Back href="/today" label={t("Về Hôm nay", "Back to Today")}/>
    </div>
  );
}
