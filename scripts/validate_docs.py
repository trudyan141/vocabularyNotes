#!/usr/bin/env python3
"""Validate planning links, skill integrity, traceability and optional JSON contracts.

This does not run app tests or establish live OCR accuracy.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


def check_links():
    files = [ROOT / 'README.md', ROOT / 'AGENTS.md', *sorted((ROOT / 'docs').rglob('*.md'))]
    count = 0
    for path in files:
        content = re.sub(r'```.*?```', '', path.read_text(), flags=re.S)
        for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', content):
            target = target.strip().split(' "', 1)[0].strip('<>')
            if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target) or target.startswith('#'):
                continue
            target = unquote(urlsplit(target).path)
            if target:
                count += 1
                check((path.parent / target).exists(), f'{path.relative_to(ROOT)}: missing link {target}')
    return count


def check_integrity():
    lock = json.loads((ROOT / 'docs/skills/skills-lock.json').read_text())
    names = set()
    count = 0
    for skill in lock['installedSkills']:
        check(skill['name'] not in names, f'Duplicate skill name: {skill["name"]}')
        names.add(skill['name'])
        directory = ROOT / skill['directory']
        check((directory / 'SKILL.md').exists(), f'Missing skill: {directory}')
        for record in skill['files']:
            path = directory / record['path']
            check(path.is_file() and not path.is_symlink(), f'Missing/non-file skill resource: {path}')
            if path.is_file():
                digest = hashlib.sha256(path.read_bytes()).hexdigest()
                check(digest == record['sha256'], f'Skill file changed: {path.relative_to(ROOT)}; review and update lock')
                count += 1
        tracked = {record['path'] for record in skill['files']}
        actual = {str(p.relative_to(directory)) for p in directory.rglob('*') if p.is_file()}
        check(actual == tracked, f'Skill resource inventory changed: {skill["name"]}')
        manifest = (directory / 'SKILL.md').read_text()
        check(manifest.startswith('---\n'), f'Missing frontmatter: {skill["name"]}')
        front = manifest.split('---', 2)[1] if manifest.startswith('---\n') else ''
        match = re.search(r'^name:\s*[\"\']?([^\n\"\']+)', front, re.M)
        check(match is not None and match.group(1).strip() == skill['name'], f'Skill name mismatch: {skill["name"]}')
        check(re.search(r'^description:', front, re.M) is not None, f'Missing description: {skill["name"]}')
    actual_dirs = {str(p.parent.relative_to(ROOT)) for p in (ROOT / '.agents/skills').glob('*/SKILL.md')}
    tracked_dirs = {x['directory'] for x in lock['installedSkills']}
    check(actual_dirs == tracked_dirs, 'Installed skill inventory differs from lock')
    return len(names), count


def check_traceability():
    requirements = (ROOT / 'docs/01-requirements.md').read_text()
    tasks = (ROOT / 'docs/ai/TASKS.md').read_text()
    screens = (ROOT / 'docs/03-screen-specs.md').read_text()
    rq_rows = re.findall(r'^\| (R\d{2}) \|[^\n]+', requirements, re.M)
    task_rows = re.findall(r'^\| (T\d{2}) \|[^\n]+', tasks, re.M)
    screen_ids = re.findall(r'\*\*(S\d{2})\*\*', screens)
    check(set(rq_rows) == {f'R{i:02}' for i in range(1, 26)}, 'Requirement inventory missing or unexpected')
    check(set(task_rows) == {f'T{i:02}' for i in range(19)}, 'Task inventory missing or unexpected')
    check(set(screen_ids) == {f'S{i:02}' for i in range(1, 17)}, 'Screen inventory missing or unexpected')
    check(len(rq_rows) == len(set(rq_rows)), 'Duplicate requirement rows')
    check(len(task_rows) == len(set(task_rows)), 'Duplicate task rows')
    check(len(screen_ids) == len(set(screen_ids)), 'Duplicate screen definitions')
    for row in requirements.splitlines():
        if re.match(r'^\| R\d{2} \|', row):
            for task in re.findall(r'T\d{2}', row):
                check(task in task_rows, f'Requirement references undefined task {task}')
    graph = {}
    for row in tasks.splitlines():
        if re.match(r'^\| T\d{2} \|', row):
            columns = [x.strip() for x in row.split('|')[1:-1]]
            task_id, deps = columns[0], re.findall(r'T\d{2}', columns[3])
            graph[task_id] = deps
            for dep in deps:
                check(dep in task_rows and dep != task_id, f'Invalid dependency {task_id} -> {dep}')
    visiting, visited = set(), set()
    def walk(task):
        if task in visiting:
            errors.append(f'Task dependency cycle at {task}')
            return
        if task in visited:
            return
        visiting.add(task)
        for dep in graph.get(task, []):
            walk(dep)
        visiting.remove(task)
        visited.add(task)
    for task in graph:
        walk(task)
    return len(rq_rows), len(task_rows), len(screen_ids)


def check_contracts(full):
    files = sorted((ROOT / 'docs').rglob('*.json'))
    parsed = {p: json.loads(p.read_text()) for p in files}
    if not full:
        return len(parsed), 'JSON parsed; schema validation not requested'
    try:
        from jsonschema import Draft202012Validator
    except ImportError:
        errors.append('--full requires jsonschema; use docs/requirements-validation.txt in a virtualenv')
        return len(parsed), 'schema validator unavailable'
    for kind in ['analysis', 'enrichment']:
        schema = parsed[ROOT / f'docs/contracts/{kind}.schema.json']
        instance = parsed[ROOT / f'docs/fixtures/{kind}.sample.json']
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        for error in validator.iter_errors(instance):
            errors.append(f'{kind} sample at {list(error.path)}: {error.message}')
        bad = dict(instance, unexpectedField=True)
        check(not validator.is_valid(bad), f'{kind} accepts unexpected fields')
    analysis = parsed[ROOT / 'docs/fixtures/analysis.sample.json']
    evidence_ids = {e['id'] for e in analysis['evidence']}
    candidates = {}
    for category in ['vocabulary', 'sentences', 'patterns', 'grammar']:
        for item in analysis[category]:
            check(item['candidateId'] not in candidates, 'Duplicate fixture candidate ID')
            candidates[item['candidateId']] = category
            check(set(item['evidenceIds']) <= evidence_ids, f'Missing evidence for {item["candidateId"]}')
    enrich = parsed[ROOT / 'docs/fixtures/enrichment.sample.json']
    for item in enrich['items']:
        check(item['candidateId'] in candidates, f'Unknown enrichment candidate: {item["candidateId"]}')
        if item['itemType'] == 'vocabulary':
            check(item['sense'] is not None, 'Vocabulary enrichment must contain sense')
        for example in item['examples']:
            encoded = example['textEn'].encode('utf-16-le')
            token_ids = set()
            previous_end = 0
            for token in example['tokens']:
                check(token['id'] not in token_ids, 'Duplicate token ID')
                token_ids.add(token['id'])
                check(0 <= token['start'] < token['end'] <= len(encoded) // 2, 'Token out of bounds')
                check(token['start'] >= previous_end, 'Token overlap')
                previous_end = token['end']
                sliced = encoded[token['start'] * 2:token['end'] * 2].decode('utf-16-le')
                check(sliced == token['text'], f'Token text mismatch: {token}')
            for chunk in example['analysisChunks']:
                check(set(chunk['tokenIds']) <= token_ids, 'Chunk references missing token')
        mnemonic = item['mnemonic']
        if mnemonic:
            index = mnemonic['targetExampleIndex']
            check(index < len(item['examples']), 'Mnemonic target example absent')
            if index < len(item['examples']):
                ids = {t['id'] for t in item['examples'][index]['tokens']}
                for step in mnemonic['steps']:
                    check(set(step['highlightTokenIds']) <= ids, 'Mnemonic references missing token')
    return len(parsed), 'schemas + positive/negative fixtures + cross-references validated'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--full', action='store_true', help='Also validate JSON Schema with jsonschema')
    args = parser.parse_args()
    try:
        links = check_links()
        skills, resources = check_integrity()
        requirements, tasks, screens = check_traceability()
        json_count, schema_status = check_contracts(args.full)
    except Exception as exc:
        errors.append(f'Validation exception: {exc}')
    if errors:
        for error in errors:
            print(f'ERROR: {error}', file=sys.stderr)
        return 1
    print(f'PASS: {links} local links; {skills} skills/{resources} resources; {requirements} requirements/{tasks} tasks/{screens} screens; {json_count} JSON files.')
    print(schema_status)
    print('Planning validation only; no app/provider/cloud/device tests were run.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
