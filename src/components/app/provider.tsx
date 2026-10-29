"use client";
import {ShadowPreparation} from '@/components/features/shadowing-preparation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { LibraryDatabase } from "@/data/local/database";
import {
  openLocalRepository,
  type LocalRepository,
} from "@/data/local/repository";
import type { LibraryWord, SaveResult, EditResult } from "@/data/local/types";
import { usePathname } from "next/navigation";
import {
  defaultPreferences,
  preferencesKey,
  readPreferences,
  type Preferences,
} from "@/lib/preferences";
import {
  demoCandidates,
  type Candidate,
  type DemoEntry,
} from "@/lib/demo/model";

import {queuePreferences,accountPreferences} from '@/data/cloud/preferences';
import {readAuth,invalidateAuth} from '@/lib/auth-state';
import {clearEdgeAudio} from '@/lib/audio/edge-audio-client';
const defaultSnapshot = {
  preferences: defaultPreferences,
  storageError: false,
};
let snapshot = defaultSnapshot;
let initialized = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    try {
      snapshot = {
        preferences: readPreferences(localStorage.getItem(preferencesKey)),
        storageError: false,
      };
    } catch {
      snapshot = { preferences: defaultPreferences, storageError: true };
    }
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  return () => {
    listeners.delete(listener);
  };
}
function updatePreferences(patch: Partial<Preferences>) {
  const preferences = { ...snapshot.preferences, ...patch };
  let storageError = false;
  try {
    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
  } catch {
    storageError = true;
  }
  snapshot = { preferences, storageError };
  listeners.forEach((l) => l());
}
import {openAccountRepository,requestCloudLibrary,type AccountLibrary} from "@/data/cloud/account";
import {activeShareKey,selectedShare,shareCall} from "@/data/cloud/share-api";
async function openSharedRepository(db:LibraryDatabase,selection:ShareSelection,isCurrent?:()=>boolean){const shared=await import("@/data/cloud/sharing");return shared.openSharedRepository(db,selection,isCurrent);}
import {shareContextSchema,type ShareSelection} from "@/lib/sharing";
type AppState = {
  selectSharedLibrary:(selection:ShareSelection)=>Promise<void>;
  demo: boolean;
  selectLocalLibrary: (demo:boolean)=>Promise<void>;
  selectCloudLibrary:(expectedOwner?:string)=>Promise<void>;
  entries: DemoEntry[];
  candidates: Candidate[];
  receipt: SaveResult | null;
  repository: LocalRepository | null;
  databaseStatus: "loading" | "ready" | "error";
  retryDatabase: () => void;
  totalWords: number;
  draftError: boolean;
  preferences: Preferences;
  storageError: boolean;
  setPreferences: (patch:Partial<Preferences>)=>Promise<boolean>;
  t: (vi: string, en: string) => string;
  setCandidates: (next: Candidate[]) => void;
  savePreview: (fail?: boolean) => Promise<SaveResult>;
  editPreview: (
    id: string,
    revision: string,
    patch: Pick<DemoEntry, "word" | "vi" | "en">,
  ) => Promise<EditResult>;
};
const Context = createContext<AppState | null>(null);
export function AppProvider({
  demo: initialDemo,
  children,
}: {
  demo: boolean;
  children: ReactNode;
}) {
  const settings = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => defaultSnapshot,
  );
  const [connection, setConnection] = useState<{
    repository: LocalRepository | null;
    error: boolean;
  }>({ repository: null, error: false });
  const [selection,setSelection]=useState<boolean|AccountLibrary|null>(null);
  const contextGeneration=useRef(0);
  const identityId=useRef<string|null|undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const [draftError, setDraftError] = useState(false);
  const draftWrites = useRef<Promise<unknown>>(Promise.resolve());
  const [candidateBuffer, setCandidateBuffer] = useState<{
    scopeId: string;
    candidates: Candidate[];
  } | null>(null);
  const repository = connection.repository;
  useEffect(()=>{clearEdgeAudio();return()=>{clearEdgeAudio();repository?.releaseLibrarySearch();};},[repository]);
  const demo=repository?repository.scope.kind==="demo":typeof selection==="boolean"?selection:selection===null?initialDemo:false;
  useEffect(() => {
    const db = new LibraryDatabase();
    let active = true;const generation=contextGeneration.current;const isCurrent=()=>active&&generation===contextGeneration.current;
    const unavailable = () => {
      if (isCurrent()) setConnection({ repository: null, error: true });
    };
    db.on("blocked", unavailable);
    db.on("versionchange", unavailable);
    (async()=>{await db.open();const preference=await db.metadata.get("chosen-local-library");
      // Verify identity before choosing a writable scope, even when a guest choice was saved.
      let status;try{status=await readAuth();}catch(error){const known=await db.metadata.get('last-auth-kind');if(!navigator.onLine&&known?.value==='guest')return openLocalRepository(db,preference?.value==='demo'?true:false);throw error;}
      if(!isCurrent())throw new Error('context-changed');
      identityId.current=status.user?.id??null;
      const shared=await selectedShare(db);if(shared)return openSharedRepository(db,shared,isCurrent);
      if(status.hasSharedDevice&&!await db.metadata.get('share-choice-reset')){const context=shareContextSchema.parse(await shareCall({action:'context',kind:'device'}));return openSharedRepository(db,context,isCurrent);}
      const last=await db.metadata.get('last-auth-kind');if(status.user&&last?.value!=='account')await db.metadata.put({key:'guest-display-preferences',value:JSON.stringify(snapshot.preferences)});if(!status.user&&last?.value==='account'){const guest=await db.metadata.get('guest-display-preferences');updatePreferences(readPreferences(guest?.value??null));}await db.metadata.put({key:'last-auth-kind',value:status.user?'account':'guest'});
      if(status.user){const account=await requestCloudLibrary();if(account.ownerId!==status.user.id)throw new Error('account-changed');const repo=await openAccountRepository(db,account);updatePreferences((await accountPreferences(repo))??defaultPreferences);return repo;}
      return openLocalRepository(db,typeof selection==='boolean'?selection:preference?.value==='guest'||preference?.value==='cloud'?false:preference?.value==='demo'?true:initialDemo);
    })()
      .then((repo) => {
        if (isCurrent()) setConnection({ repository: repo, error: false });
        else db.close();
      })
      .catch(unavailable);
    return () => {
      active = false;
      db.close();
    };
  }, [initialDemo,selection,attempt]);
  useEffect(()=>{
    const changed=()=>{invalidateAuth();window.dispatchEvent(new Event('wfk-audio-stop'));setConnection({repository:null,error:false});setSelection(null);setAttempt(value=>value+1);};
    window.addEventListener('wfk-auth-changed',changed);
    const channel='BroadcastChannel' in window?new BroadcastChannel('wfk-auth'):null;
    if(channel)channel.onmessage=changed;
    let checking=false;
    const check=async()=>{if(checking||!navigator.onLine||document.hidden)return;checking=true;try{const status=await readAuth();if(identityId.current!==undefined&&(status.user?.id??null)!==identityId.current)changed();}catch{}finally{checking=false;}};
    const timer=setInterval(()=>void check(),60000);window.addEventListener('focus',check);window.addEventListener('online',check);
    return()=>{clearInterval(timer);channel?.close();window.removeEventListener('wfk-auth-changed',changed);window.removeEventListener('focus',check);window.removeEventListener('online',check);};
  },[repository]);
  const accountSettings=useLiveQuery(async()=>repository?.scope.kind==='account'?{scope:repository.scope.id,preferences:await accountPreferences(repository)}:null,[repository]);
  useEffect(()=>{if(accountSettings?.scope===repository?.scope.id&&accountSettings?.preferences)updatePreferences(accountSettings.preferences);},[accountSettings,repository]);
  const local = useLiveQuery(async () => {
    if (!repository) return undefined;
    try {
      const [result, draft, receipt] = await Promise.all([
        repository.search("", { limit: 20, approvedOnly: true }),
        repository.draft(),
        repository.lastResult(),
      ]);
      return {
        result,
        draft,
        receipt,
        scopeId: repository.scope.id,
        error: false,
      };
    } catch {
      return {
        scopeId: repository.scope.id,
        result: undefined,
        draft: undefined,
        receipt: null,
        error: true,
      };
    }
  }, [repository]);
  const current = local?.scopeId === repository?.scope.id ? local : undefined;
  const databaseStatus =
    connection.error || current?.error
      ? "error"
      : repository && current
        ? "ready"
        : "loading";
  const entries: LibraryWord[] = current?.result?.words ?? [];
  const candidates =
    (candidateBuffer?.scopeId === repository?.scope.id
      ? candidateBuffer?.candidates
      : null) ??
    current?.draft?.candidates ??
    (demo ? demoCandidates : []);
  const receipt = current?.receipt ?? null;
  function setCandidates(next: Candidate[]) {
    if (!repository || databaseStatus !== "ready") return;
    setCandidateBuffer({ scopeId: repository.scope.id, candidates: next });
    // Draft UI remains responsive; writes serialize so an earlier edit cannot replace a later one.
    draftWrites.current = draftWrites.current
      .catch(() => {})
      .then(() => repository.setDraft(next))
      .then(() => setDraftError(false))
      .catch(() => {
        setDraftError(true);
        throw new Error("draft-write-failed");
      });
    void draftWrites.current.catch(() => {});
  }
  const saving = useRef(false);
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = settings.preferences.locale;
    document.documentElement.dataset.motion = settings.preferences.reduceMotion
      ? "reduced"
      : "system";
    document.documentElement.dataset.mode = settings.preferences.childFriendly
      ? "child"
      : "standard";
  }, [settings.preferences]);
  useEffect(() => {
    const stop = () => {
      window.dispatchEvent(new Event("wfk-audio-stop"));
      if (window.speechSynthesis) speechSynthesis.cancel();
    };
    stop();
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [pathname, settings.preferences.sound]);
  async function savePreview(fail = false) {
    if (!demo || !repository || databaseStatus !== "ready" || saving.current)
      throw new Error("preview-unavailable");
    saving.current = true;
    try {
      // Yield for visible pending feedback, without a fake progress percentage.
      await new Promise<void>((resolve) => setTimeout(resolve, 160));
      if (fail) throw new Error("demo-save-error");
      await draftWrites.current;
      return repository.saveDemo();
    } finally {
      saving.current = false;
    }
  }
  const t=useCallback((vi:string,en:string)=>settings.preferences.locale === "vi" ? vi : en,[settings.preferences.locale]);
  return (
    <Context.Provider
      value={{
        demo,
        selectSharedLibrary:async(choice)=>{const generation=++contextGeneration.current;const db=repository?.db??new LibraryDatabase();await db.open();await openSharedRepository(db,choice,()=>generation===contextGeneration.current);window.dispatchEvent(new Event("wfk-audio-stop"));setConnection({repository:null,error:false});setAttempt(value=>value+1);},
        selectLocalLibrary:async(next)=>{contextGeneration.current++;if((await readAuth()).user)throw new Error('account-active');const db=repository?.db??new LibraryDatabase();await db.open();await db.metadata.delete(activeShareKey);await db.metadata.put({key:'share-choice-reset',value:'1'});await db.metadata.put({key:"chosen-local-library",value:next?"demo":"guest"});if(!repository)db.close();window.dispatchEvent(new Event("wfk-audio-stop"));setConnection({repository:null,error:false});setSelection(next);},
        selectCloudLibrary:async(expectedOwner)=>{contextGeneration.current++;const status=await readAuth();if(!status.user||expectedOwner&&status.user.id!==expectedOwner)throw new Error('account-changed');const db=repository?.db??new LibraryDatabase();await db.open();await db.metadata.delete(activeShareKey);await db.metadata.put({key:'share-choice-reset',value:'1'});if(!repository)db.close();await draftWrites.current;setConnection({repository:null,error:false});setSelection(null);setAttempt(value=>value+1);},
        entries,
        candidates,
        receipt,
        repository,
        databaseStatus,
        totalWords: current?.result?.totalLibrary ?? 0,
        draftError,
        retryDatabase: () => {
          setConnection({ repository: null, error: false });
          setAttempt((v) => v + 1);
        },
        ...settings,
        setPreferences: async patch=>{updatePreferences(patch);if(repository?.scope.kind==='account')await queuePreferences(repository,patch).catch(()=>{snapshot={...snapshot,storageError:true};listeners.forEach(fn=>fn());});else if(repository?.scope.kind==='guest')await repository.db.metadata.put({key:'guest-display-preferences',value:JSON.stringify(snapshot.preferences)}).catch(()=>{snapshot={...snapshot,storageError:true};listeners.forEach(fn=>fn());});return !snapshot.storageError;},
        t,
        setCandidates,
        savePreview,
        editPreview: async (id, revision, patch) => {
          if (!repository || databaseStatus !== "ready")
            throw new Error("storage-unavailable");
          return repository.editWord(id, revision, patch);
        },
      }}
    >
      <ShadowPreparation/>
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const app = useContext(Context);
  if (!app) throw new Error("AppProvider required");
  return app;
}

const subscribeReady = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
}
