#!/usr/bin/env python3
"""Offline evaluation of recorded extraction outputs. Never calls an API or executes text."""
import argparse
import hashlib
import json
import math
import re
import statistics
import unicodedata
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'docs/evaluations/t00'
SCHEMA = ROOT / 'docs/contracts/analysis.schema.json'
MAX_RESPONSE_BYTES = 1_000_000


def strict_json(text):
    def pairs(items):
        obj = {}
        for key, value in items:
            if key in obj:
                raise ValueError('duplicate JSON property')
            obj[key] = value
        return obj
    def invalid_constant(value):
        raise ValueError('non-finite JSON number')
    return json.loads(text, object_pairs_hook=pairs, parse_constant=invalid_constant)


def normalized(text, fold=False):
    result = re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', text)).strip()
    return result.casefold() if fold else result


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_dataset():
    dataset = strict_json((DATA / 'cases.json').read_text())
    manifest = strict_json((DATA / 'manifest.json').read_text())
    if (manifest['casesSha256'] != digest(DATA / 'cases.json') or manifest['schemaSha256'] != digest(SCHEMA)
            or manifest['rendererSha256'] != digest(Path(__file__).with_name('render.mjs'))
            or manifest['promptSha256'] != digest(DATA / 'extraction-prompt.txt')):
        raise ValueError('dataset/schema hash mismatch; render again and review')
    images = {image['caseId']: image for image in manifest['images']}
    cases = {case['id']: case for case in dataset['cases']}
    if len(cases) != len(dataset['cases']) or set(images) != set(cases):
        raise ValueError('dataset inventory mismatch')
    for image in images.values():
        path = (DATA / image['file']).resolve()
        if not path.is_relative_to(DATA.resolve()) or digest(path) != image['sha256']:
            raise ValueError('image hash/path mismatch')
    schema = strict_json(SCHEMA.read_text())
    Draft202012Validator.check_schema(schema)
    return cases, manifest, Draft202012Validator(schema)


def parse_output(record, case, validator):
    status = record.get('status')
    if not isinstance(status, str):
        return None, ['invalid_status']
    if status in {'refusal', 'truncated', 'timeout', 'cancelled', 'provider_error'}:
        return None, [status]
    if status != 'ok':
        return None, ['invalid_status']
    raw = record.get('output')
    try:
        if not isinstance(raw, str) or len(raw.encode('utf8')) > MAX_RESPONSE_BYTES:
            return None, ['invalid_output_size_or_type']
        output = strict_json(raw)
    except (ValueError, RecursionError):
        return None, ['malformed_json']
    if not validator.is_valid(output):
        return None, ['schema_invalid']
    errors = []
    evidence = output['evidence']
    evidence_map = {item['id']: item for item in evidence}
    if len(evidence_map) != len(evidence):
        errors.append('duplicate_evidence_id')
    source = normalized('\n'.join(case['lines']))
    for item in evidence:
        if normalized(item['text']) not in source:
            errors.append('evidence_not_verbatim')
        if item['pageIndex'] != 0:
            errors.append('invalid_page')
        box = item['bbox']
        if box and (box['width'] <= 0 or box['height'] <= 0 or
                    box['x'] + box['width'] > 1 or box['y'] + box['height'] > 1):
            errors.append('invalid_bbox')
    seen_ids = set()
    for group in ('vocabulary', 'sentences', 'patterns', 'grammar'):
        for item in output[group]:
            if item['candidateId'] in seen_ids:
                errors.append('duplicate_candidate_id')
            seen_ids.add(item['candidateId'])
            refs = item['evidenceIds']
            if len(set(refs)) != len(refs) or any(ref not in evidence_map for ref in refs):
                errors.append('invalid_evidence_refs')
                continue
            cited = normalized(' '.join(evidence_map[ref]['text'] for ref in refs))
            if group == 'vocabulary':
                # Word boundaries prevent "book" from citing only "notebook".
                term = re.escape(normalized(item['surfaceText'], fold=True))
                if not re.search(r'(?<!\w)' + term + r'(?!\w)', cited.casefold()):
                    errors.append('candidate_not_in_evidence')
            elif group == 'sentences':
                if item['origin'] != 'source':
                    errors.append('extraction_sentence_not_source')
                if normalized(item['textEn']) not in cited:
                    errors.append('sentence_not_in_evidence')
            if group in ('patterns', 'grammar') and item['origin'] == 'source':
                # These synthetic cases contain no explicit pattern/grammar headings.
                errors.append('unsupported_source_pattern_or_grammar')
            if item.get('origin') == 'inferred' and item['reviewRequired'] is not True:
                errors.append('inferred_without_review')
    return (None if errors else output), sorted(set(errors))


def counts(expected, predicted):
    return {'tp': len(expected & predicted), 'fp': len(predicted - expected), 'fn': len(expected - predicted)}


def metrics(value):
    tp, fp, fn = value['tp'], value['fp'], value['fn']
    # No positive labels => undefined recall, never fabricate 100% accuracy.
    return {**value, 'precision': tp / (tp + fp) if tp + fp else None,
            'recall': tp / (tp + fn) if tp + fn else None}


def evaluate(records, cases, manifest, validator, run_kind):
    if run_kind not in ('self_test', 'recorded_provider'):
        raise ValueError('run_kind must be self_test or recorded_provider')
    rows = []
    keys = set()
    run_identity = None
    images = {image['caseId']: image for image in manifest['images']}
    for record in records:
        if not isinstance(record, dict):
            raise ValueError('record must be object')
        case_id, mode = record.get('caseId'), record.get('mode')
        if not isinstance(case_id, str) or not isinstance(mode, str):
            raise ValueError('caseId and mode must be strings')
        key = (case_id, mode)
        if case_id not in cases or mode not in ('listed', 'all') or key in keys:
            raise ValueError('unknown or duplicate case/mode')
        keys.add(key)
        if record.get('imageSha256') != images[case_id]['sha256']:
            raise ValueError('record uses wrong image hash')
        if record.get('schemaSha256') != manifest['schemaSha256']:
            raise ValueError('record uses wrong schema hash')
        if record.get('promptSha256') != manifest['promptSha256']:
            raise ValueError('record uses wrong prompt template hash')
        for field in ('provider', 'model', 'promptVersion', 'sdkVersion'):
            if not isinstance(record.get(field), str) or not record[field].strip():
                raise ValueError(f'missing {field}')
        identity = tuple(record[field] for field in ('provider', 'model', 'promptVersion'))
        if run_identity is not None and identity != run_identity:
            raise ValueError('mixed provider/model/prompt; use one report per run')
        run_identity = identity
        for field in ('latencyMs', 'costUsd'):
            value = record.get(field)
            if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or
                                      value < 0 or value > 1e15 or not math.isfinite(value)):
                raise ValueError(f'invalid {field}')
        if run_kind == 'recorded_provider' and (record['provider'] == 'self-test' or record['model'] == 'reference-fixture'):
            raise ValueError('self-test cannot be labeled provider evidence')
        output, errors = parse_output(record, cases[case_id], validator)
        gold = cases[case_id]['expected'][mode]
        expected = {(normalized(item['text'], True), item['kind']) for item in gold['vocabulary']}
        predicted = {(normalized(item['surfaceText'], True), item['kind']) for item in output['vocabulary']} if output else set()
        sentence_gold = {normalized(text) for text in gold['sentences']}
        sentence_pred = {normalized(item['textEn']) for item in output['sentences']} if output else set()
        # Invalid output keeps false negatives; it cannot disappear from the denominator.
        rows.append({'caseId': case_id, 'mode': mode, 'cohort': cases[case_id]['cohort'],
                     'accepted': output is not None, 'errors': errors,
                     'vocabulary': metrics(counts(expected, predicted)),
                     'sentences': metrics(counts(sentence_gold, sentence_pred)),
                     'emptyCorrect': output is not None and not expected and not predicted and not sentence_gold and not sentence_pred,
                     'unexpectedTerms': sorted(text for text, _ in predicted - expected),
                     'provider': record['provider'], 'model': record['model'], 'promptVersion': record['promptVersion'],
                     'sdkVersion': record['sdkVersion'],
                     'latencyMs': record.get('latencyMs'), 'costUsd': record.get('costUsd')})
    summaries = []
    for mode, cohort in sorted({(row['mode'], row['cohort']) for row in rows}):
        subset = [row for row in rows if row['mode'] == mode and row['cohort'] == cohort]
        summary = {'mode': mode, 'cohort': cohort, 'cases': len(subset),
                   'accepted': sum(row['accepted'] for row in subset)}
        for group in ('vocabulary', 'sentences'):
            summary[group] = metrics({field: sum(row[group][field] for row in subset) for field in ('tp', 'fp', 'fn')})
        summaries.append(summary)
    latencies = sorted(row['latencyMs'] for row in rows if row['latencyMs'] is not None)
    costs = [row['costUsd'] for row in rows if row['costUsd'] is not None]
    missing = [{'caseId': id, 'mode': mode} for id in cases for mode in ('listed', 'all') if (id, mode) not in keys]
    return {'runKind': run_kind, 'isLiveBenchmark': False, 'scorerSha256': digest(Path(__file__)), 'datasetVersion': manifest['datasetVersion'],
            'groundTruthReview': manifest['groundTruthReview'], 'schemaSha256': manifest['schemaSha256'], 'promptSha256': manifest['promptSha256'],
            'recordedCases': len(rows), 'expectedCases': len(cases) * 2, 'missing': missing,
            'completeCoverage': not missing, 'allOutputsAccepted': bool(rows) and all(row['accepted'] for row in rows),
            'humanAcceptance': 'pending', 'modelSelection': 'not_established',
            'latencySamples': len(latencies), 'latencyP50Ms': statistics.median(latencies) if latencies else None,
            'latencyP95Ms': latencies[math.ceil(len(latencies) * .95) - 1] if latencies else None,
            'costSamples': len(costs), 'costUsd': sum(costs) if costs else None,
            'summaries': summaries, 'rows': rows,
            'limitation': 'Offline scoring only. Recorded provenance and provider/UI behavior require independent verification.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('records', type=Path, help='JSONL of recorded responses; no API credentials')
    parser.add_argument('--kind', choices=['self_test', 'recorded_provider'], required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    try:
        cases, manifest, validator = load_dataset()
        if args.records.stat().st_size > 50_000_000:
            raise ValueError('record file exceeds 50 MB')
        records = []
        with args.records.open() as stream:
            for line in stream:
                if len(line.encode('utf8')) > MAX_RESPONSE_BYTES + 100_000:
                    raise ValueError('record line too large')
                if line.strip():
                    record = strict_json(line)
                    if not isinstance(record, dict):
                        raise ValueError('record must be object')
                    records.append(record)
        report = evaluate(records, cases, manifest, validator, args.kind)
        args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
        print(f"Scored {len(records)}/{report['expectedCases']} records ({args.kind}); {len(report['missing'])} missing. No API calls.")
    except (OSError, ValueError, RecursionError) as error:
        parser.exit(2, f'Cannot score: {error}\n')


if __name__ == '__main__':
    main()
