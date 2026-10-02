/**
 * Smile Implant and Dental Clinic — Dr. Shilpa Yadav
 * Lead-logging Web App, bound to the site's Leads Google Sheet.
 *
 * Deploy: Extensions -> Apps Script -> Deploy -> New deployment -> Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Logs two kinds of events from assets/main.js, fire-and-forget (no-cors):
 *   - "WhatsApp Click" / "Call Click" — lightweight, just page + which CTA was clicked
 *   - "Contact Form" — full consult-form submission (name, phone, concern)
 */

function doPost(e) {
  var sheet = getLeadsSheet_();

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  sheet.appendRow([
    new Date(),
    data.type || "",
    data.page || "",
    data.name || "",
    data.phone || "",
    data.concern || "",
    data.message || "",
    data.cta || "",
    data.referrer || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: "alive", sheet: "Leads"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Leads");
  if (!sheet) {
    sheet = ss.insertSheet("Leads");
    sheet.appendRow(["Timestamp", "Type", "Page", "Name", "Phone", "Concern", "Message", "CTA", "Referrer"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
