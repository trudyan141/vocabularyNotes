import {preparedSentenceIpa} from "@/lib/pronunciation/prepared";
import {catalogAdditions} from "./additional";
import { demoEntries } from "@/lib/demo/model";
import type { WordInput, Pronunciation } from "@/data/local/types";
export type LookupWord = WordInput & { pronunciations?: Pronunciation[]; examplePronunciations?: Pronunciation[] };
// Project-authored bilingual suggestions; a parent still approves every saved item.
const hints: Record<string, [string, string]> = {
  apple: ["ép-pồ", "ai ít ần ép-pồ"], banana: ["bờ-na-nờ", "ai lai-k bờ-na-nờz"],
  grapes: ["grâyp-s", "đờ grâyp-s a pơ-pồ"], nut: ["nất", "ai ít ờ nất"],
  book: ["búc", "đis iz ờ búc"], milk: ["milk", "ai đrinh-k milk"],
};
export function pronunciation(text: string, hint: string | null, ipa: string | null = null,
  sourceUrl: string | null = null, verified = false): Pronunciation {
  const guide=!ipa?preparedSentenceIpa[text]:undefined;
  return { text, contentVersion: 1, accent: guide?"US":"other", ipa:ipa??guide??null, sourceUrl:sourceUrl??(guide?"https://github.com/cmusphinx/cmudict":null), verified,
    readingHintVi: hint, origin: sourceUrl||guide ? "source" : "user", approvedContentVersion: 1 };
}
const checkedIpa: Record<string, [string, string]> = {
  apple: ["/ˈæp.əl/", "https://dictionary.cambridge.org/pronunciation/english/apple"],
  banana: ["/bəˈnɑː.nə/", "https://dictionary.cambridge.org/pronunciation/english/banana"],
  orange: ["/ˈɒr.ɪndʒ/", "https://dictionary.cambridge.org/pronunciation/english/orange"],
  milk: ["/mɪlk/", "https://dictionary.cambridge.org/pronunciation/english/milk"],
  bread: ["/bred/", "https://dictionary.cambridge.org/pronunciation/english/bread"],
  water: ["/ˈwɑː.t̬ɚ/", "https://dictionary.cambridge.org/pronunciation/english/water"],
  egg: ["/eɡ/", "https://dictionary.cambridge.org/pronunciation/english/egg"],
  bag: ["/bæɡ/", "https://dictionary.cambridge.org/pronunciation/english/bag"],
  pen: ["/pen/", "https://dictionary.cambridge.org/pronunciation/english/pen"],
  cat: ["/kæt/", "https://dictionary.cambridge.org/pronunciation/english/cat"],
  dog: ["/dɒɡ/", "https://dictionary.cambridge.org/pronunciation/english/dog"],
  fish: ["/fɪʃ/", "https://dictionary.cambridge.org/pronunciation/english/fish"],
  tree: ["/triː/", "https://dictionary.cambridge.org/pronunciation/english/tree"],
  bird: ["/bɜːd/", "https://dictionary.cambridge.org/pronunciation/english/bird"],
  sun: ["/sʌn/", "https://dictionary.cambridge.org/pronunciation/english/sun"],
  car: ["/kɑːr/", "https://dictionary.cambridge.org/pronunciation/english/car"],
  bank: ["/bæŋk/", "https://dictionary.cambridge.org/pronunciation/english/bank"],
  grapes: ["/ɡɹeɪps/", "https://en.wiktionary.org/wiki/grapes"],
  book: ["/bʊk/", "https://dictionary.cambridge.org/pronunciation/english/book"],
};
const checkedAccents: Record<string,"UK"|"US"> = {"apple": "UK", "banana": "UK", "orange": "UK", "milk": "UK", "bread": "UK", "water": "US", "egg": "UK", "bag": "UK", "pen": "UK", "cat": "UK", "dog": "UK", "fish": "UK", "tree": "UK", "bird": "UK", "sun": "UK", "car": "US", "bank": "UK"};
export const catalog: LookupWord[] = [...demoEntries.map((word) => ({ ...word,
  id: `catalog-${word.id}`, origin: "user" as const, approved: false,
  source: "Nội dung song ngữ do dự án chuẩn bị; bạn kiểm tra trước khi lưu.",
  pronunciations: [{...pronunciation(word.word, catalogAdditions[word.id]?.[0] ?? hints[word.word]?.[0] ?? null, checkedIpa[word.word]?.[0] ?? null, checkedIpa[word.word]?.[1] ?? null, !!checkedIpa[word.word]),accent:checkedAccents[word.word]??"other"}],
  examplePronunciations: [pronunciation(word.example, catalogAdditions[word.id]?.[1] ?? null)],
  additionalExamples:catalogAdditions[word.id]?[{textEn:catalogAdditions[word.id][2],translationVi:catalogAdditions[word.id][3],pronunciations:[pronunciation(catalogAdditions[word.id][2],catalogAdditions[word.id][4])]}]:[],
})), { id: "catalog-nut", word: "nut", vi: "hạt có vỏ cứng", en: "A seed with a hard shell.",
  example: "I eat a nut.", exampleVi: "Con ăn một hạt.", art: null, lesson: "manual",
  pos: "noun", sense: "seed", ready: true, origin: "user", approved: false,
  source: "Nội dung song ngữ do dự án chuẩn bị; bạn kiểm tra trước khi lưu.",
  pronunciations: [pronunciation("nut", "nất", "/nʌt/", "https://en.wiktionary.org/wiki/nut", true)],
  examplePronunciations: [pronunciation("I eat a nut.", "ai ít ờ nất")],
  additionalExamples:[{textEn:catalogAdditions.nut[2],translationVi:catalogAdditions.nut[3],pronunciations:[pronunciation(catalogAdditions.nut[2],catalogAdditions.nut[4])]}],
}];
export function suggestions(query: string) {
  const q = query.normalize("NFKC").trim().toLowerCase();
  if (!q) return [];
  const direct=catalog.filter(item=>item.word.toLowerCase().includes(q)||item.vi.toLowerCase().includes(q));
  const related=direct.length?catalog.filter(item=>item.lesson===direct[0].lesson&&!direct.includes(item)):[];
  return [...direct,...related].slice(0,8);
}
