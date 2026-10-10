/* T18 interaction prototype. No OCR, OAuth, cloud, provider key or production SRS. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=WFK.icon, art=WFK.art, fox=WFK.fox;
  const state={view:'today',library:[],draft:null,saved:null,parent:false,tab:'words',query:'',lesson:'all',wordId:'apple',flash:null,game:null,result:null,prefs:{reduced:false,accent:'en-US'},error:null,analysisError:false};
  let analysisTimer=null,sceneTimer=null,sceneRemaining=2800,sceneStarted=0,sceneMode='idle',sceneKind='',pendingParent=null,modalOrigin=null,speechRequest=0;
  const osMotion=matchMedia('(prefers-reduced-motion: reduce)');
  try {
    const saved=JSON.parse(sessionStorage.getItem('wfk-prototype-v1')||'null');
    if(saved&&Array.isArray(saved.library)) {state.library=saved.library;state.draft=saved.draft;state.saved=saved.saved;state.prefs={...state.prefs,...saved.prefs};['view','wordId','query','lesson','flash','game','result'].forEach(k=>{if(saved[k]!=null)state[k]=saved[k]});}
  } catch { /* Storage may be disabled; keep the in-memory prototype usable. */ }
  if(new URLSearchParams(location.search).get('seed')==='1'&&!state.library.length) state.library=structuredClone(WFK.seed);
  function persist() {
    try {sessionStorage.setItem('wfk-prototype-v1',JSON.stringify({library:state.library,draft:state.draft,saved:state.saved,prefs:state.prefs,view:state.view,wordId:state.wordId,query:state.query,lesson:state.lesson,flash:state.flash,game:state.game,result:state.result}));}
    catch {notice('Trình duyệt không giữ được nháp khi tải lại. Bản thử vẫn dùng được trong lượt này.');}
  }
  function announce(text) {$('#announcer').textContent='';requestAnimationFrame(()=>$('#announcer').textContent=text);}
  function notice(text='') {$('#notice').textContent=text;if(text)announce(text);}
  function stopSound() {speechRequest++;if('speechSynthesis' in window)speechSynthesis.cancel();}
  function speak(text) {
    stopSound();
    if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)) {notice('Máy này chưa có giọng đọc. Con vẫn có thể xem từ và ví dụ.');return;}
    const voices=speechSynthesis.getVoices(), voice=voices.find(v=>v.lang===state.prefs.accent)||voices.find(v=>/^en[-_]/i.test(v.lang));
    if(!voice) {notice('Chưa tìm thấy giọng tiếng Anh trên máy. Bố mẹ có thể bật giọng tiếng Anh trong cài đặt thiết bị.');return;}
    const u=new SpeechSynthesisUtterance(text);u.lang=voice.lang;u.voice=voice;u.rate=.8;
    const request=speechRequest;
    u.onerror=ev=>{if(request===speechRequest&&!['canceled','interrupted'].includes(ev.error))notice('Chưa phát được âm thanh. Bấm Nghe để thử lại.');};
    speechSynthesis.speak(u);announce('Đang nghe: '+text);
  }
  function reduced() {return state.prefs.reduced||osMotion.matches;}
  function setMotion() {
    document.documentElement.dataset.reduced=String(reduced());
    $('#reduce-motion').checked=state.prefs.reduced;
    $('#motion-status').textContent=osMotion.matches?'Thiết bị đang yêu cầu giảm chuyển động.':state.prefs.reduced?'Chuyển động đã tắt, nội dung vẫn đầy đủ.':'Chuyển động ngắn, chỉ chạy khi bấm.';
    if(reduced()&&sceneMode==='playing')finishScene();
  }
  osMotion.addEventListener('change',setMotion);
  function clearScene() {clearTimeout(sceneTimer);sceneTimer=null;sceneMode='idle';sceneKind='';}
  function cleanup() {clearTimeout(analysisTimer);analysisTimer=null;stopSound();clearScene();}
  function go(view,{wordId,keepParent=false}={}) {
    const parents=['capture','preview','analyzing','review','settings','auth','sync','media'];
    if(parents.includes(view)&&!state.parent) {askParent(view);return;}
    cleanup();state.error=null;state.analysisError=false;state.view=view;
    if(wordId)state.wordId=wordId;
    if(!parents.includes(view)&&!keepParent)state.parent=false;
    history.replaceState(null,'','#'+view);
    render();$('#content').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
  }
  function modal(title,body) {
    modalOrigin=document.activeElement;
    $('#dialog-body').innerHTML='<h2 id="dialog-title">'+esc(title)+'</h2>'+body;
    if(!$('#sheet').open)$('#sheet').showModal();
  }
  function closeModal() {$('#sheet').close();if(modalOrigin?.isConnected)modalOrigin.focus();}
  $('#sheet').addEventListener('cancel',()=>{pendingParent=null;});
  function askParent(view) {
    stopSound();pendingParent=view;
    modal('Nhờ bố mẹ giúp nhé','<p>Chụp bài, sửa từ và cài đặt là phần dành cho bố mẹ.</p><button class="primary" data-action="enter-parent">Vào phần phụ huynh</button><p class="muted">Cổng minh họa trong bản thử, chưa là khóa bảo mật.</p>');
  }
  function btn(action,label,cls='secondary',extra='') {return '<button class="'+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';}
  function audio(text,label='Nghe') {return btn('speak',icon('sound')+label,'secondary audio','data-speech="'+esc(text)+'" aria-label="Nghe '+esc(text)+'"');}
  function entry(id) {return state.library.find(e=>e.id===id)||WFK.seed.find(e=>e.id===id)||WFK.capture.find(e=>e.id===id);}
  function missing(e) {return !e.ready||(e.id==='apple'&&$('#missing-image').checked);}
  function picture(e) {return art(e.art,missing(e));}
  function readyWords() {return state.library.filter(e=>!missing(e));}
  function row(e) {
    return '<div class="word-row"><div class="word-thumb">'+picture(e)+'</div><button class="word-open" data-action="word" data-id="'+esc(e.id)+'"><strong lang="en">'+esc(e.word)+'</strong><span>'+esc(e.vi)+'</span></button>'+audio(e.word,'')+'</div>';
  }
  function heading(title,subtitle='') {return '<h2>'+title+'</h2>'+(subtitle?'<p class="eyeline">'+subtitle+'</p>':'');}
  function brand() {return '<div class="brand">'+WFK.logo()+'<span>Words for Kids</span></div>';}
  function nav() {
    const shown=['today','library','word','sentence','practice'].includes(state.view);
    const active=['library','word','sentence'].includes(state.view)?'library':state.view;
    $('#app-nav').innerHTML=shown?['today','library','practice'].map((v,i)=>'<button data-action="nav" data-view="'+v+'"'+(active===v?' aria-current="page"':'')+'>'+icon(['home','book','cards'][i])+['Hôm nay','Từ của con','Chơi & học'][i]+'</button>').join(''):'';
  }
  function header() {
    const session=['flash','game'].includes(state.view);
    if(session) {
      const s=state[state.view],index=s?.index||0,len=s?.ids.length||0;
      $('#app-header').innerHTML='<div class="session-header">'+btn('exit-session',icon('close'),'back','aria-label="Thoát buổi học"')+'<div class="progress-wrap"><p>'+(Math.min(index+1,len))+' / '+len+'</p><progress value="'+index+'" max="'+len+'" aria-label="Tiến độ buổi học"></progress></div>'+btn('pause-session',icon(s?.paused?'play':'pause'),'back','aria-label="'+(s?.paused?'Tiếp tục':'Tạm dừng')+' buổi học"')+'</div>';
      return;
    }
    const childRoot=['today','library','practice','welcome'].includes(state.view);
    $('#app-header').innerHTML=(childRoot?brand():btn('back',icon('back'),'back','aria-label="Quay lại"')+'<strong>'+(['review','capture','preview','analyzing','settings','auth','sync','media'].includes(state.view)?'Phụ huynh':'Cùng học nhé')+'</strong>')+btn('parent',icon('lock')+'Phụ huynh','parent');
  }
  function today() {
    if(!state.library.length) return heading('Hôm nay','Cùng học thật vui nhé!')+'<div class="empty">'+fox()+'<h3>Bài đầu tiên của con</h3><p>Nhờ bố mẹ thêm tờ bài học. Rồi mình nghe, xem thẻ và chơi nhé!</p>'+btn('add',icon('camera')+'Nhờ bố mẹ thêm bài','primary')+'</div>';
    const n=Math.min(8,readyWords().length);
    return heading('Hôm nay','Cùng học thật vui nhé!')+'<section class="hero"><div class="hero-intro"><div><h3>Cùng ôn<br>'+n+' từ nhé!</h3><p>Nghe, chơi và nhớ</p></div>'+fox()+'</div>'+btn('start-game',icon('play')+'Chơi 5 phút','primary')+'</section><form id="today-search-form" class="search">'+icon('search')+'<input id="today-search" type="search" aria-label="Tìm từ của con" placeholder="Tìm từ của con…"><button class="search-submit" type="submit" aria-label="Tìm từ">'+icon('forward')+'</button></form><h3>Bài của con</h3>'+lessons()+'<h3>Từ gần đây</h3>'+state.library.slice(0,2).map(row).join('')+'<button class="add-row" data-action="add">'+icon('camera')+'<span>Thêm bài cho con<small>Thư viện minh họa trên máy</small></span>'+icon('lock')+'</button>';
  }
  function lessons() {
    const food=state.library.filter(e=>e.lesson==='food').length,school=state.library.filter(e=>e.lesson==='school').length;
    let groups=[];
    if(school)groups.push(['school','At school',school,2,'school']);
    if(food)groups.push(['food','Food & drinks',food,1,'apple']);
    if(state.saved)groups.unshift(['objects','School objects',state.saved.ids.length,state.saved.patterns.length,'bag']);
    return '<div class="lesson-grid">'+groups.map(([id,title,n,p,a])=>'<button class="lesson-tile" data-action="lesson" data-lesson="'+id+'"><span class="lesson-art">'+art(a)+'</span><strong lang="en">'+title+'</strong><small>'+n+' từ · '+p+' mẫu câu</small></button>').join('')+'</div>';
  }
  function library() {
    return heading('Từ của con','Tìm lại những gì mình đã học.')+'<label class="search">'+icon('search')+'<input id="library-search" type="search" value="'+esc(state.query)+'" aria-label="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt" placeholder="Từ hoặc nghĩa tiếng Việt…"></label><div class="pills"><button data-action="filter" data-lesson="all" aria-pressed="'+(state.lesson==='all')+'">Tất cả</button><button data-action="filter" data-lesson="objects" aria-pressed="'+(state.lesson==='objects')+'">School objects</button><button data-action="sentence">Câu & mẫu câu</button></div><div id="library-rows">'+libraryRows()+'</div>';
  }
  function libraryRows() {
    if(!state.library.length)return '<div class="empty"><h3>Chưa có từ nào</h3><p>Nhờ bố mẹ thêm bài để bắt đầu nhé.</p>'+btn('add','Nhờ bố mẹ thêm bài','primary')+'</div>';
    const ids=state.lesson==='objects'?state.saved?.ids:null,q=WFK.searchText(state.query.trim());
    const list=state.library.filter(e=>(state.lesson==='all'||(ids?ids.includes(e.id):e.lesson===state.lesson))&&WFK.searchText(e.word+' '+e.vi).includes(q));
    return list.length?'<p class="muted">'+list.length+' mục học</p>'+list.map(row).join(''):'<div class="empty"><h3>Chưa tìm thấy từ này</h3><p>Thử từ ngắn hơn hoặc bỏ lọc bài nhé.</p>'+btn('clear-search','Xem tất cả từ','primary')+'</div>';
  }
  function paper() {return '<div class="paper"><h3 lang="en">School objects</h3><div class="paper-grid">'+['pencil','book','eraser','bag','ruler','scissors'].map(id=>'<div>'+art(id)+'<span lang="en">'+id+'</span></div>').join('')+'</div><p lang="en">This is a pencil.<br>This is a book.</p><p class="muted">Tờ bài học minh họa, chưa phải ảnh camera.</p></div>';}
  function capture() {
    return '<div class="parent-view">'+heading('Thêm bài cho con','Chụp phần bài học tiếng Anh trên tờ giấy.')+'<div class="banner">Camera và tải ảnh chưa kết nối trong bản thử.</div>'+paper()+btn('sample-image',icon('image')+'Dùng tờ bài minh họa','primary')+'<div class="row-actions">'+btn('camera-info','Mở camera')+btn('upload-info','Chọn ảnh')+'</div></div>';
  }
  function preview() {
    return '<div class="parent-view">'+heading('Xem lại ảnh','Chọn đúng vùng bài học trước khi đọc.')+paper()+'<div class="crop-tools">'+btn('crop-info','Cắt')+btn('rotate-info','Xoay')+btn('retake','Chụp lại')+'</div><label class="field">Tên bài<input id="lesson-name" maxlength="80" value="'+esc(state.draft?.name||'School objects')+'"></label><label class="checkline"><input id="consent" type="checkbox" checked>Cho phép gửi ảnh để nhận dạng</label><p class="muted">Bản thử không gửi ảnh hay nội dung ra mạng. Khi nối AI thật, đây là lựa chọn của phụ huynh.</p>'+btn('analyze','Phân tích ảnh minh họa','primary')+'</div>';
  }
  function analyzing() {
    return '<div class="parent-view">'+heading('Đang đọc bài học','Đây là tiến trình mô phỏng, không gọi AI.')+'<div class="empty">'+fox()+'</div><div class="banner">'+(state.analysisError?'Chưa đọc được bài. Nháp vẫn được giữ.':'✓ Chuẩn bị ảnh<br>Đang nhận dạng nội dung…<br>Tiếp theo: kiểm tra kết quả')+'</div>'+(state.analysisError?btn('retry-analysis','Thử lại','primary'):'')+btn('cancel-analysis','Hủy và giữ nháp')+'</div>';
  }
  function review() {
    const d=state.draft,selected=d.candidates.filter(e=>e.selected),uncertain=d.candidates.filter(e=>e.uncertain).length,existing=d.candidates.filter(e=>e.existing).length;
    let rows;
    if(state.tab==='words') rows=d.candidates.map((e,i)=>'<div class="candidate"><label><input type="checkbox" data-candidate="'+i+'" aria-label="Chọn '+esc(e.text)+'" '+(e.selected?'checked':'')+' '+(e.uncertain?'disabled':'')+'></label><div><strong lang="en">'+esc(e.text)+'</strong><small>'+esc(e.vi)+'</small><span class="tag '+(e.uncertain?'uncertain':e.existing?'existing':'')+'">'+(e.uncertain?'! Cần sửa':e.existing?'Đã có':'Mới')+'</span></div><button data-action="edit-candidate" data-index="'+i+'" aria-label="Sửa từ '+esc(e.text)+'">Sửa</button></div>').join('');
    else if(state.tab==='sentences') rows=WFK.patterns.map((p,i)=>'<label class="candidate"><input type="checkbox" data-pattern="'+i+'" '+(d.patterns[i]?'checked':'')+'><span><strong lang="en">'+esc(p.en)+'</strong><small>'+esc(p.vi)+'</small></span></label>').join('');
    else rows='<div class="example"><h3 lang="en">This is a + thing.</h3><p>Giới thiệu một đồ vật.</p><p>Mẫu minh họa được chuẩn bị sẵn; phần giải thích bổ sung phải được duyệt khi nối AI.</p></div>';
    return '<div class="parent-view">'+heading('Duyệt bài học',esc(d.name)) +btn('original-image',icon('image')+'Xem ảnh minh họa')+'<div class="pills">'+[['words','Từ vựng'],['sentences','Câu'],['grammar','Ngữ pháp']].map(([t,label])=>'<button data-action="review-tab" data-tab="'+t+'" aria-pressed="'+(state.tab===t)+'">'+label+'</button>').join('')+'</div><div class="statline">'+(d.candidates.length-existing)+' mới · '+existing+' đã có'+(uncertain?' · 1 cần sửa':'')+'</div><p class="muted">Từ đã có sẽ được liên kết vào bài, không tạo thêm bản trùng. Chữ chưa rõ không được chọn sẵn.</p>'+rows+(state.error?'<div class="banner error" role="alert">'+esc(state.error)+'</div>':'')+'<div class="review-footer">'+btn('save',state.error?'Thử lưu lại '+selected.length+' từ':'Lưu '+selected.length+' từ đã chọn','primary',selected.length?'':'disabled')+'<small>'+d.patterns.filter(Boolean).length+' mẫu câu được chọn · nháp trong phiên tab</small></div></div>';
  }
  function savedLesson() {
    const s=state.saved;
    return heading('Bài đã lưu','Thư viện minh họa trong phiên tab.')+'<section class="hero"><div class="hero-intro"><div><h3>'+esc(s.name)+'</h3><p>✓ Đã lưu trong bản thử</p></div>'+fox()+'</div><div class="stats"><div><b>'+s.newCount+'</b>mới</div><div><b>'+s.existingCount+'</b>đã có</div><div><b>'+s.patterns.length+'</b>mẫu câu</div></div></section><h3>Các từ trong bài</h3>'+s.ids.slice(0,3).map(id=>row(entry(id))).join('')+btn('practice-saved',icon('play')+'Ôn bài này','primary')+btn('view-saved','Xem tất cả từ trong bài')+btn('add','Thêm ảnh khác','quiet');
  }
  function scene(kind,e) {
    const id='scene-'+kind;
    let content=kind==='word'?'<div class="word-scene">'+picture(e)+'<div><strong lang="en">'+esc(e.word)+'</strong><p>'+esc(e.vi)+'</p></div></div>':
      kind==='sentence'?'<span class="chunk" lang="en">I<small lang="vi">Ai? Tôi</small></span><span class="chunk" lang="en">am reading<small lang="vi">Đang làm gì? Đang đọc</small></span><span class="chunk" lang="en">a book.<small lang="vi">Đọc gì? Một quyển sách</small></span>':
      '<span class="chunk" lang="en">She<small lang="vi">Một người: cô ấy</small></span><span class="chunk" lang="en">like<span class="grammar-s">s</span><small lang="vi">Thêm s trong câu này</small></span><span class="chunk" lang="en">apples.</span><p lang="en">They like apples.</p><p>They là nhiều người, nên dùng like trong câu này.</p>';
    return '<div id="'+id+'" class="scene">'+content+'</div><div class="controls">'+btn('play-scene',icon('play')+'Phát','','data-scene="'+kind+'"')+btn('pause-scene',icon('pause')+'Tạm dừng','','data-scene="'+kind+'"')+btn('replay-scene','Xem lại','','data-scene="'+kind+'"')+'</div><p id="'+id+'-status" class="scene-status" role="status">Nội dung đầy đủ ngay cả khi không phát.</p>';
  }
  function word() {
    const e=entry(state.wordId),senses=state.library.filter(x=>WFK.norm(x.word)===WFK.norm(e.word));
    return '<div class="detail-art">'+picture(e)+'</div>'+(missing(e)?'<div class="banner">Chưa có hình phù hợp. Con vẫn có thể nghe và học bằng thẻ từ.</div>':'')+'<div class="detail-title"><h2 class="word-title" lang="en">'+esc(e.word)+'</h2>'+audio(e.word)+'</div><p class="muted">'+e.pos+'</p>'+(senses.length>1?'<div class="pills" aria-label="Chọn nghĩa của từ">'+senses.map(x=>'<button data-action="word" data-id="'+x.id+'" aria-pressed="'+(x.id===e.id)+'">'+esc(x.id==='bank-money'?'Ngân hàng':'Bờ sông')+'</button>').join('')+'</div>':'')+'<p class="meaning">'+esc(e.vi)+'</p><p lang="en">'+esc(e.en)+'</p><div class="example"><p lang="en">'+esc(e.example)+'</p><p lang="vi">'+esc(e.exampleVi)+'</p>'+audio(e.example,'Nghe câu')+'</div>'+btn('practice-word',icon('cards')+'Ôn từ này','primary','data-id="'+e.id+'"')+'<details class="expand"><summary>'+icon('bulb')+'Mẹo nhớ</summary>'+scene('word',e)+'</details><details class="expand"><summary>Ví dụ và nguồn</summary><p>'+esc(e.source)+'. Chưa có liên kết ảnh trích thật.</p><p>Ví dụ trong bản thử đã được chuẩn bị sẵn.</p></details>'+btn('choose-image',icon('lock')+'Chọn hình · Phụ huynh','quiet','data-id="'+e.id+'"');
  }
  function sentence() {
    return heading('Cùng hiểu câu này','Xem từng cụm rồi nghe cả câu nhé.')+scene('sentence')+'<div class="example"><p lang="en">I am reading a book.</p><p lang="vi">Tôi đang đọc một quyển sách.</p>'+audio('I am reading a book.','Nghe cả câu')+'</div><h3>Đang xảy ra bây giờ</h3><p>Câu này nói về một việc đang diễn ra ngay lúc này.</p><details class="expand"><summary>Thử câu khác</summary><p lang="en">She is reading a book.</p><p>Cô ấy đang đọc một quyển sách.</p></details><details class="expand"><summary>Mẹo nhớ phần s</summary>'+scene('grammar')+'<p>Đây là hai ví dụ đã chuẩn bị, không phải quy tắc cho mọi động từ hay mọi thì.</p></details>'+btn('start-flash','Ôn bằng thẻ từ','primary');
  }
  function practice() {
    if(!state.library.length)return heading('Chơi & học')+'<div class="empty">'+fox()+'<h3>Mình cần một bài học</h3><p>Nhờ bố mẹ thêm bài rồi mình chơi nhé.</p>'+btn('add','Nhờ bố mẹ thêm bài','primary')+'</div>';
    const n=Math.min(10,readyWords().length);
    return heading('Mình chơi gì nhỉ?','Nghe, chọn hình và nhớ thêm mỗi ngày.')+'<div class="hero"><div class="hero-intro"><div><h3>Nghe và<br>chọn hình</h3><p>'+n+' câu · khoảng 5 phút</p></div>'+fox()+'</div>'+btn('start-game',icon('play')+'Bắt đầu chơi','primary',n?'':'disabled')+'</div>'+(!n?'<div class="banner">Bài chưa có hình đã sẵn sàng. Dùng thẻ từ trước nhé.</div>':'')+btn('start-flash',icon('cards')+'Học bằng thẻ')+'<details class="expand"><summary>Đổi cách chơi</summary>'+[['G01','Nhìn hình, chọn từ'],['G02','Nghe, chọn hình'],['G03','Điền chữ còn thiếu'],['G04','Gõ đầy đủ từ']].map(([id,label])=>btn('start-mode',label,'secondary','data-mode="'+id+'"')).join('')+'</details><h3 class="section-heading">Chọn bài</h3>'+lessons();
  }
  function startFlash(ids) {
    const list=ids||state.library.map(e=>e.id).slice(0,10);
    if(!list.length){notice('Chưa có từ để ôn. Nhờ bố mẹ thêm bài nhé.');return;}
    state.flash={ids:list,index:0,revealed:false,paused:false,ratings:[]};go('flash');
  }
  function flash() {
    const s=state.flash,e=entry(s.ids[s.index]);
    if(s.paused)return '<div class="pause-banner"><h2>Mình nghỉ một chút</h2><p>Thẻ đang học vẫn được giữ.</p>'+btn('pause-session','Học tiếp','primary')+'</div>';
    return '<div class="flash-card '+(s.revealed?'revealed':'')+'"><div class="flash-picture">'+picture(e)+'</div><div class="flash-copy"><h2 lang="en">'+esc(e.word)+'</h2>'+audio(e.word)+(s.revealed?'<p class="meaning">'+esc(e.vi)+'</p><p lang="en">'+esc(e.example)+'</p>':btn('reveal','Xem nghĩa','primary'))+'</div></div>'+(s.revealed?'<h3>Con nhớ từ này chưa?</h3><div class="ratings">'+btn('rate','Chưa nhớ','secondary','data-rating="Again"')+btn('rate','Nhớ rồi','primary','data-rating="Good"')+'</div><details class="expand"><summary>Đánh giá chi tiết</summary>'+btn('rate','Hơi khó','secondary','data-rating="Hard"')+btn('rate','Rất dễ','secondary','data-rating="Easy"')+'</details>':'<p class="muted">Bấm Nghe hoặc Xem nghĩa nhé.</p>');
  }
  function startGame(mode='G02',ids) {
    const requiresImage=['G01','G02'].includes(mode),pool=(ids||state.library.map(e=>e.id)).filter(id=>!requiresImage||!missing(entry(id))).slice(0,10);
    if(requiresImage&&pool.length<3){notice('Cần ít nhất ba từ có hình để chọn đáp án. Con có thể học bằng thẻ hoặc chơi điền từ.');return;}
    if(!pool.length){notice('Chưa có từ để chơi. Nhờ bố mẹ thêm bài nhé.');return;}
    state.game={mode,ids:pool,index:0,paused:false,answers:[],answered:false,choice:null,hint:false,typed:''};go('game');
  }
  function options(s) {
    const right=s.ids[s.index],other=s.ids.filter(id=>id!==right).slice(0,2),list=[right,...other];
    const rotate=s.index%3;return list.slice(rotate).concat(list.slice(0,rotate));
  }
  function game() {
    const s=state.game,e=entry(s.ids[s.index]),names={G01:'Nhìn hình, chọn từ',G02:'Nghe và chọn hình',G03:'Điền chữ còn thiếu',G04:'Gõ đầy đủ từ'};
    if(s.paused)return '<div class="pause-banner"><h2>Mình nghỉ một chút</h2><p>Câu đang chơi vẫn được giữ.</p>'+btn('pause-session','Chơi tiếp','primary')+'</div>';
    let prompt=s.mode==='G01'?'<div class="detail-art">'+picture(e)+'</div>':'<div class="game-prompt">'+audio(e.word)+(s.mode==='G02'?'<strong lang="en">'+esc(e.word)+'</strong>':'')+'</div>';
    let answers;
    if(['G01','G02'].includes(s.mode)) answers='<div class="answer-grid '+(s.mode==='G01'?'text-options':'')+'">'+options(s).map((id,i)=>{
      const chosen=s.choice===id,correct=s.answered&&id===e.id,wrong=s.answered&&chosen&&id!==e.id;
      return '<button class="answer-option '+(correct?'correct':wrong?'wrong':'')+'" data-action="answer" data-id="'+id+'" '+(s.answered?'disabled':'')+' aria-label="'+(s.mode==='G01'?esc(entry(id).word):'Chọn hình '+esc(entry(id).vi))+'">'+(s.mode==='G01'?'<span lang="en">'+esc(entry(id).word)+'</span>':picture(entry(id)))+(correct||wrong?'<span class="answer-mark">'+icon(correct?'check':'close')+'</span>':'')+'</button>';
    }).join('')+'</div>';
    else answers='<form id="word-answer"><div class="detail-art">'+picture(e)+'</div>'+(s.mode==='G03'?'<h3 lang="en">'+esc(e.word.slice(0,1)+'_'+e.word.slice(2))+'</h3>':'')+'<label class="field">'+(s.mode==='G03'?'Điền chữ còn thiếu':'Viết đầy đủ từ tiếng Anh')+'<input id="typed-answer" '+(s.mode==='G03'?'maxlength="1"':'maxlength="80"')+' autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(s.typed)+'" '+(s.answered?'disabled':'')+' required aria-label="'+(s.mode==='G03'?'Điền chữ còn thiếu':'Viết đầy đủ từ tiếng Anh')+'"></label>'+(!s.answered?'<button class="primary" type="submit">Kiểm tra</button>':'')+'</form>';
    const last=s.answers[s.answers.length-1],feedback=s.answered?'<div class="answer-feedback '+(last.correct?'success':'review')+'" role="status"><span class="feedback-icon">'+icon(last.correct?'check':'bulb')+'</span><div><strong>'+(last.skipped?'Cùng xem lại nhé':last.correct?'Đúng rồi!':'Mình nhớ lại nhé')+'</strong><p><span lang="en">'+esc(e.word)+'</span> · '+esc(e.vi)+'</p></div></div>'+btn('next-question',s.index+1===s.ids.length?'Xem kết quả':'Câu tiếp theo','primary'):
      (s.hint?'<div class="banner">Gợi ý: '+esc(e.vi)+'</div>':'')+'<div class="row-actions">'+btn('hint',icon('bulb')+'Gợi ý','quiet')+btn('skip','Bỏ qua câu này','quiet')+'</div>';
    return '<div class="game-view">'+heading(names[s.mode])+prompt+answers+feedback+'</div>';
  }
  function answer(choice,skipped=false) {
    const s=state.game;if(!s||s.answered||s.paused)return;
    const e=entry(s.ids[s.index]),correct=!skipped&&(s.mode==='G01'||s.mode==='G02'?choice===e.id:WFK.norm(choice)===WFK.norm(s.mode==='G03'?e.word[1]:e.word));
    s.answered=true;s.choice=choice;s.typed=choice;s.answers.push({id:e.id,correct,skipped,hint:s.hint});render();$('#content [data-action=next-question]')?.focus({preventScroll:true});announce(correct?'Đúng rồi. '+e.word:'Cùng xem lại: '+e.word);
  }
  function results() {
    const r=state.result;
    if(r.type==='flash')return heading('Con đã ôn thật vui!')+'<div class="empty">'+fox()+'</div><div class="statline">'+r.ratings.length+' thẻ đã ôn</div><p>Lựa chọn của con giúp lên lịch ôn khi app thật được xây. Prototype chưa tính lịch SRS.</p>'+btn('start-game','Chơi chọn hình','primary')+btn('home','Về Hôm nay');
    const correct=r.answers.filter(a=>a.correct).length,skipped=r.answers.filter(a=>a.skipped).length,wrong=r.answers.length-correct-skipped,hard=r.answers.filter(a=>!a.correct).map(a=>a.id);
    return heading('Con chơi xong rồi!')+'<section class="result-hero"><div class="result-lead"><div><h3>'+r.answers.length+' câu đã chơi</h3><p>Mình ôn thêm chút nhé!</p></div>'+fox()+'</div><div class="result-stats"><div class="score-good">'+icon('check')+'<b>'+correct+'</b><span>đúng</span></div><div class="score-wrong">'+icon('close')+'<b>'+wrong+'</b><span>sai</span></div><div class="score-skip">'+icon('forward')+'<b>'+skipped+'</b><span>bỏ qua</span></div></div><p class="hint-note">'+icon('bulb')+'Gợi ý ở '+r.answers.filter(a=>a.hint).length+' câu</p></section><h3 class="section-heading">Cùng xem lại</h3>'+hard.slice(0,3).map(id=>row(entry(id))).join('')+(hard.length?btn('review-hard','Ôn lại từ khó','primary'):btn('start-flash','Xem thẻ từ','primary'))+btn('home','Về Hôm nay');
  }
  function settings() {
    return '<div class="parent-view">'+heading('Phụ huynh','Thư viện minh họa trong phiên tab này.')+btn('add',icon('camera')+'Thêm bài cho con','primary')+'<h3 class="section-heading">Cài đặt học</h3><div class="paper"><p>Tiếng Việt · Beginner · Chế độ trẻ em</p><label class="field">Giọng tiếng Anh<select id="accent"><option value="en-US" '+(state.prefs.accent==='en-US'?'selected':'')+'>Tiếng Anh Mỹ</option><option value="en-GB" '+(state.prefs.accent==='en-GB'?'selected':'')+'>Tiếng Anh Anh</option></select></label><label class="checkline"><input type="checkbox" id="parent-reduced" '+(state.prefs.reduced?'checked':'')+'>Giảm chuyển động</label></div><h3>Trí tuệ nhân tạo (AI)</h3><div class="banner"><strong>AI chưa cấu hình</strong><p>Cần chọn dịch vụ phù hợp app cho trẻ trước khi nối. Bản thử không có ô nhập key.</p><button class="secondary" disabled>Cài đặt AI</button></div>'+btn('media','Chọn hình minh họa')+btn('auth','Xem màn đăng nhập Google')+btn('export','Xuất dữ liệu bản thử')+btn('delete-demo','Xóa dữ liệu bản thử trong tab','quiet')+'</div>';
  }
  function auth() {return '<div class="parent-view">'+heading('Giữ bài học của con')+'<div class="empty">'+fox()+'</div><div class="banner">Google chưa kết nối. Đăng nhập sẽ là bước riêng với gộp dữ liệu.</div>'+btn('oauth-info','Đăng nhập Google','primary')+btn('sync','Xem minh họa gộp thư viện')+btn('home','Tiếp tục trên máy')+'</div>';}
  function sync() {return '<div class="parent-view">'+heading('Gộp thư viện','Màn preview minh họa, không chuyển dữ liệu thật.')+'<div class="statline">20 từ trên máy → 12 mới + 8 đã có</div><p>Nghĩa khác được giữ riêng. Dữ liệu trên máy được giữ sau khi gộp.</p>'+btn('export','Xuất dữ liệu bản thử')+'<button class="primary" disabled>Gộp lên tài khoản này</button><p class="muted">Cần Google/cloud thật trước khi gộp.</p>'+btn('home','Giữ riêng trên máy')+'</div>';}
  function media() {
    const e=entry(state.wordId)||entry('apple');
    return '<div class="parent-view">'+heading('Chọn hình cho '+esc(e.word),'Hình SVG minh họa đã được chuẩn bị trong bản thử.')+'<div class="detail-art">'+art(e.art,!e.art)+'</div><p>Hình prototype được viết trong repo. Search ảnh mạng, kiểm license và cache chưa kết nối.</p>'+btn('approve-image','Dùng hình minh họa này','primary','data-id="'+e.id+'" '+(e.art?'':'disabled'))+btn('word-back','Giữ hình hiện tại')+'</div>';
  }
  function render() {
    document.body.classList.toggle('inspection-mode',new URLSearchParams(location.search).get('inspect')==='1');
    document.body.dataset.view=state.view;
    header();nav();notice('');
    const views={today,library,capture,preview,analyzing,review,saved:savedLesson,word,sentence,practice,flash,game,results,settings,auth,sync,media,welcome:()=>heading('Cùng học từ mới!')+'<div class="empty">'+fox()+'<p>Lưu bài đã học, nghe và chơi mỗi ngày.</p>'+btn('home','Bắt đầu','primary')+btn('auth','Phụ huynh: Đăng nhập Google')+'</div>'};
    $('#content').innerHTML='<div class="view">'+(views[state.view]||today)()+'</div>';
    $('#phone').dataset.screen=({today:'S03',review:'S07',word:'S09',flash:'S12',game:'S13',capture:'S04',preview:'S05',analyzing:'S06',saved:'S08',sentence:'S10',practice:'S11',results:'S14',auth:'S02',sync:'S15',settings:'S16',welcome:'S01'}[state.view]||'S09');
    setMotion();persist();
  }
  function prepareDraft() {
    if(!state.draft){
      if(!state.library.length)state.library=structuredClone(WFK.seed.filter(e=>['book','bag','pen'].includes(e.id)));
      state.draft={name:'School objects',candidates:WFK.candidates(),patterns:[true,true]};
      state.draft.candidates.forEach(c=>c.existing=state.library.some(e=>WFK.key(e)===WFK.key(c)));
    }
    persist();
  }
  function runAnalysis() {
    prepareDraft();go('analyzing');
    analysisTimer=setTimeout(()=>{
      if($('#fail-analysis').checked){state.analysisError=true;render();announce('Chưa đọc được bài. Nháp được giữ.');}
      else go('review',{keepParent:true});
    },800);
  }
  function saveDraft() {
    if($('#fail-save').checked){$('#fail-save').checked=false;state.error='Chưa lưu được. Những từ đã sửa và chọn vẫn được giữ. Bấm Thử lưu lại.';render();announce(state.error);return;}
    const selected=state.draft.candidates.filter(e=>e.selected&&!e.uncertain),keys=new Map(state.library.map(e=>[WFK.key(e),e.id]));
    const next=[...state.library],ids=[];let newCount=0,existingCount=0;
    selected.forEach(c=>{
      const e={...c,word:c.text.trim()},key=WFK.key(e);
      if(keys.has(key)){const id=keys.get(key);if(!ids.includes(id)){ids.push(id);existingCount++;}}
      else {next.push(e);keys.set(key,e.id);ids.push(e.id);newCount++;}
    });
    state.library=next;state.saved={name:state.draft.name,ids:[...new Set(ids)],newCount,existingCount,patterns:WFK.patterns.filter((_,i)=>state.draft.patterns[i])};persist();go('saved');
  }
  function editCandidate(index) {
    const c=state.draft.candidates[index];
    modal('Sửa từ trong bài','<form id="candidate-form" data-index="'+index+'"><label class="field">Từ tiếng Anh<input id="candidate-word" maxlength="80" value="'+esc(c.text)+'" required></label><label class="field">Nghĩa tiếng Việt<input id="candidate-meaning" maxlength="180" value="'+esc(c.vi)+'" required></label><label class="checkline"><input type="checkbox" id="candidate-verified" '+(!c.uncertain?'checked':'')+' required>Đã kiểm tra với bài học</label><button class="primary" type="submit">Lưu sửa và chọn từ</button><p class="muted">Bản thử chỉ có nghĩa/ví dụ đã chuẩn bị cho các từ trong fixture. Đổi sang từ khác cần nội dung mới khi triển khai thật.</p></form>');
  }
  function sceneStatus(kind,text) {const el=$('#scene-'+kind+'-status');if(el)el.textContent=text;}
  function finishScene() {
    clearTimeout(sceneTimer);const el=$('#scene-'+sceneKind);
    if(el){el.classList.remove('playing','paused');el.classList.add('finished');sceneStatus(sceneKind,reduced()?'Giảm chuyển động: xem đầy đủ nội dung tĩnh.':'Đã xem xong. Bấm Xem lại nếu muốn.');}
    sceneMode='finished';
  }
  function playScene(kind,replay=false) {
    if(sceneKind&&sceneKind!==kind){const old=$('#scene-'+sceneKind);old?.classList.remove('playing','paused');}
    const el=$('#scene-'+kind);if(!el)return;
    clearTimeout(sceneTimer);
    const resume=sceneKind===kind&&sceneMode==='paused'&&!replay;
    sceneKind=kind;
    if(reduced()){finishScene();return;}
    if(!resume){el.classList.remove('playing','paused','finished');void el.offsetWidth;sceneRemaining=2800;}
    sceneMode='playing';sceneStarted=performance.now();el.classList.add('playing');el.classList.remove('paused');sceneStatus(kind,'Đang phát mẹo nhớ.');
    sceneTimer=setTimeout(finishScene,sceneRemaining);
  }
  function pauseScene(kind=sceneKind) {
    if(sceneMode!=='playing'||kind!==sceneKind)return;
    sceneRemaining=Math.max(0,sceneRemaining-(performance.now()-sceneStarted));clearTimeout(sceneTimer);sceneMode='paused';
    $('#scene-'+kind)?.classList.add('paused');sceneStatus(kind,'Đã tạm dừng. Bấm Phát để tiếp tục.');
  }
  function exitSession() {stopSound();modal('Tạm dừng buổi học?','<p>Con có thể nghỉ rồi tiếp tục trong bản thử này.</p>'+btn('leave-session','Về Chơi & học','primary')+btn('close-dialog','Học tiếp'));}
  const actions={
    nav:b=>go(b.dataset.view),home:()=>go('today'),parent:()=>askParent('settings'),add:()=>state.parent?go('capture'):askParent('capture'),
    back:()=>go(({capture:'today',preview:'capture',analyzing:'preview',review:'preview',saved:'today',word:'library',sentence:'library',settings:'today',auth:'settings',sync:'settings',media:'word'})[state.view]||'today'),
    'enter-parent':()=>{const dest=pendingParent||'settings';pendingParent=null;state.parent=true;closeModal();go(dest,{keepParent:true});},
    'close-dialog':closeModal,speak:b=>speak(b.dataset.speech),
    'sample-image':()=>{prepareDraft();go('preview',{keepParent:true});},
    'camera-info':()=>notice('Camera chưa kết nối. Dùng tờ bài minh họa để thử luồng.'),
    'upload-info':()=>notice('Tải ảnh chưa kết nối. Bản thử không nhận ảnh thật.'),
    'crop-info':()=>notice('Cắt ảnh chưa kết nối. Vùng bài minh họa đã được chuẩn bị.'),
    'rotate-info':()=>notice('Xoay ảnh chưa kết nối trong bản thử.'),retake:()=>go('capture',{keepParent:true}),
    analyze:()=>{if(!$('#consent').checked){notice('Bố mẹ cần cho phép nhận dạng hoặc quay lại giữ nháp.');return;}state.draft.name=$('#lesson-name').value.trim()||'School objects';persist();runAnalysis();},
    'retry-analysis':()=>{$('#fail-analysis').checked=false;runAnalysis();},
    'cancel-analysis':()=>go('preview',{keepParent:true}),
    'original-image':()=>modal('Tờ bài minh họa',paper()),
    'review-tab':b=>{state.tab=b.dataset.tab;render();},'edit-candidate':b=>editCandidate(Number(b.dataset.index)),save:saveDraft,
    word:b=>go('word',{wordId:b.dataset.id}), 'word-back':()=>go('word'),
    'practice-word':b=>startFlash([b.dataset.id]),'practice-saved':()=>startFlash(state.saved.ids),
    'view-saved':()=>{state.lesson='objects';state.query='';go('library');},
    lesson:b=>{state.lesson=b.dataset.lesson;state.query='';go('library');},
    filter:b=>{state.lesson=b.dataset.lesson;render();},
    'clear-search':()=>{state.query='';state.lesson='all';render();},
    sentence:()=>go('sentence'), 'start-flash':()=>startFlash(),
    'start-game':()=>startGame(), 'start-mode':b=>startGame(b.dataset.mode),
    reveal:()=>{if(state.flash.paused||state.flash.revealed)return;state.flash.revealed=true;render();$('#content .ratings button')?.focus({preventScroll:true});announce('Nghĩa: '+entry(state.flash.ids[state.flash.index]).vi);},
    rate:b=>{const s=state.flash;if(!s||s.paused||!s.revealed)return;s.ratings.push({id:s.ids[s.index],rating:b.dataset.rating});s.revealed=false;s.index++;stopSound();if(s.index===s.ids.length){state.result={type:'flash',ratings:s.ratings};go('results');}else {render();$('#content [data-action=reveal]')?.focus({preventScroll:true});}},
    answer:b=>answer(b.dataset.id),hint:()=>{if(state.game.answered||state.game.paused)return;state.game.hint=true;render();},
    skip:()=>answer(null,true),
    'next-question':()=>{const s=state.game;if(!s.answered)return;stopSound();s.index++;s.answered=false;s.choice=null;s.hint=false;s.typed='';if(s.index===s.ids.length){state.result={type:'game',answers:s.answers};go('results');}else {render();$('#content .audio')?.focus({preventScroll:true});}},
    'review-hard':()=>startFlash(state.result.answers.filter(a=>!a.correct).map(a=>a.id)),
    'pause-session':()=>{const s=state[state.view];if(!s)return;s.paused=!s.paused;stopSound();render();},
    'exit-session':exitSession,'leave-session':()=>{closeModal();go('practice');},
    'play-scene':b=>playScene(b.dataset.scene),'pause-scene':b=>pauseScene(b.dataset.scene),'replay-scene':b=>playScene(b.dataset.scene,true),
    'choose-image':b=>{state.wordId=b.dataset.id;state.parent?go('media'):askParent('media');},
    'approve-image':b=>{const e=state.library.find(e=>e.id===b.dataset.id);if(e?.art){e.ready=true;if(e.id==='apple')$('#missing-image').checked=false;persist();}go('word');notice('Đã chọn hình minh họa. Search ảnh mạng chưa kết nối.');},
    auth:()=>go('auth'),sync:()=>go('sync'),media:()=>go('media'),
    'oauth-info':()=>notice('Google chưa kết nối. Chưa đăng nhập hoặc chuyển dữ liệu.'),
    export:()=>{const blob=new Blob([JSON.stringify({prototype:true,product:'Words for Kids',library:state.library},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='words-for-kids-prototype.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Đã xuất dữ liệu minh họa của bản thử.');},
    'delete-demo':()=>modal('Xóa dữ liệu bản thử trong tab?','<p>Chỉ dữ liệu minh họa của tab này sẽ bị xóa. Có thể nạp lại bài mẫu bằng công cụ thử.</p>'+btn('confirm-delete','Xóa dữ liệu bản thử','primary')),
    'confirm-delete':()=>{closeModal();reset();},
    'reset-empty':()=>reset(),'seed':()=>{state.library=structuredClone(WFK.seed);state.saved=null;state.draft=null;persist();go('today');},
    'show-review':()=>{if(!state.library.length)state.library=structuredClone(WFK.seed.filter(e=>['book','bag','pen'].includes(e.id)));prepareDraft();state.parent=true;go('review',{keepParent:true});},
    'show-apple':()=>{if(!state.library.length)state.library=structuredClone(WFK.seed);persist();go('word',{wordId:'apple'});},
    'show-bank':()=>{if(!state.library.length)state.library=structuredClone(WFK.seed);persist();go('word',{wordId:'bank-money'});},
    'show-flash':()=>{if(!state.library.length)state.library=structuredClone(WFK.seed);persist();startFlash();},
    'show-game':()=>{if(!state.library.length)state.library=structuredClone(WFK.seed);persist();startGame();},
    'show-sentence':()=>go('sentence')
  };
  function reset(){cleanup();state.library=[];state.saved=null;state.draft=null;state.result=null;state.flash=null;state.game=null;state.query='';state.lesson='all';persist();go('today');}
  document.addEventListener('click',ev=>{const b=ev.target.closest('[data-action]');if(b&&!b.disabled)actions[b.dataset.action]?.(b);});
  document.addEventListener('input',ev=>{
    if(ev.target.id==='library-search'){state.query=ev.target.value;$('#library-rows').innerHTML=libraryRows();persist();}
    if(ev.target.id==='typed-answer'&&state.game)state.game.typed=ev.target.value;
  });
  document.addEventListener('change',ev=>{
    const el=ev.target;
    if(el.hasAttribute('data-candidate')){const index=Number(el.dataset.candidate);state.draft.candidates[index].selected=el.checked;persist();render();$('#content [data-candidate="'+index+'"]')?.focus({preventScroll:true});}
    if(el.hasAttribute('data-pattern')){state.draft.patterns[Number(el.dataset.pattern)]=el.checked;persist();render();}
    if(['reduce-motion','parent-reduced'].includes(el.id)){state.prefs.reduced=el.checked;persist();setMotion();const p=$('#parent-reduced');if(p)p.checked=el.checked;}
    if(el.id==='accent'){state.prefs.accent=el.value;persist();stopSound();}
    if(el.id==='missing-image'){render();}
  });
  document.addEventListener('submit',ev=>{
    if(ev.target.id==='today-search-form'){ev.preventDefault();state.query=$('#today-search').value;state.lesson='all';go('library');}
    if(ev.target.id==='candidate-form'){
      ev.preventDefault();const i=Number(ev.target.dataset.index),c=state.draft.candidates[i],text=$('#candidate-word').value.trim(),vi=$('#candidate-meaning').value.trim();
      if(!text||!vi||!$('#candidate-verified').checked)return;
      const known=[...WFK.capture,...WFK.seed].find(e=>WFK.norm(e.word)===WFK.norm(text)&&e.sense===c.sense)||[...WFK.capture,...WFK.seed].find(e=>WFK.norm(e.word)===WFK.norm(text));
      if(!known){let err=$('#candidate-error');if(!err){err=document.createElement('p');err.id='candidate-error';err.setAttribute('role','alert');ev.target.append(err);}err.textContent='Từ này chưa có nội dung minh họa. Thử sửa thành một từ trong tờ mẫu, như eraser. App thật sẽ bổ sung nội dung mới.';return;}
      Object.assign(c,known,{text,vi,uncertain:false,selected:true,existing:state.library.some(e=>WFK.key(e)===WFK.key(known))});
      persist();closeModal();render();$('#content [data-action=edit-candidate][data-index="'+i+'"]')?.focus({preventScroll:true});announce('Đã sửa '+text+' và chọn để lưu.');
    }
    if(ev.target.id==='word-answer'){ev.preventDefault();answer($('#typed-answer').value);}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){stopSound();pauseScene();const s=state[state.view];if(s&&['flash','game'].includes(state.view)){s.paused=true;render();}}
  });
  window.addEventListener('pagehide',cleanup);
  $('#content').addEventListener('toggle',ev=>{if(ev.target.tagName==='DETAILS'&&!ev.target.open)pauseScene();},true);
  if(['capture','preview','analyzing','review','settings','auth','sync','media'].includes(state.view))state.parent=true;
  if(state.view==='analyzing')state.view='preview';
  if(!['today','library','capture','preview','review','saved','word','sentence','practice','flash','game','results','settings','auth','sync','media','welcome'].includes(state.view))state.view='today';
  if(state.view==='game'&&!state.game)state.view='practice';
  if(state.view==='flash'&&!state.flash)state.view='practice';
  setMotion();render();persist();
})();
