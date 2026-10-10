"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, RotateCw, Upload, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/components/app/provider";
import { Back, EmptyState } from "@/components/app/shared";
import {
  CaptureRepository,
  type CaptureDraft,
  type CaptureMetadata,
} from "@/data/local/capture";
import { RepositoryError } from "@/data/local/repository";
import {
  fullTransform,
  ImageError,
  jpeg,
  normalizeImage,
  transformImage,
  type PreparedImage,
  type Transform,
} from "@/lib/capture/image";
function useCaptureRepository() {
  const { repository } = useApp();
  return useMemo(
    () => (repository ? new CaptureRepository(repository) : null),
    [repository],
  );
}
function Failure({ message }: { message: string }) {
  const { t } = useApp();
  return (
    <Alert variant="destructive">
      <AlertTitle>{t("Chưa hoàn tất", "Not completed")}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
function useFailureText() {
  const { t } = useApp();
  return useCallback(
    (error: unknown) => {
      if (error instanceof ImageError) {
        if (error.code === "heic")
          return t(
            "Ảnh HEIC chưa được hỗ trợ. Hãy xuất thành JPEG hoặc chụp ảnh mới.",
            "HEIC is not supported. Export as JPEG or take another photo.",
          );
        if (error.code === "size")
          return t(
            "Ảnh phải nhỏ hơn hoặc bằng 10 MB. Hãy chọn ảnh nhẹ hơn.",
            "Choose an image of 10 MB or less.",
          );
        if (error.code === "pixels")
          return t(
            "Ảnh vượt 20 megapixel hoặc có kích thước không hợp lệ. Hãy giảm kích thước ảnh.",
            "The image exceeds 20 megapixels or has invalid dimensions. Resize it first.",
          );
        if (error.code === "crop")
          return t(
            "Vùng cắt chưa hợp lệ. Giữ trái nhỏ hơn phải, trên nhỏ hơn dưới, trong 0–100%.",
            "Keep left before right and top before bottom, within 0–100%.",
          );
        return t(
          "Không đọc được ảnh này. Chọn ảnh JPEG, PNG hoặc WebP hợp lệ.",
          "This image cannot be read. Choose a valid JPEG, PNG or WebP.",
        );
      }
      if (error instanceof RepositoryError && error.code === "conflict")
        return t(
          "Nháp đã thay đổi ở tab khác. Phần đang sửa vẫn còn; mở bản mới trong tab khác để đối chiếu.",
          "Another tab changed this draft. Your edits remain here; open the latest draft in another tab to compare.",
        );
      return t(
        "Chưa lưu được trên máy. Bộ nhớ có thể đã đầy; phần đang làm vẫn còn ở đây. Xóa nháp cũ rồi thử lưu lại trước khi rời trang.",
        "Could not save locally. Storage may be full; your work remains here. Delete an old draft and retry before leaving.",
      );
    },
    [t],
  );
}
function LocalPreview({ blob, label }: { blob: Blob; label: string }) {
  const { t } = useApp();
  const image = useRef<HTMLImageElement | null>(null);
  const link = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (image.current) image.current.src = url;
    if (link.current) link.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  // Only validated local blobs; the effect owns their URL lifecycle.
  return (
    <a ref={link} target="_blank" rel="noreferrer" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element -- validated local Blob; no remote optimizer */}
      <img ref={image} className="capture-image" alt={label} />
      <span>{t("Mở ảnh để phóng to", "Open image to zoom")}</span>
    </a>
  );
}
export function Capture() {
  const { t, demo } = useApp();
  const repo = useCaptureRepository();
  const router = useRouter();
  const failureText = useFailureText();
  const drafts = useLiveQuery(
    async () => (repo ? { repo, rows: await repo.list() } : null),
    [repo],
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraState, setCameraState] = useState<
    "closed" | "requesting" | "ready"
  >("closed");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [pendingImage, setPendingImage] = useState<PreparedImage | null>(null);
  const [openedAt] = useState(() => Date.now());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const generation = useRef(0);
  const mounted = useRef(false);
  const intakeLock = useRef(false);
  const pendingId = useRef(crypto.randomUUID());
  const stopCamera = useCallback(() => {
    generation.current++;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    if (mounted.current) setCameraState("closed");
  }, []);
  useEffect(() => {
    mounted.current = true;
    const hide = () => {
      if (document.hidden) stopCamera();
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", stopCamera);
    return () => {
      mounted.current = false;
      stopCamera();
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", stopCamera);
    };
  }, [stopCamera]);
  async function startCamera(nextFacing = facing) {
    stopCamera();
    setError("");
    setFacing(nextFacing);
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setError(
        t(
          "Trình duyệt này chưa dùng được camera. Chọn ảnh từ máy, hoặc mở app bằng HTTPS để thử lại.",
          "Camera is unavailable. Choose an image, or reopen the app over HTTPS.",
        ),
      );
      return;
    }
    const ticket = ++generation.current;
    setCameraState("requesting");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
      });
      if (
        !mounted.current ||
        ticket !== generation.current ||
        document.hidden
      ) {
        next.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = next;
      if (!video.current) {
        stopCamera();
        return;
      }
      video.current.srcObject = next;
      await video.current.play();
      if (ticket === generation.current && mounted.current)
        setCameraState("ready");
    } catch (cause) {
      if (ticket !== generation.current || !mounted.current) return;
      stopCamera();
      const denied =
        cause instanceof DOMException &&
        ["NotAllowedError", "SecurityError"].includes(cause.name);
      setError(
        denied
          ? t(
              "Camera bị từ chối. Bạn có thể cấp quyền trong trình duyệt hoặc chọn ảnh từ máy.",
              "Camera permission was denied. Enable it in your browser or choose an image.",
            )
          : t(
              "Không mở được camera. Đóng app đang dùng camera rồi thử lại, hoặc chọn ảnh từ máy.",
              "Camera could not start. Close another camera app and retry, or choose an image.",
            ),
      );
    }
  }
  async function store(image: PreparedImage) {
    if (!repo) return;
    setPendingImage(image);
    const draft = await repo.create(image, pendingId.current);
    setPendingImage(null);
    router.push(`/capture/${draft.id}/edit`);
  }
  async function intake(blob: Blob) {
    if (intakeLock.current) return;
    intakeLock.current = true;
    stopCamera();
    setBusy(true);
    setError("");
    pendingId.current = crypto.randomUUID();
    try {
      await store(await normalizeImage(blob));
    } catch (cause) {
      if (mounted.current) setError(failureText(cause));
    } finally {
      intakeLock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function takePhoto() {
    const node = video.current;
    if (!node || !node.videoWidth || intakeLock.current) return;
    intakeLock.current = true;
    setBusy(true);
    setError("");
    pendingId.current = crypto.randomUUID();
    try {
      const surface = document.createElement("canvas");
      surface.width = node.videoWidth;
      surface.height = node.videoHeight;
      const context = surface.getContext("2d");
      if (!context) throw new ImageError("decode");
      context.drawImage(node, 0, 0);
      stopCamera();
      const image = await jpeg(surface);
      await store(await normalizeImage(image.blob));
    } catch (cause) {
      if (mounted.current) setError(failureText(cause));
    } finally {
      stopCamera();
      intakeLock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function retry() {
    if (!pendingImage || intakeLock.current) return;
    intakeLock.current = true;
    setBusy(true);
    setError("");
    try {
      await store(pendingImage);
    } catch (cause) {
      setError(failureText(cause));
    } finally {
      intakeLock.current = false;
      setBusy(false);
    }
  }
  async function remove(draft: CaptureDraft) {
    if (!repo) return;
    if (deleteId !== draft.id) {
      setDeleteId(draft.id);
      return;
    }
    try {
      await repo.remove(draft.id, draft.version);
      setDeleteId(null);
    } catch (cause) {
      setError(failureText(cause));
    }
  }
  return (
    <div className="reading-page page-flow parent-page">
      <Back />
      <h1>{t("Thêm bài cho con", "Add a lesson")}</h1>
      <p>
        {t(
          "Chụp rõ cả trang, tránh bóng và giữ chữ đủ lớn. Ảnh chỉ được lưu trên trình duyệt này.",
          "Capture the whole page clearly, without shadows. Images stay in this browser.",
        )}
      </p>
      {error && <Failure message={error} />}
      <div className="capture-actions">
        <Button
          onClick={() => void startCamera()}
          disabled={busy || cameraState !== "closed"}
        >
          <Camera data-icon="inline-start" />
          {t("Mở camera", "Open camera")}
        </Button>
        <Field>
          <FieldLabel htmlFor="worksheet-file">
            <Upload aria-hidden="true" />
            {t("Chọn ảnh từ máy", "Choose an image")}
          </FieldLabel>
          <Input
            id="worksheet-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,.heic,.heif"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void intake(file);
            }}
          />
          <FieldDescription>
            JPEG, PNG, WebP · ≤10 MB · ≤20 megapixel
          </FieldDescription>
        </Field>
      </div>
      <div hidden={cameraState === "closed"} className="camera-surface">
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          aria-label={t("Hình trực tiếp từ camera", "Live camera preview")}
        />
        <p role="status">
          {cameraState === "requesting"
            ? t("Đang chờ quyền camera…", "Waiting for camera permission…")
            : t(
                "Đặt bài học trong khung và bấm chụp.",
                "Place the worksheet in view and take a photo.",
              )}
        </p>
        <div className="capture-actions">
          <Button
            onClick={() => void takePhoto()}
            disabled={cameraState !== "ready" || busy}
          >
            {t("Chụp ảnh", "Take photo")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              void startCamera(
                facing === "environment" ? "user" : "environment",
              )
            }
            disabled={cameraState !== "ready"}
          >
            {t("Đổi camera", "Switch camera")}
          </Button>
          <Button variant="ghost" onClick={stopCamera}>
            {t("Đóng camera", "Close camera")}
          </Button>
        </div>
      </div>
      {busy && (
        <p role="status">
          {t(
            "Đang kiểm tra ảnh và lưu nháp…",
            "Checking image and saving draft…",
          )}
        </p>
      )}
      {pendingImage && !busy && (
        <>
          <LocalPreview
            blob={pendingImage.blob}
            label={t("Ảnh chưa lưu được", "Unsaved image")}
          />
          <Button onClick={() => void retry()}>
            {t("Thử lưu ảnh lại", "Retry saving image")}
          </Button>
        </>
      )}
      {drafts?.repo === repo && drafts.rows.length > 0 && (
        <section className="page-flow">
          <h2>{t("Nháp ảnh trên máy", "Local image drafts")}</h2>
          <ul className="capture-drafts">
            {drafts.rows.map((draft) => (
              <li key={draft.id}>
                <div>
                  <Link prefetch={false} href={`/capture/${draft.id}/edit`}>
                    {draft.title || t("Bài chưa đặt tên", "Untitled lesson")}
                  </Link>
                  <p>
                    {draft.width} × {draft.height} px
                    {openedAt - Date.parse(draft.createdAt) > 7 * 86400000 &&
                      ` · ${t("Nháp đã hơn 7 ngày, hãy giữ hoặc xóa nếu không cần.", "Over 7 days old; keep it or delete it if no longer needed.")}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  aria-label={`${t("Xóa nháp", "Delete draft")} ${draft.title || t("chưa đặt tên", "untitled")}`}
                  onClick={() => void remove(draft)}
                >
                  <Trash2 data-icon="inline-start" />
                  {deleteId === draft.id
                    ? t("Xác nhận xóa", "Confirm delete")
                    : t("Xóa", "Delete")}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Alert>
        <AlertTitle>
          {t(
            "Nhận dạng ảnh chưa được kết nối",
            "Image extraction is not connected",
          )}
        </AlertTitle>
        <AlertDescription>
          {t(
            "Bạn có thể chụp, chỉnh và giữ nháp ngay. Phân tích ảnh sẽ mở khi dịch vụ phù hợp đã được kết nối.",
            "You can capture, edit and keep drafts now. Analysis will open when an eligible service is connected.",
          )}
        </AlertDescription>
      </Alert>
      {demo && (
        <Button asChild variant="outline">
          <Link prefetch={false} href="/capture/demo/review">
            {t("Duyệt bài mẫu", "Review sample lesson")}
          </Link>
        </Button>
      )}
    </div>
  );
}

type LoadedDraft = NonNullable<Awaited<ReturnType<CaptureRepository["get"]>>>;
export function CaptureEditor({ draftId }: { draftId: string }) {
  const { t } = useApp();
  const repo = useCaptureRepository();
  const [loaded, setLoaded] = useState<{
    repo: CaptureRepository;
    id: string;
    value: LoadedDraft | null;
    failed: boolean;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (repo)
      repo
        .get(draftId)
        .then((value) => {
          if (active) setLoaded({ repo, id: draftId, value, failed: false });
        })
        .catch(() => {
          if (active)
            setLoaded({ repo, id: draftId, value: null, failed: true });
        });
    return () => {
      active = false;
    };
  }, [repo, draftId, attempt]);
  if (!repo || loaded?.repo !== repo || loaded.id !== draftId)
    return (
      <p role="status">{t("Đang mở nháp ảnh…", "Opening image draft…")}</p>
    );
  if (loaded.failed)
    return (
      <div className="reading-page page-flow">
        <Back href="/capture" />
        <Failure
          message={t(
            "Không mở được ảnh nháp. Thử lại hoặc về danh sách để xóa nháp hỏng rồi chọn ảnh mới.",
            "The draft image could not open. Retry, or delete the damaged draft and choose a new image.",
          )}
        />
        <Button onClick={() => setAttempt((value) => value + 1)}>
          {t("Thử lại", "Retry")}
        </Button>
      </div>
    );
  if (!loaded.value)
    return (
      <div className="reading-page page-flow">
        <Back href="/capture" />
        <EmptyState
          title={t(
            "Không có nháp này trên máy",
            "Draft not found on this device",
          )}
          description={t(
            "Nháp có thể đã bị xóa hoặc thuộc thư viện khác. Chọn lại ảnh từ máy.",
            "It may be deleted or belong to another library. Choose another image.",
          )}
        />
      </div>
    );
  return (
    <Editor
      key={`${repo === loaded.repo}:${draftId}`}
      repo={repo}
      initial={loaded.value}
    />
  );
}
function Editor({
  repo,
  initial,
}: {
  repo: CaptureRepository;
  initial: LoadedDraft;
}) {
  const { t } = useApp();
  const router = useRouter();
  const failureText = useFailureText();
  const [metadata, setMetadata] = useState<CaptureMetadata>({
    title: initial.draft.title,
    learnedOn: initial.draft.learnedOn,
    tags: initial.draft.tags,
    consent: initial.draft.consent,
  });
  const [transform, setTransform] = useState(initial.draft.transform);
  const [crop, setCrop] = useState(initial.draft.transform.crop);
  const [image, setImage] = useState<PreparedImage>({
    blob: initial.prepared,
    width: initial.draft.width,
    height: initial.draft.height,
  });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const version = useRef(initial.draft.version);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const active = useRef(true);
  const processTicket = useRef(0);
  const fingerprint = JSON.stringify({ metadata, transform });
  const [saved, setSaved] = useState(fingerprint);
  const dirty = fingerprint !== saved;
  const dirtyRef = useRef(false);
  const flush = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    dirtyRef.current = dirty || processing;
  }, [dirty, processing]);
  useEffect(() => {
    active.current = true;
    const invalidate = () => {
      processTicket.current++;
    };
    const warn = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      active.current = false;
      invalidate();
      // SPA navigation does not emit beforeunload; flush the last accepted pixels/fields.
      if (dirtyRef.current) void flush.current?.().catch(() => {});
      window.removeEventListener("beforeunload", warn);
    };
  }, []);
  const persist = useCallback(async () => {
    const currentFingerprint = JSON.stringify({ metadata, transform });
    if (processing) return;
    const write = writes.current
      .catch(() => {})
      .then(async () => {
        if (active.current) setSaving(true);
        const next = await repo.update(
          initial.draft.id,
          version.current,
          metadata,
          transform,
          image,
        );
        version.current = next.version;
        if (active.current) {
          setSaved(currentFingerprint);
          setError("");
        }
      });
    writes.current = write;
    try {
      await write;
    } catch (cause) {
      if (active.current) setError(failureText(cause));
      throw cause;
    } finally {
      if (active.current) setSaving(false);
    }
  }, [
    repo,
    initial.draft.id,
    metadata,
    transform,
    image,
    processing,
    failureText,
  ]);
  useEffect(() => { flush.current = persist; }, [persist]);
  // Save only user edits, never upload on restore. Failure leaves the editor in memory.
  useEffect(() => {
    if (!dirty || processing) return;
    const timer = setTimeout(() => {
      void persist().catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [persist, dirty, processing]);
  async function apply(next: Transform) {
    const ticket = ++processTicket.current;
    setProcessing(true);
    setError("");
    try {
      const prepared = await transformImage(initial.source, next);
      if (active.current && ticket === processTicket.current) {
        setImage(prepared);
        setTransform(next);
        setCrop(next.crop);
      }
    } catch (cause) {
      if (active.current && ticket === processTicket.current)
        setError(failureText(cause));
    } finally {
      if (active.current && ticket === processTicket.current)
        setProcessing(false);
    }
  }
  async function leave() {
    try {
      await persist();
      router.push("/capture");
    } catch {}
  }
  const names = {
    left: t("Mép trái (%)", "Left edge (%)"),
    top: t("Mép trên (%)", "Top edge (%)"),
    right: t("Mép phải (%)", "Right edge (%)"),
    bottom: t("Mép dưới (%)", "Bottom edge (%)"),
  };
  return (
    <div className="capture-editor page-flow parent-page">
      <Button
        variant="ghost"
        onClick={() => void leave()}
        disabled={processing || saving}
      >
        {t("Quay lại và giữ nháp", "Go back and keep draft")}
      </Button>
      <h1>{t("Xem và chỉnh ảnh", "Check and edit image")}</h1>
      <p>
        {t(
          "Ảnh bên dưới đã bỏ metadata và là ảnh sẽ dùng để nhận dạng. Phóng to để kiểm tra chữ trước khi gửi.",
          "The image below has its metadata removed and will be used for analysis. Enlarge it to check the text before sending.",
        )}
      </p>
      {error && <Failure message={error} />}
      <div className="capture-edit-layout">
        <section className="page-flow">
          <LocalPreview
            blob={image.blob}
            label={t(
              "Ảnh đã xử lý để nhận dạng",
              "Processed image for analysis",
            )}
          />
          <p>
            {image.width} × {image.height} px ·{" "}
            {Math.ceil(image.blob.size / 1000)} KB
          </p>
          <div className="capture-actions">
            <Button
              variant="outline"
              disabled={processing}
              onClick={() =>
                void apply({
                  rotation: ((transform.rotation + 90) %
                    360) as Transform["rotation"],
                  crop: fullTransform.crop,
                })
              }
            >
              <RotateCw data-icon="inline-start" />
              {t("Xoay 90°", "Rotate 90°")}
            </Button>
            <Button
              variant="ghost"
              disabled={processing}
              onClick={() => void apply(structuredClone(fullTransform))}
            >
              {t("Khôi phục ảnh", "Reset image")}
            </Button>
            <Button
              variant="ghost"
              disabled={processing || saving}
              onClick={() => void leave()}
            >
              {t("Chọn hoặc chụp lại", "Choose or retake")}
            </Button>
          </div>
          <details>
            <summary>{t("Cắt vùng ảnh", "Crop image")}</summary>
            <p>
              {t(
                "Nhập các mép theo phần trăm của ảnh sau xoay. Có thể dùng phím mũi tên để chỉnh từng mép; bấm Áp dụng để xem kết quả.",
                "Enter edges as percentages of the rotated image. Use arrow keys to adjust, then Apply to see the result.",
              )}
            </p>
            <FieldGroup className="crop-fields">
              {(Object.keys(names) as (keyof typeof names)[]).map((key) => (
                <Field key={key}>
                  <FieldLabel htmlFor={`crop-${key}`}>{names[key]}</FieldLabel>
                  <Input
                    id={`crop-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Number.isNaN(crop[key]) ? "" : crop[key]}
                    onChange={(event) =>
                      setCrop((value) => ({
                        ...value,
                        [key]:
                          event.target.value === ""
                            ? NaN
                            : Number(event.target.value),
                      }))
                    }
                  />
                </Field>
              ))}
            </FieldGroup>
            <Button
              variant="outline"
              disabled={processing}
              onClick={() => void apply({ ...transform, crop })}
            >
              {t("Áp dụng vùng cắt", "Apply crop")}
            </Button>
          </details>
        </section>
        <section className="page-flow">
          <h2>{t("Nháp bài học", "Lesson draft")}</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="draft-title">
                {t("Tên bài (tùy chọn)", "Lesson name (optional)")}
              </FieldLabel>
              <Input
                id="draft-title"
                maxLength={200}
                value={metadata.title}
                onChange={(event) =>
                  setMetadata((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="draft-date">
                {t("Ngày học (tùy chọn)", "Lesson date (optional)")}
              </FieldLabel>
              <Input
                id="draft-date"
                type="date"
                value={metadata.learnedOn}
                onChange={(event) =>
                  setMetadata((value) => ({
                    ...value,
                    learnedOn: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="draft-tags">
                {t("Tags (tùy chọn)", "Tags (optional)")}
              </FieldLabel>
              <Input
                id="draft-tags"
                maxLength={500}
                value={metadata.tags}
                onChange={(event) =>
                  setMetadata((value) => ({
                    ...value,
                    tags: event.target.value,
                  }))
                }
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="draft-consent"
                checked={metadata.consent}
                onCheckedChange={(checked) =>
                  setMetadata((value) => ({
                    ...value,
                    consent: checked === true,
                  }))
                }
              />
              <FieldLabel htmlFor="draft-consent">
                {t(
                  "Cho phép gửi ảnh này để nhận dạng khi tôi bấm Phân tích ảnh.",
                  "Allow this image to be uploaded when I press Analyse image.",
                )}
              </FieldLabel>
            </Field>
            <FieldDescription>
              {t(
                "Đánh dấu chưa gửi ảnh. Lưu trên máy và gửi ảnh AI là hai lựa chọn riêng; không tự gửi sau khi mở lại nháp.",
                "Checking this does not upload anything. Local storage and AI upload are separate; reopening never sends the draft.",
              )}
            </FieldDescription>
          </FieldGroup>
          <p>{t("Phân tích bằng AI với API key riêng của bố mẹ. Nếu chưa thêm key, mở Cài đặt → AI riêng của phụ huynh.","Analyse with your own API key. Add a key under Settings → Parent’s own AI.")}</p>
          <Button disabled={processing||saving} onClick={async()=>{try{await persist();router.push(`/capture/${initial.draft.id}/extract`);}catch{}}}>{t("Phân tích ảnh bằng AI", "Analyse photo with AI")}</Button>
          <Button asChild variant="outline"><Link prefetch={false} href={`/add?capture=${initial.draft.id}`}>{t("Chép và thêm từ từ ảnh", "Transcribe words from image")}</Link></Button>
          <Button
            variant="outline"
            disabled={processing || saving}
            onClick={() => void persist().catch(() => {})}
          >
            <Save data-icon="inline-start" />
            {t("Lưu nháp trên máy", "Save draft locally")}
          </Button>
          <p role="status">
            {processing
              ? t("Đang chỉnh ảnh…", "Processing image…")
              : saving
                ? t("Đang lưu nháp…", "Saving draft…")
                : dirty
                  ? t("Có thay đổi chưa lưu", "Unsaved changes")
                  : t("Đã lưu nháp trên máy", "Draft saved locally")}
          </p>
        </section>
      </div>
    </div>
  );
}
