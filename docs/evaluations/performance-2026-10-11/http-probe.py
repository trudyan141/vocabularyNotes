# Anonymous public GET only. Never reads founder browser/session or writes account data.
import subprocess,json,re,pathlib,statistics,hashlib
out=pathlib.Path(__file__).parent
origin='https://words-for-kids.vercel.app'
report={'kind':'anonymous HTTP lab, not browser LCP/field metrics','routes':[],'assets':[]}
def fetch(path):
 h=pathlib.Path('/tmp/wfk-perf-http-head');b=pathlib.Path('/tmp/wfk-perf-http-body')
 result=subprocess.run(['curl','--compressed','-sS','--max-time','25','-D',str(h),'-o',str(b),'-w','%{json}',origin+path],capture_output=True,text=True,check=True)
 timing=json.loads(result.stdout);headers={}
 for line in h.read_text().splitlines():
  if ':' in line:
   key,value=line.split(':',1)
   if key.lower() in ['cache-control','x-vercel-cache','x-vercel-id','content-type','content-encoding','location','age']:headers[key.lower()]=value.strip()
 body=b.read_bytes()
 return {'path':path,'status':timing['http_code'],'ttfbMs':timing['time_starttransfer']*1000,'totalMs':timing['time_total']*1000,'dnsMs':timing['time_namelookup']*1000,'tlsMs':timing['time_appconnect']*1000,'wireBytes':timing['size_download'],'decodedBytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'headers':headers},body
for path in ['/','/welcome','/today']:
 rows=[]
 for i in range(5):
  row,body=fetch(path);rows.append(row)
 report['routes'].append({'path':path,'medianTtfbMs':statistics.median(r['ttfbMs'] for r in rows),'runs':rows})
 if path=='/':report['rootMetaRefresh']=re.findall(r'<meta[^>]+http-equiv="refresh"[^>]+>',body.decode())
 if path=='/welcome':
  html=body.decode();report['nomoduleScripts']=[re.search(r'src="([^"]+)"',tag).group(1) for tag in re.findall(r'<script[^>]+src="[^"]+"[^>]*>',html) if 'nomodule' in tag.lower()];scripts=list(dict.fromkeys(re.findall(r'<script[^>]+src="([^"]+)"',html)));fonts=list(dict.fromkeys(re.findall(r'href="([^\"]+\.woff2)"',html)));css=list(dict.fromkeys(re.findall(r'href="([^\"]+\.css)"',html)))
for path in scripts+fonts+css:
 if path.startswith('/'):
  row,_=fetch(path);report['assets'].append(row)
report['modernScriptDeclaredWireBytes']=sum(row['wireBytes'] for row in report['assets'] if row['path'].endswith('.js') and row['path'] not in report['nomoduleScripts'])
(out/'public-http.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'routes':[{'path':r['path'],'ttfbMedianMs':round(r['medianTtfbMs']),'rangeMs':[round(min(x['ttfbMs'] for x in r['runs'])),round(max(x['ttfbMs'] for x in r['runs']))]} for r in report['routes']],'rootMetaRefresh':report['rootMetaRefresh'],'assetCount':len(report['assets']),'scriptWireKiB':round(sum(r['wireBytes'] for r in report['assets'] if '.js' in r['path'])/1024,1)},ensure_ascii=False))
