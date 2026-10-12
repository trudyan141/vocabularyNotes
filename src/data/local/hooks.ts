"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/components/app/provider";
export function useLibrarySearch(
  query: string,
  options: {
    lesson?: string | null;
    missingArt?: boolean;
    offset?: number;
    limit?: number;
    libraryOnly?: boolean;
  } = {},
) {
  const { repository } = useApp();
  const { lesson = null, missingArt = false, offset = 0, limit = 50, libraryOnly=false } = options;
  const snapshot = useLiveQuery(async () => {
    if (!repository) return undefined;
    try {
      const result = await repository.search(query, {
        lesson,
        missingArt,
        offset,
        limit,
        approvedOnly: true,
        libraryOnly,
      });
      return { ...result, query, offset, scopeId: repository.scope.id, error: false };
    } catch {
      return {
        query, offset,
        words: [],
        total: 0,
        totalLibrary: 0,
        scopeId: repository.scope.id,
        error: true,
      };
    }
  }, [repository, query, lesson, missingArt, offset, limit, libraryOnly]);
  // A prior scope's retained hook result must not flash in a newly selected library.
  return snapshot && snapshot.scopeId === repository?.scope.id && snapshot.query === query && snapshot.offset === offset ? snapshot : undefined;
}
export function useLibraryWord(id: string) {
  const { repository } = useApp();
  const snapshot = useLiveQuery(async () => {
    if (!repository) return undefined;
    try {
      return {
        word: await repository.word(id),
        id,
        scopeId: repository.scope.id,
        error: false,
      };
    } catch {
      return { word: undefined, id, scopeId: repository.scope.id, error: true };
    }
  }, [repository, id]);
  return snapshot?.scopeId === repository?.scope.id && snapshot?.id === id
    ? snapshot
    : undefined;
}
