// Smile Implant and Dental Clinic — Dr. Shilpa Yadav — shared site script
(function(){
  var WA_NUMBER = "918448668209";
  var LEAD_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbw3OEJlRvmYIhMfwRMtaU05jCGQO_vH-GRBhc3wbauSAsndBVde8gRfHOgRJN2J5uja/exec";

  function waLink(pageLabel){
    var text = "Hello Dr. Shilpa, I would like to book an implant suitability consultation at your Aya Nagar clinic. (via " + pageLabel + ")";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  // Fire-and-forget lead logging to Google Sheets — never blocks the real WhatsApp/call/form action
  function logLead(payload){
    try {
      if (!LEAD_WEBHOOK_URL || LEAD_WEBHOOK_URL.indexOf("PLACEHOLDER") !== -1) { return; }
      payload.referrer = document.referrer || "";
      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify(payload)
      });
    } catch (err) { /* never block the real action */ }
  }

  document.addEventListener("DOMContentLoaded", function(){
    var pageLabel = document.body.getAttribute("data-page") || "website";

    // Wire every WhatsApp CTA with a page-aware prefilled message
    document.querySelectorAll("[data-wa]").forEach(function(el){
      el.setAttribute("href", waLink(pageLabel));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    // Reveal-on-scroll
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, {threshold:.12});
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add("in"); });
    }

    // Consultation form -> WhatsApp handoff (no backend yet; see deploy notes)
    var form = document.getElementById("consult-form");
    if (form){
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var name = (form.querySelector("#f-name") || {}).value || "";
        var phone = (form.querySelector("#f-phone") || {}).value || "";
        var concern = (form.querySelector("#f-concern") || {}).value || "";
        var msg = "Hello Dr. Shilpa, I would like to book an implant consultation.\n" +
          "Name: " + name + "\nPhone: " + phone + "\nConcern: " + concern + "\n(via " + pageLabel + ")";
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
        var note = document.getElementById("consult-form-note");
        if (note){ note.hidden = false; }
        form.reset();
      });
    }

    // Simple GA4 event pings (no-op if gtag isn't loaded yet) + Google Sheets lead logging
    document.querySelectorAll("[data-wa]").forEach(function(el){
      el.addEventListener("click", function(){
        if (typeof gtag === "function"){ gtag("event", "whatsapp_click", {page: pageLabel}); }
        var label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 60);
        logLead({type: "WhatsApp Click", page: pageLabel, cta: label});
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el){
      el.addEventListener("click", function(){
        if (typeof gtag === "function"){ gtag("event", "call_click", {page: pageLabel}); }
        var label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 60);
        logLead({type: "Call Click", page: pageLabel, cta: label});
      });
    });
    if (form){
      form.addEventListener("submit", function(){
        if (typeof gtag === "function"){ gtag("event", "consult_form_submit", {page: pageLabel}); }
        var name = (form.querySelector("#f-name") || {}).value || "";
        var phone = (form.querySelector("#f-phone") || {}).value || "";
        var concern = (form.querySelector("#f-concern") || {}).value || "";
        logLead({type: "Contact Form", page: pageLabel, name: name, phone: phone, concern: concern, cta: "consult-form"});
      });
    }
  });
})();
