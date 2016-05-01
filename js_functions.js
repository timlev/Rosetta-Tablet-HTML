/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict"
var H;
var W;
var boxH;
var boxW;
var correct_item = "blahblah";
var img_slots = ["img1","img2", "img3", "img4"];
var current_index = 0;
var current_unit;
var current_lesson;
var current_lesson_contents;
var current_unit;
var lesson_length;
var tries = 0;
var score = 0;
//function fill_imgs();
var sep = json_dir_sep();
console.log(sep);

function onWinResize(){
  H = window.innerHeight;
  W = window.innerWidth;
  boxH = (H - 100)/ 2;
  boxW = W / 2;
  console.log(H, W, boxH, boxW);
  H = window.innerHeight;
  W = window.innerWidth;
  boxH = (H - 100)/ 2;
  boxW = W / 2;
  var boxes = ['box1', 'box2','box3','box4'];
  for (var box in boxes){
    document.getElementById(boxes[box]).height = boxH;
    document.getElementById(boxes[box]).width = boxW;
  }
}
function play(file){
  //console.log(file.name);
  file.play();
    //if (file.name != null){
    //  file.addEventListener( "ended", revert_color(file.name), false);
    //}
};
function json_dir_sep(){
  //Try first units.json entry
  var first_unit = Object.keys(units_json["Units"])[0];
  var first_lesson = Object.keys(units_json["Units"][first_unit])[0];
  var first_file = Object.keys(units_json["Units"][first_unit][first_lesson]["pics"])[0];
  if (first_file.indexOf("/pics/") != -1){
    return "/";
  }
  else if (first_file.indexOf("\\pics\\") != -1){
    return "\\";
  }
}

function getbestratio(boxheight,boxwidth,picheight,picwidth){
    var height_ratio = boxheight / picheight;
    var width_ratio = boxwidth / picwidth;
    picwidth *= Math.min(width_ratio, height_ratio)
    picheight *= Math.min(width_ratio, height_ratio)
    return {new_width: picwidth,new_height: picheight};
}

function fill_imgs(){
  onWinResize();
  document.getElementById("main_lesson").style.visibility = "visible";
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function grab_lesson(unit, lesson){
  var raw_lesson = units_json["Units"][unit][lesson]["pics"];
  var pics = [];
  for (var key in raw_lesson) {
    if (raw_lesson.hasOwnProperty(key)) {
      //console.log(key);
      pics.push(key);
    }
  }
  return pics;
}
function convert_to_display(item){
  item = item.slice(item.lastIndexOf(sep) + 1,item.lastIndexOf("."));
  var replacementsdict = {'.exclamationmark': '!', '.apostrophe': "'", '.questionmark': '?', '.comma': ',', '.colon': ':'};
  for (var key in replacementsdict){
    if (item.indexOf(key) != -1){
      item = item.replace(key, replacementsdict[key]);
    }
  }
  return item;
}

function set_sound(item){
  var sound_src = item.replace("pics","sounds");
  sound_src = sound_src.slice(0,sound_src.lastIndexOf(".")) + "speech_google.wav";
  document.getElementById("phraseboxaudio").src = sound_src;
}

function setup_item(item, lesson, callback){
  onWinResize();
  document.getElementById("main_lesson").style.visibility = "visible";
  document.getElementById("lesson_choice").style.display = "none";
  document.getElementById("score_screen").style.display = "none";
  lesson_length = lesson.length;
  tries = 0;
  //assign text
  //document.getElementById("phraseboxwords").innerHTML = convert_to_display(item);
  //split words into divs
  document.getElementById("phraseboxwords").innerHTML = split_item_to_word_spans(convert_to_display(item));
  //assign sound
  set_sound(item);
  play(document.getElementById("phraseboxaudio"));
  //assign pictures
  convert_to_display(item);
  img_slots = shuffle(img_slots);
  //set correct_item
  correct_item = img_slots[0];
  document.getElementById(img_slots[0]).src = item;

  var already_taken = [item];
  //var lesson = shuffle(lesson);
  for (var i = 1; i < img_slots.length; i++){
    var index = 0;
    var another_pic = "";
    while (another_pic == "" || already_taken.indexOf(another_pic) != -1){
      another_pic = lesson[index];
      index += 1;
    }
    already_taken.push(another_pic);
    document.getElementById(img_slots[i]).src = another_pic;
  }
}

function resizePic(img){
  var picheight = img.height;
  var picwidth = img.width;
  var results = getbestratio(boxH,boxW,picheight,picwidth);
  img.width = results.new_width;
  img.height = results.new_height;
}

function lesson_loop(unit, lesson){
  onWinResize();
  img_slots = ["img1","img2", "img3", "img4"];
  correct_item = "blahblah";
  current_index = 0;
  tries = 0;
  score = 0;
  document.getElementById("scorebox").innerHTML = "Score: ";
  document.getElementById("lesson_choice").style.display = "none";
  document.getElementById("score_screen").style.display = "none";
  //grab lesson from units.json
  current_lesson = lesson;
  current_lesson_contents = grab_lesson(unit,lesson);
  //shuffle lesson once
  current_lesson_contents = shuffle(current_lesson_contents);
  current_unit = unit;
  setup_item(current_lesson_contents[current_index], current_lesson_contents);//, fill_imgs()
}
function box_clicked(box){
  var timeout = 2000;
  if (correct_item == box){
    play_feedback_sound(true);
    document.getElementById('answer_feedback').innerHTML = "<img src='correct.png' height=50px width=50px />Yes!";
    highlight_div('answer_feedback', timeout);
    //alert("Correct choice!");
    if (tries == 0){
      score += 1;
    }
    document.getElementById("scorebox").innerHTML = "Score: " + score + "/" + String(current_index + 1);
    current_index += 1;
    correct_item = "blahblah";
    if (current_index < lesson_length){
      setTimeout(function(){setup_item(current_lesson_contents[current_index], current_lesson_contents);},timeout);
    }
    else {
      current_index = 0;
      setTimeout(function() {display_score_summary(current_lesson, score);});
    }
  }
  else {
    play_feedback_sound(false);
    document.getElementById('answer_feedback').innerHTML = "<img src='wrong.png' height=50px width=50px />No";
    highlight_div('answer_feedback', timeout);
    setTimeout(function(){play(document.getElementById("phraseboxaudio"));},timeout);
    //alert("Wrong choice :( !");
    tries += 1;
  }
}
function check(d){
  console.log("check");
  d.firstChild.checked = true;
  //click_unit(d.firstChild);
}
function listgalleryPictures(unit, lesson){
	var picArray = [];
	console.log(unit, lesson);
	for (var pic in units_json['Units'][current_unit][current_lesson]["pics"]){
		picArray.push(pic);
	}
	return picArray;
}

function getbestratio(boxheight,boxwidth,picheight,picwidth){
    var height_ratio = boxheight / picheight;
    var width_ratio = boxwidth / picwidth;
    picwidth *= Math.min(width_ratio, height_ratio)
    picheight *= Math.min(width_ratio, height_ratio)
    return {new_width: picwidth,new_height: picheight};
}

function resizegalleryPic(img){
	var boxH = 200;
	var boxW = 200;
	var picheight = img.height;
	var picwidth = img.width;
	var results = getbestratio(boxH,boxW,picheight,picwidth);
	img.width = results.new_width;
	img.height = results.new_height;
	//document.getElementById("gallery").appendChild(img);
}


function displaygalleryPics(unit, lesson){
	document.getElementById("gallery").innerHTML = "";
	console.log(unit,lesson);
	var picArray = listgalleryPictures(unit, lesson);
	for (var pic in picArray){
		var img = document.createElement("IMG");
		img.src = picArray[pic];
		document.getElementById("gallery").appendChild(img);
		img.onload = resizegalleryPic(img);
	}

}

function activateButton(unit, lesson){
	document.getElementById(lesson).checked = true;
	current_lesson = lesson;
	console.log(unit, lesson);
	displaygalleryPics(unit, lesson);
	document.getElementById("gobutton").src = "gobutton.png";
	document.getElementById("gobutton").className += " clickable";
	document.getElementById("gobutton").onclick = function(){choose_lesson(current_unit, current_lesson)};
}

function check_lesson(d){
  d.firstChild.checked = true;
  current_lesson = d.firstChild.id;
  console.log(current_unit, current_lesson);
  activateButton(current_unit, current_lesson);
  
}

function display_unit_choices(){
  //This function sets up the unit choices and hides all other sections.
  //Clear lesson preview
  document.getElementById("gallery").innerHTML = "";
  document.getElementById("gobutton").src = "gobutton_unavailable.png";
  document.getElementById("gobutton").className = "";
  onWinResize();
  //set up units
  document.getElementById("main_lesson").style.visibility = "hidden";
  document.getElementById("lesson_choice").style.visibility = "visible";
  document.getElementById("lesson_choice").style.display = "block";
  document.getElementById("score_screen").style.display = "none";
  var units= [];
  //Populates Unit Choices
  //onclick - first time?
  //onchange - future times?
  for (var unit in units_json["Units"]){
    units.push("<div class='clickable' onclick='click_unit(this.firstChild)'><input type='radio' name='unit' id='" + unit + "' onchange='click_unit(this)' >" + unit + "</input></div>");
  }
  document.getElementById("units").innerHTML = units.join("");
}

function constructDate(){
  var d = new Date();
  var date = "";
  date += d.getMonth() + "/";//month
  date += d.getDate() + "/"; // day
  date += d.getYear(); //year
  return date;
}
function display_score_summary(lesson, score){
  document.getElementById("main_lesson").style.visibility = "hidden";
  //document.getElementById("score_screen").style.display = "block";
  highlight_div("score_screen", 0);
  document.getElementById("score_date").innerHTML = constructDate();
  document.getElementById("score_unit").innerHTML = current_unit;
  document.getElementById("score_lesson").innerHTML = lesson;
  document.getElementById("score_score").innerHTML = score + "/" + lesson_length;

}
function populate_lesson_choices(unit){
  //set up lesson choices after unit has been clicked
  //activateButton(u,l) after change
  document.getElementById("main_lesson").style.visibility = "hidden";
  document.getElementById("lesson_choice").style.visibility = "visible";
  document.getElementById("lesson_choice").style.display = "block";
  current_unit = unit;
  var lessons= [];
  for (var lesson in units_json["Units"][unit]){
    lessons.push("<div class='clickable' onclick='activateButton(current_unit, this.firstChild.id)'><input type='radio' name='lesson' id='" + lesson + "' onchange='console.log('change')' >" + lesson + "</input></div>");
  }
  document.getElementById("lessons").innerHTML = lessons.join("");
}
function click_unit(choice){
  choice.checked = true;
  console.log("click_unit");
  var unit = choice.id;
  current_unit = choice.id;
  populate_lesson_choices(unit);
}

function choose_lesson(u, l){
  current_unit = u;
  current_lesson = l;
  lesson_length = l.length;
  document.getElementById("gobutton").src = "gobutton_unavailable.png";
  document.getElementById("gobutton").className = "";
  lesson_loop(current_unit, current_lesson);
}

function addSpan(word, word_sound_file_name, word_sound_file_path){
  return "<span id=" + word_sound_file_name + " onclick=play_word_file(this)>" + word + "</span>";
}

function split_item_to_word_spans(disp_item){
  var wordArray = disp_item.split(" ");
  var output_array = [];
  for (var i in wordArray){
    var word = wordArray[i];
    //remove ? ! . ,
    var word_sound_file_name = word.replace("?","").replace("!","").replace(".", "").replace(",","");
    word_sound_file_name = word_sound_file_name.toLowerCase();
    var word_sound_file_path = ["'","sounds/",String(word_sound_file_name),".mp3","'"].join("");
    output_array.push(addSpan(word, word_sound_file_name, word_sound_file_path));
  }
  var output = output_array.join(" ");
  return output;
}

function revert_color(obj){
  setTimeout(function (){document.getElementById(obj.id).style.backgroundColor = 'transparent';},1000);
}

function play_word_file(obj){
  document.getElementById(obj.id).style.backgroundColor = 'yellow';
  var word_sound_file_path = "sounds/" + obj.id + ".mp3";
  document.getElementById("ind_words_audio").src = word_sound_file_path;
  play(document.getElementById("ind_words_audio"));
  document.getElementById("ind_words_audio").addEventListener( "ended", revert_color(obj));

  //problems do, break, time -- don't download
}

function play_feedback_sound(correct){
  if (correct == true){
    document.getElementById("audio_feedback").src = "GuitarStrum.wav";
    play(document.getElementById("audio_feedback"));
  }
  else {
    document.getElementById("audio_feedback").src = "CymbalCrash.wav";
    play(document.getElementById("audio_feedback"));
  }
}

function highlight_div(div, timeout){
  if (timeout === undefined){
    timout = 1000;
  }
  document.getElementById(div).style.display='block';
  document.getElementById('fade').style.display='block';
  if (timeout != 0){
    setTimeout(function(){ reverse_highlight(div);}, timeout);
  }
}

function reverse_highlight(div){
  document.getElementById(div).style.display='none';
  document.getElementById('fade').style.display='none';
}
