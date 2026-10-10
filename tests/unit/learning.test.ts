import { describe, expect, it } from "vitest";
import { answerKey, schedule } from "../../src/lib/learning/srs";
import { suggestions } from "../../src/lib/learning/catalog";
import {candidates} from "../../src/lib/ocr/candidates";
describe("learning policies",()=>{
 it("uses the documented versioned Again/Hard/Good/Easy intervals",()=>{
  const time="2026-10-09T10:00:00.000Z";let state=schedule(undefined,"Good",time);expect(state.intervalDays).toBe(1);
  state=schedule(state,"Good",time);expect(state.intervalDays).toBe(3);state=schedule(state,"Good",time);expect(state.intervalDays).toBe(8);
  const again=schedule(state,"Again",time);expect(again.streak).toBe(0);expect(again.dueAt).toBe("2026-10-09T10:10:00.000Z");
  expect(schedule(undefined,"Hard",time).intervalDays).toBe(2);expect(schedule(undefined,"Easy",time).intervalDays).toBe(4);
  expect(schedule({...state,intervalDays:365},"Easy",time).intervalDays).toBe(365);
 });
 it("preserves punctuation/accents and exact case in answers",()=>{
  expect(answerKey(" Apple ")).toBe("apple");expect(answerKey("can’t")).toBe("can't");
  expect(answerKey("cant")).not.toBe(answerKey("can't"));expect(answerKey("US","exact")).not.toBe(answerKey("us","exact"));
  expect(answerKey("café")).not.toBe(answerKey("cafe"));
 });
 it("suggests direct and related catalog words without saving anything",()=>{
  const items=suggestions("grap");expect(items[0].word).toBe("grapes");expect(items.length).toBeGreaterThan(1);expect(suggestions("unlistedword")).toEqual([]);
 });
 it("keeps literal OCR evidence and distinguishes listed phrases from all-word mode",()=>{
  const listed=candidates("worksheet 01\napple\napple\nriver bank\n", "listed");expect(listed.map(i=>i.literal)).toEqual(["apple","river bank"]);expect(listed[1].selected).toBe(false);
  expect(candidates("I like a book.","all").map(i=>i.literal)).toEqual(["I","like","a","book"]);
 });
});
