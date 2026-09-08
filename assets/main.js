// Smile Implant and Dental Clinic — Dr. Shilpa Yadav — shared site script
(function(){
  var WA_NUMBER = "918448668209";

  function waLink(pageLabel){
    var text = "Hello Dr. Shilpa, I would like to schedule a free implant consultation at your Aya Nagar clinic. (via " + pageLabel + ")";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
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
        var msg = "Hello Dr. Shilpa, I would like a free implant consultation.\n" +
          "Name: " + name + "\nPhone: " + phone + "\nConcern: " + concern + "\n(via " + pageLabel + ")";
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
        var note = document.getElementById("consult-form-note");
        if (note){ note.hidden = false; }
        form.reset();
      });
    }

    // Simple GA4 event pings (no-op if gtag isn't loaded yet)
    document.querySelectorAll("[data-wa]").forEach(function(el){
      el.addEventListener("click", function(){
        if (typeof gtag === "function"){ gtag("event", "whatsapp_click", {page: pageLabel}); }
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el){
      el.addEventListener("click", function(){
        if (typeof gtag === "function"){ gtag("event", "call_click", {page: pageLabel}); }
      });
    });
    if (form){
      form.addEventListener("submit", function(){
        if (typeof gtag === "function"){ gtag("event", "consult_form_submit", {page: pageLabel}); }
      });
    }
  });
})();
