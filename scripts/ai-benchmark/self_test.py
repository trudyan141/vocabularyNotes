#!/usr/bin/env python3
"""Reference fixtures exercise the scorer; these are NOT OCR/model results."""
import json
import unittest
from copy import deepcopy
from pathlib import Path
from score import DATA, evaluate, load_dataset, parse_output, strict_json


def reference_record(case, mode, manifest):
    gold = case['expected'][mode]
    output = {'schemaVersion': '1.0', 'document': {'titleSuggestion': None, 'lessonDateSuggestion': None,
              'detectedLanguages': ['vi'] if case['cohort'] == 'no_english' else ['en'],
              'quality': 'clear', 'warnings': []},
              'evidence': [{'id': 'e1', 'text': '\n'.join(case['lines']), 'pageIndex': 0,
                            'bbox': None, 'confidenceLabel': 'high'}],
              'vocabulary': [{'candidateId': f'w{i}', 'surfaceText': word['text'], 'kind': word['kind'],
                              'caseMode': 'fold', 'posSuggestion': None, 'evidenceIds': ['e1'],
                              'extractionReason': 'all_words_mode' if mode == 'all' else 'explicit_word_list',
                              'reviewRequired': True} for i, word in enumerate(gold['vocabulary'])],
              'sentences': [{'candidateId': f's{i}', 'textEn': text, 'translationVi': None,
                             'origin': 'source', 'evidenceIds': ['e1'], 'reviewRequired': True}
                            for i, text in enumerate(gold['sentences'])], 'patterns': [], 'grammar': []}
    return {'caseId': case['id'], 'mode': mode,
            'imageSha256': next(image['sha256'] for image in manifest['images'] if image['caseId'] == case['id']),
            'schemaSha256': manifest['schemaSha256'], 'promptSha256': manifest['promptSha256'],
            'sdkVersion': 'none-reference-fixture', 'provider': 'self-test', 'model': 'reference-fixture',
            'promptVersion': 'reference-not-a-provider-prompt', 'status': 'ok',
            'output': json.dumps(output, ensure_ascii=False), 'latencyMs': None, 'costUsd': None}


class ScorerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases, cls.manifest, cls.validator = load_dataset()

    def setUp(self):
        self.case = self.cases['01-fruit']
        self.record = reference_record(self.case, 'listed', self.manifest)

    def changed(self, edit):
        output = json.loads(self.record['output']); edit(output)
        record = {**self.record, 'output': json.dumps(output)}
        return parse_output(record, self.case, self.validator)

    def test_reference_all_40_and_undefined_empty_metrics(self):
        records = [reference_record(case, mode, self.manifest) for case in self.cases.values() for mode in ('listed', 'all')]
        report = evaluate(records, self.cases, self.manifest, self.validator, 'self_test')
        self.assertFalse(report['isLiveBenchmark']); self.assertEqual(report['missing'], [])
        self.assertTrue(all(row['accepted'] for row in report['rows']))
        empty = next(row for row in report['rows'] if row['caseId'] == '17-vietnamese')
        self.assertIsNone(empty['vocabulary']['recall']); self.assertTrue(empty['emptyCorrect'])
        self.assertIsNone(report['costUsd']); self.assertIsNone(report['latencyP95Ms'])
        (DATA / 'self-test-records.jsonl').write_text(''.join(json.dumps(record, ensure_ascii=False) + '\n' for record in records))
        (DATA / 'self-test-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')

    def test_missing_cases_and_failure_still_count_false_negatives(self):
        record = {**self.record, 'status': 'refusal'}
        report = evaluate([record], self.cases, self.manifest, self.validator, 'self_test')
        self.assertEqual(len(report['missing']), 39); self.assertEqual(report['rows'][0]['vocabulary']['fn'], 3)
        self.assertFalse(report['rows'][0]['accepted'])

    def test_malformed_truncated_timeout_and_refusal(self):
        for status in ('refusal', 'truncated', 'timeout', 'cancelled', 'provider_error'):
            self.assertEqual(parse_output({**self.record, 'status': status}, self.case, self.validator)[1], [status])
        self.assertEqual(parse_output({**self.record, 'output': '{'}, self.case, self.validator)[1], ['malformed_json'])

    def test_strict_json_duplicate_and_nonfinite(self):
        for raw in ('{"x":1,"x":2}', '{"x":NaN}', '{"x":Infinity}'):
            with self.assertRaises(ValueError): strict_json(raw)

    def test_schema_extra_fields_and_oversize(self):
        self.assertIn('schema_invalid', self.changed(lambda output: output.update({'secret': 'forbidden'}))[1])
        self.assertIn('invalid_output_size_or_type', parse_output({**self.record, 'output': 'a' * 1_000_001}, self.case, self.validator)[1])

    def test_duplicate_ids(self):
        self.assertIn('duplicate_evidence_id', self.changed(lambda output: output['evidence'].append(deepcopy(output['evidence'][0])))[1])
        self.assertIn('duplicate_candidate_id', self.changed(lambda output: output['vocabulary'].append(deepcopy(output['vocabulary'][0])))[1])

    def test_refs_bboxes_and_page(self):
        self.assertIn('invalid_evidence_refs', self.changed(lambda output: output['vocabulary'][0].update(evidenceIds=['missing']))[1])
        self.assertIn('invalid_bbox', self.changed(lambda output: output['evidence'][0].update(bbox={'x':.8,'y':0,'width':.3,'height':.2}))[1])
        self.assertIn('schema_invalid', self.changed(lambda output: output['evidence'][0].update(pageIndex=1))[1])

    def test_hallucination_and_word_boundary(self):
        self.assertIn('evidence_not_verbatim', self.changed(lambda output: output['evidence'][0].update(text='imaginary word'))[1])
        self.assertIn('candidate_not_in_evidence', self.changed(lambda output: output['vocabulary'][0].update(surfaceText='app'))[1])

    def test_inferred_requires_review(self):
        item = {'candidateId':'g1','titleEn':'Present simple','titleVi':None,'ruleKeySuggestion':None,
                'origin':'inferred','evidenceIds':['e1'],'reviewRequired':False}
        self.assertIn('inferred_without_review', self.changed(lambda output: output['grammar'].append(item))[1])

    def test_metadata_and_injection_are_false_positives_not_commands(self):
        for case_id, word in [('19-metadata','Sample Child'),('18-injection','SECRET')]:
            case = self.cases[case_id]; record = reference_record(case, 'all', self.manifest)
            output = json.loads(record['output'])
            output['vocabulary'].append({'candidateId':'bad','surfaceText':word,'kind':'phrase' if ' ' in word else 'word',
                'caseMode':'fold','posSuggestion':None,'evidenceIds':['e1'],'extractionReason':'all_words_mode','reviewRequired':True})
            record['output'] = json.dumps(output)
            row = evaluate([record], self.cases, self.manifest, self.validator, 'self_test')['rows'][0]
            self.assertEqual(row['vocabulary']['fp'], 1); self.assertIn(word.casefold(), row['unexpectedTerms'])

    def test_hash_duplicate_case_and_bad_cost_rejected(self):
        for record in ({**self.record,'imageSha256':'wrong'}, {**self.record,'schemaSha256':'wrong'},
                       {**self.record,'costUsd':-1}, {**self.record,'latencyMs':True}):
            with self.assertRaises(ValueError): evaluate([record], self.cases, self.manifest, self.validator, 'self_test')
        with self.assertRaises(ValueError): evaluate([self.record,self.record], self.cases, self.manifest, self.validator, 'self_test')

    def test_missing_word_lowers_recall_and_mixed_runs_rejected(self):
        output = json.loads(self.record['output']); output['vocabulary'].pop()
        record = {**self.record, 'output': json.dumps(output)}
        row = evaluate([record], self.cases, self.manifest, self.validator, 'self_test')['rows'][0]
        self.assertAlmostEqual(row['vocabulary']['recall'], 2 / 3)
        other = reference_record(self.cases['02-school'], 'listed', self.manifest)
        other['model'] = 'different-model'
        with self.assertRaises(ValueError): evaluate([record, other], self.cases, self.manifest, self.validator, 'self_test')

    def test_untrusted_record_metadata_types_fail_cleanly(self):
        for record in ({**self.record, 'caseId':[]}, {**self.record, 'mode':{}},
                       {**self.record, 'latencyMs':10**400}, {**self.record, 'costUsd':float('inf')}):
            with self.assertRaises(ValueError): evaluate([record], self.cases, self.manifest, self.validator, 'self_test')
        self.assertEqual(parse_output({**self.record,'status':[]}, self.case, self.validator)[1], ['invalid_status'])

    def test_source_grammar_cannot_be_invented(self):
        item = {'candidateId':'g1','titleEn':'Present simple','titleVi':None,'ruleKeySuggestion':None,
                'origin':'source','evidenceIds':['e1'],'reviewRequired':True}
        self.assertIn('unsupported_source_pattern_or_grammar', self.changed(lambda output: output['grammar'].append(item))[1])

    def test_self_test_cannot_be_provider_proof(self):
        with self.assertRaises(ValueError): evaluate([self.record], self.cases, self.manifest, self.validator, 'recorded_provider')


if __name__ == '__main__':
    unittest.main()
