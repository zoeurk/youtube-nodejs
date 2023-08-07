const ytdl = require('ytdl-core');
const fs = require('fs');
const ytpl = require('ytpl');
const util = require('util');
const readline = require('readline');
const args = require('yargs').argv;
var filter_opt = 'audioandvideo';
var quality_opt = '136';
//var chunk = 0;
function telecharger_video(url, array, actuel, max){
       	url_ = url.replace(/\&.*$/,"");
	var id = url_.replace(/^.*=/i,"");
	if(ytdl.validateURL(url_) === false){
		console.log("url invalid: %s", url_);
		process.exit(255);
	}
	try{
		ytdl.getInfo(id).then(info => {
			var titre;
			var title = info.videoDetails.title;
			var video = title.concat('',".mp4");
			var labarre = title.concat('' , ': [:bar] :percent :etas');
			const video_ = ytdl(url_, {filter: filter_opt}, {quality: quality_opt}) //, {djChunkSize : 10}
			video_.once('response', () => {
				starttime = Date.now();
			 });
			video_.on('progress', (chunkLength, downloaded, total) => {
				const percent = downloaded / total;
				const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
				const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
				readline.cursorTo(process.stdout, 0);
				if(title.length > 32){
					titre = title.replace(/(^.{29}).*$/, "$1...");
				}else{
					titre = title;
				}
				process.stdout.write(`${titre}: ${(percent * 100).toFixed(2)}% downloaded `);
				process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
				process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
				process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
				readline.moveCursor(process.stdout, 0, -1);
			  });
			 video_.on('end', () => {
				process.stdout.write('\n\n');
				let msg = title.concat('', ': OK.');
		 		console.log(msg);
				if(max > 0 && actuel < max){
		 			telecharger_video(array[actuel+1], array, actuel+1, max);
				}
			  });
			 video_.pipe(fs.createWriteStream(video))
		 })
	}catch{
		console.log(url_);
		process.exit(255);
	}
}
const main = async function(url){
  let saveString;
  video = new Array();
  const url_ = url.toString();
  const id = url_.replace(/^.*=/i,"");
  try{
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
		console.log("fichier:%s [id = %s]", myjson.items[x].title, myjson.items[x].id);
	 }
	 telecharger_video(video[0],video, 0, video.length-1);
  }catch{
	console.log("Erreur: id = %s", id);
	process.exit(255);
  }
}
if(args.quality){
	quality_opt = args.quality;
}
if(args.filter){
	filter_opt = args.filter;
}
if(args.url){
	var argv1 = args.url;
}else{
	console.log("usage invalide.\nusage: nodejs ./youtube_dl-node.js [--quality=quality, --filter=filter] --url=url\nPour les options voir https://github.com/fent/node-ytdl-core/tree/master")
	process.exit(255);
}
//console.log("Arguments: quality:%s, filter:%s, url:%s", quality_opt, filter_opt, argv1);
let str = argv1.toString();
if(str.includes("playlist") === true){
	main(str);
}else{
	telecharger_video(str, 0, 0, -1);
}
