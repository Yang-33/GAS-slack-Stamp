var token = "your_slack_token";
var sheet_url = "sheet_url";

//you need include Libraly Key : M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO  / SlackApp 

// Outgoing WebHooks�ɔ�������֐� 
function doPost(e) {
  
  if( e.parameter.user_name == "slackbot" ) {
    return null;
  }  
  
  // Custom Emoji�łȂ���ΏI��
  if(!isStamp(e.parameter.text.trim())){
     throw new Error("exit");
  }
  
  // �X�v���b�h�V�[�g����X�^���v�摜URL���擾
  var stamp_url = getValueFromSheet(e.parameter.text.trim(), 0);
  // Custom Emoji�ɑΉ�����X�^���vURL���Ȃ���ΏI��
  if (stamp_url == ""){
    throw new Error("exit");
  }
  // slack�ł͓���URL�͓W�J����Ȃ�����URL��UNIXTIME��ǋL
  stamp_url = addDateString(stamp_url);
  
  var channel_id = e.parameter.channel_id;
  var user_name = e.parameter.user_name;
  
  // ���[�U������token�̎擾
  var token = getValueFromSheet(user_name, 1);
  
  // ���[�U�g�[�N���̎擾�����������ꍇ
  if (token != "") {
    var app = SlackApp.create(token);
  
    // ���e���ꂽ�X�^���v�̍폜
    app.chatDelete(channel_id, e.parameter.timestamp);
  
    // �Ή�����X�^���vURL�𓊍e
    var post_info = app.postMessage(channel_id, stamp_url, {
      as_user: true
    });
  }
  else {
    token = token_bak;
    var icon_url = getUserIconURL(e.parameter.user_id, token);
    var app = SlackApp.create(token);
  
    // ���e���ꂽ�X�^���v�̍폜
    app.chatDelete(channel_id, e.parameter.timestamp);
  
    // �Ή�����X�^���vURL�𓊍e
    var post_info = app.postMessage(channel_id, stamp_url, {
      username: user_name,
      icon_url: icon_url,
    });
  }
  
  return true;
}


// Outgoing webhook���X�^���v���ǂ����̔���֐�
function isStamp(text){
  
  if (text.slice(0,1)==":" && text.slice(-1)==":") return true;
  else return false;
}

// UserID���炻�̃��[�U�A�C�R����URL���擾����֐�
function getUserIconURL(user_id, token){
  
  var app = SlackApp.create(token);
  var user_info = app.usersInfo(user_id);
  
  return user_info.user.profile.image_72;
}

// �X�v���b�h�V�[�g����X�^���v���ɑΉ�����I���W�i���̃X�^���vURL���擾����֐�
function getValueFromSheet(target_name, sheet_no){
  
  var result = "";
  
  // �X�v���b�h�V�[�g�̑I��
  var ss = SpreadsheetApp.openByUrl(sheet_url);
  // �V�[�g�̎w��
  var sheet = ss.getSheets()[sheet_no];
  
  var start_row = 1;
  var last_row = sheet.getLastRow();
  
  // �V�[�g�̉����猟��
  for (var r=last_row; r>=start_row; r--){
    // �l�̎擾
    var sn = sheet.getSheetValues(r, 1, 1, 1);
    
    if (sn == target_name){
      result = sheet.getSheetValues(r, 2, 1, 1).toString(); //toString���Ă����Ȃ���indexOf�����܂����삵�Ȃ�
      
      return result;
    }
  }
  
  return result;
}

// �����̒l��unixtime��t�������ĕԋp����֐�
function addDateString(original){
  // UNIX TIME
  var date = new Date();
  
  if (original.indexOf("?") != -1){ // ����GET�p�����[�^���܂܂�Ă���ꍇ
    return original + "&" + date.getTime();
  }
  else{ // �܂܂�Ă��Ȃ��ꍇ
    return original + "?" + date.getTime();
  }
}