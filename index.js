var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

function doGet(e) {
  var action = e.parameter.action;
  
  if (action == 'read') {
    // Set CORS headers untuk mengizinkan akses dari local test
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    try {
      var data = sheet.getDataRange().getValues();
      
      if (data.length < 2) {
        output.setContent(JSON.stringify([]));
        return output;
      }
      
      var headers = data[0];
      var result = [];
      
      // Pastikan kolom ID ada
      if (headers[0] !== 'id') {
        // Jika kolom pertama bukan 'id', tambahkan header
        if (headers[0] !== 'id') {
          sheet.getRange(1, 1).setValue('id');
          headers[0] = 'id';
        }
      }
      
      for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        result.push(obj);
      }
      
      output.setContent(JSON.stringify(result));
    } catch (error) {
      output.setContent(JSON.stringify({error: error.toString()}));
    }
    
    return output;
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var id = params.id;
    
    // Pastikan sheet memiliki header yang benar
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length < 4 || headers[0] !== 'id') {
      sheet.getRange(1, 1, 1, 4).setValues([['id', 'nama', 'email', 'pesan']]);
    }
    
    if (action == 'create') {
      var newId = "ID-" + new Date().getTime();
      sheet.appendRow([newId, params.nama, params.email, params.pesan]);
      
    } else if (action == 'update') {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          sheet.getRange(i + 1, 2, 1, 3).setValues([[params.nama, params.email, params.pesan]]);
          break;
        }
      }
      
    } else if (action == 'delete') {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}