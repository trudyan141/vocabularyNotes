import { z } from "zod";
import type { Base } from "./types";
import type { LocalRepository } from "./repository";
import { RepositoryError } from "./repository";
import {
  fullTransform,
  validateTransform,
  imageLimits,
  type Transform,
  type PreparedImage,
} from "@/lib/capture/image";
export type CaptureMetadata = {
  title: string;
  learnedOn: string;
  tags: string;
  consent: boolean;
};
export type CaptureDraft = Base &
  CaptureMetadata & {
    sourceKey: string;
    preparedKey: string;
    transform: Transform;
    width: number;
    height: number;
    byteSize: number;
    phase: "editing";
    consentVersion: "image-upload-v1" | null;
  };
export type LocalImage = Base & {
  blob: Blob;
  mime: "image/jpeg";
  byteSize: number;
};
const metadataSchema = z
  .object({
    title: z.string().max(200),
    learnedOn: z.string().refine((value) => {
      if (!value) return true;
      const date = new Date(value + "T00:00:00Z");
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }),
    tags: z.string().max(500),
    consent: z.boolean(),
  })
  .strict();
function validImage(image: PreparedImage) {
  if (
    !(image.blob instanceof Blob) ||
    image.blob.type !== "image/jpeg" ||
    !image.blob.size ||
    image.blob.size > imageLimits.bytes ||
    !Number.isInteger(image.width) ||
    !Number.isInteger(image.height) ||
    image.width < 1 ||
    image.height < 1 ||
    Math.max(image.width, image.height) > imageLimits.edge
  )
    throw new RepositoryError("invalid");
}
export class CaptureRepository {
  constructor(private local: LocalRepository) {}
  private key(id: string): [string, string] {
    return [this.local.scope.id, id];
  }
  private media(id: string, blob: Blob): LocalImage {
    const now = new Date().toISOString();
    return {
      scopeId: this.local.scope.id,
      id,
      blob,
      mime: "image/jpeg",
      byteSize: blob.size,
      version: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }
  async list() {
    return this.local.db.captureDrafts
      .where("[scopeId+updatedAt]")
      .between([this.local.scope.id, ""], [this.local.scope.id, "\uffff"])
      .reverse()
      .toArray();
  }
  async get(id: string) {
    const db = this.local.db;
    return db.transaction("r", db.captureDrafts, db.localMedia, async () => {
      const draft = await db.captureDrafts.get(this.key(id));
      if (!draft) return null;
      const [source, prepared] = await db.localMedia.bulkGet([
        this.key(draft.sourceKey),
        this.key(draft.preparedKey),
      ]);
      if (!source || !prepared) throw new RepositoryError("missing");
      return { draft, source: source.blob, prepared: prepared.blob };
    });
  }
  async create(
    image: PreparedImage,
    id = crypto.randomUUID(),
    initial?:{title:string;learnedOn:string},
  ): Promise<CaptureDraft> {
    validImage(image);
    if(initial){metadataSchema.parse({...initial,tags:"",consent:false});}
    const now = new Date().toISOString();
    const draft: CaptureDraft = {
      scopeId: this.local.scope.id,
      id,
      sourceKey: `${id}:source`,
      preparedKey: `${id}:prepared`,
      phase: "editing",
      transform: structuredClone(fullTransform),
      width: image.width,
      height: image.height,
      byteSize: image.blob.size,
      title: initial?.title??"",
      learnedOn: initial?.learnedOn??"",
      tags: "",
      consent: false,
      consentVersion: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const db = this.local.db;
    return db.transaction("rw", db.captureDrafts, db.localMedia, async () => {
      await db.localMedia.bulkAdd([
        this.media(draft.sourceKey, image.blob),
        this.media(draft.preparedKey, image.blob),
      ]);
      await db.captureDrafts.add(draft);
      return draft;
    });
  }
  async update(
    id: string,
    version: number,
    metadata: CaptureMetadata,
    transform: Transform,
    image: PreparedImage,
  ): Promise<CaptureDraft> {
    if (!metadataSchema.safeParse(metadata).success)
      throw new RepositoryError("invalid");
    validateTransform(transform);
    validImage(image);
    const db = this.local.db;
    return db.transaction("rw", db.captureDrafts, db.localMedia, async () => {
      const previous = await db.captureDrafts.get(this.key(id));
      if (!previous) throw new RepositoryError("missing");
      if (previous.version !== version) throw new RepositoryError("conflict");
      const next: CaptureDraft = {
        ...previous,
        ...metadata,
        transform,
        width: image.width,
        height: image.height,
        byteSize: image.blob.size,
        consentVersion: metadata.consent ? "image-upload-v1" : null,
        version: version + 1,
        updatedAt: new Date().toISOString(),
      };
      // Drafts stay local even for an account scope; consent never schedules an upload.
      await db.localMedia.put(this.media(next.preparedKey, image.blob));
      await db.captureDrafts.put(next);
      return next;
    });
  }
  async remove(id: string, version: number) {
    const db = this.local.db;
    return db.transaction("rw", db.captureDrafts, db.localMedia, async () => {
      const draft = await db.captureDrafts.get(this.key(id));
      if (!draft) return;
      if (draft.version !== version) throw new RepositoryError("conflict");
      await db.localMedia.bulkDelete([
        this.key(draft.sourceKey),
        this.key(draft.preparedKey),
      ]);
      await db.captureDrafts.delete(this.key(id));
    });
  }
}
