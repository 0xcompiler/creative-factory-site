var API='http://127.0.0.1:8765', CLIENT_KEY='sbawlrsb325uujxc53';
var REDIRECT='https://0xcompiler.github.io/creative-factory-site/callback.html';
var chosen=null;
function $(i){return document.getElementById(i)}
function log(t,c){var d=document.createElement('div');d.textContent=t;if(c)d.className=c;$('log').appendChild(d)}
function j(path,opt){return fetch(API+path,opt).then(function(r){return r.json().then(function(b){if(!r.ok)throw new Error(b.detail||r.status);return b})})}
$('connect').onclick=function(){
  var s=Math.random().toString(36).slice(2);sessionStorage.setItem('cf_state',s);
  location.href='https://www.tiktok.com/v2/auth/authorize/?client_key='+CLIENT_KEY+'&scope=user.info.basic,video.upload&response_type=code&redirect_uri='+encodeURIComponent(REDIRECT)+'&state='+s;
};
function loadAccounts(){return j('/api/tiktok/accounts').then(function(a){
  $('acc').innerHTML='';
  if(!a.length){$('accounts').textContent='No account connected yet.';return}
  $('accounts').innerHTML='';
  a.forEach(function(x){var d=document.createElement('div');d.className='acc';
    d.innerHTML=(x.avatar?'<img src="'+x.avatar+'">':'')+'<b></b> <span class="muted"></span> <span class="ok">connected</span>';
    d.querySelector('b').textContent=x.name;d.querySelector('.muted').textContent=x.account;$('accounts').appendChild(d);
    var o=document.createElement('option');o.value=x.account;o.textContent=x.name+' ('+x.account+')';$('acc').appendChild(o)});
  upd()})}
function loadVideos(){return j('/api/videos').then(function(v){$('videos').innerHTML='';
  v.forEach(function(x){var d=document.createElement('div');d.className='vid';d.innerHTML='<b></b><div class="muted"></div>';
    d.querySelector('b').textContent=x.name;d.querySelector('.muted').textContent=x.series+' · '+x.mb+' MB';
    d.onclick=function(){document.querySelectorAll('.vid').forEach(function(e){e.classList.remove('sel')});d.classList.add('sel');chosen=x.id;upd()};
    $('videos').appendChild(d)})})}
function upd(){$('send').disabled=!(chosen&&$('acc').value)}
var LABEL={PROCESSING_UPLOAD:'TikTok is processing the upload...',SEND_TO_USER_INBOX:'Sent to your TikTok inbox. Open the notification in the TikTok app to finish and post.',PUBLISH_COMPLETE:'Posted from the TikTok app.',FAILED:'Failed'};
$('send').onclick=function(){
  var acc=$('acc').value;$('send').disabled=true;$('log').innerHTML='';log('Uploading '+chosen+' to '+acc+'...');
  j('/api/tiktok/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account:acc,video:chosen})})
  .then(function(r){log('Upload received by TikTok (publish_id '+r.publish_id+').','ok');var n=0,last='';
    var t=setInterval(function(){j('/api/tiktok/status?account='+encodeURIComponent(acc)+'&publish_id='+encodeURIComponent(r.publish_id)).then(function(s){
      var m=LABEL[s.status]||s.status;if(s.fail_reason)m+=': '+s.fail_reason;if(m!==last){log(m,s.status==='FAILED'?'err':'');last=m}
      if(['SEND_TO_USER_INBOX','PUBLISH_COMPLETE','FAILED'].indexOf(s.status)>=0||++n>40){clearInterval(t);upd()}})},5000)})
  .catch(function(e){log('Error: '+e.message,'err');upd()})};
j('/api/health').then(function(){$('conn').innerHTML='<span class="ok">Connector online</span>';loadAccounts();loadVideos()})
.catch(function(){$('conn').innerHTML='<span class="err">Connector offline. Start it on your computer to use this page.</span>'});
