const ytdl = require('ytdl-core');
const fs = require('fs');
const ytpl = require('ytpl');
const util = require('util');
var ProgressBar = require('progress');
var argv1 = process.argv.slice(2);
function telecharger_video(url, array, actuel, max){
       	url_ = url.replace(/\&.*$/,"");
	var id = url_.replace(/^.*=/i,"");
	try{
		ytdl.getInfo(id).then(info => {
			var title = info.videoDetails.title;
			var video = title.concat('',".mp4");
			var labarre = title.concat('' , ': [:bar] :percent :etas');
			ytdl(url_, { filter: 'audioandvideo' })
			 .on('response', function(res){
				bar = new ProgressBar(labarre, {
				complete : String.fromCharCode(0x2588),
				total    : parseInt(res.headers['content-length'], 10)	
		  	})
		 })
		 .on('data', function(data){
			 bar.tick(data.length);
		 })
		 .on('finish', function(){
			let msg = title.concat('', ': OK.');
		 	console.log(msg);
			if(max > 0 && actuel < max){
		 		telecharger_video(array[actuel+1], array, actuel+1, max);
			}
		 })
		 .pipe(fs.createWriteStream(video))
		});
	}catch{
		console.log(url_);
	}
}
const main = async function(url){
  let saveString;
  video = new Array();
  const url_ = url.toString();
  const id = url_.replace(/^.*=/i,"");
  const search = await ytpl(id, { limit: 15 });
  saveString = util.inspect(search, { depth: Infinity });
  var string = saveString.replace(/:\n/g,':');
  string = string.replace(/(\{|\{) /g, '$1\n');
  string = string.replace(/([a-zA-Z0-9]*):[ \t]+(.*[\,\n,\},\]])/g,'"$1":$2');
  string = string.replace(/^"/,"");
  string = string.replace(/"$/,"");
  string = string.replace(/'/g,'"');
  var myjson = JSON.parse(string);
  console.log("Playlist:");
  for(let x in myjson.items){
	 video[x] = myjson.items[x].url;
       	//video = myjson.items[x].url;
	console.log("fichier:%s [id = %s, url = %s]", myjson.items[x].title, myjson.items[x].id);
	//console.log(ret);
 }
 telecharger_video(video[0],video, 0, video.length);
}
let str = argv1.toString();
if(str.includes("playlist") === true){
	main(str);
}else{
	telecharger_video(str, 0, 0, -1);
}
