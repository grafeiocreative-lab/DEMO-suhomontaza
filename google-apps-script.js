/**
 * Google Apps Script Web App za Suhomontažerski Kalkulator
 * 
 * Navodila za namestitev:
 * 1. Odprite Google Sheets in ustvarite novo preglednico
 * 2. Kliknite na "Extensions" > "Apps Script"
 * 3. Kopirajte to kodo v editor
 * 4. Shranite projekt
 * 5. Kliknite na "Deploy" > "New deployment"
 * 6. Izberite "Web app" kot tip
 * 7. Nastavite "Execute as" na vaš račun
 * 8. Nastavite "Who has access" na "Anyone"
 * 9. Kopirajte URL Web App-a in ga vstavite v Calculator.tsx
 */

// Referenca na aktivno preglednico
const SHEET_NAME = "Izračuni";

/**
 * Ustvari novo preglednico, če ne obstaja
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Nastavi glavo
    sheet.appendRow([
      "Časovni Žig",
      "Operacija",
      "Vrednost 1",
      "Vrednost 2",
      "Rezultat",
      "Uporabnik"
    ]);
    
    // Formatiraj glavo
    const headerRange = sheet.getRange(1, 1, 1, 6);
    headerRange.setBackground("#CC0000");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
  }
  
  return sheet;
}

/**
 * Glavna funkcija za obdelavo POST zahtevkov
 */
function doPost(e) {
  try {
    // Pridobi podatke iz zahtevka
    const data = JSON.parse(e.postData.contents);
    
    // Validiraj podatke
    if (!data.operation || data.value1 === undefined || data.value2 === undefined) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "Manjkajoči podatki"
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Izračunaj rezultat
    let result;
    switch (data.operation) {
      case "add":
        result = data.value1 + data.value2;
        break;
      case "subtract":
        result = data.value1 - data.value2;
        break;
      case "multiply":
        result = data.value1 * data.value2;
        break;
      case "divide":
        if (data.value2 === 0) {
          return ContentService.createTextOutput(
            JSON.stringify({
              success: false,
              error: "Deljenje z nič ni mogoče"
            })
          ).setMimeType(ContentService.MimeType.JSON);
        }
        result = data.value1 / data.value2;
        break;
      default:
        return ContentService.createTextOutput(
          JSON.stringify({
            success: false,
            error: "Neznana operacija"
          })
        ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Pripravi preglednico
    const sheet = setupSheet();
    
    // Dodaj vrstico v preglednico
    const timestamp = new Date().toLocaleString("sl-SI");
    const userEmail = Session.getActiveUser().getEmail();
    
    sheet.appendRow([
      timestamp,
      getOperationName(data.operation),
      data.value1,
      data.value2,
      result,
      userEmail
    ]);
    
    // Vrni rezultat
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        result: result,
        timestamp: timestamp,
        message: "Rezultat je bil uspešno shranjen v Google Sheets"
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Pridobi seznam vseh izračunov
 */
function doGet(e) {
  try {
    const sheet = setupSheet();
    const data = sheet.getDataRange().getValues();
    
    // Pretvori v JSON format (preskoči glavo)
    const results = [];
    for (let i = 1; i < data.length; i++) {
      results.push({
        timestamp: data[i][0],
        operation: data[i][1],
        value1: data[i][2],
        value2: data[i][3],
        result: data[i][4],
        user: data[i][5]
      });
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        data: results,
        count: results.length
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Pomožna funkcija za pretvorbo operacije v slovenski naziv
 */
function getOperationName(operation) {
  const names = {
    "add": "Seštevanje",
    "subtract": "Odštevanje",
    "multiply": "Množenje",
    "divide": "Deljenje"
  };
  return names[operation] || operation;
}

/**
 * Počisti vse podatke iz preglednice (za testiranje)
 */
function clearData() {
  const sheet = setupSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

/**
 * Prikaži URL Web App-a v konzoli
 */
function showWebAppUrl() {
  const scriptId = ScriptApp.getScriptId();
  const url = "https://script.google.com/macros/d/" + scriptId + "/usercallback";
  Logger.log("Web App URL: " + url);
}
