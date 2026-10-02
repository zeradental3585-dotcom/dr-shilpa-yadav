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

    // Animated count-up for trust-signal numbers (e.g. 4.9 rating, 13+ years)
    var countEls = document.querySelectorAll("[data-count-to]");
    if (countEls.length){
      var animateCount = function(el){
        var to = parseFloat(el.getAttribute("data-count-to"));
        var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        if (isNaN(to)) return;
        var dur = 1100, start = null;
        function step(ts){
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * eased).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = to.toFixed(decimals);
        }
        requestAnimationFrame(step);
      };
      if ("IntersectionObserver" in window){
        var countIO = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if (entry.isIntersecting){
              countIO.unobserve(entry.target);
              animateCount(entry.target);
            }
          });
        }, {threshold:.5});
        countEls.forEach(function(el){ countIO.observe(el); });
      } else {
        countEls.forEach(animateCount);
      }
    }

    // Header scroll shadow
    var header = document.querySelector(".site-header");
    if (header){
      var onHeaderScroll = function(){
        if (window.scrollY > 8) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
      };
      window.addEventListener("scroll", onHeaderScroll, {passive:true});
      onHeaderScroll();
    }

    // Keep the floating WhatsApp button from covering hero text/CTAs on short mobile
    // viewports (Chrome's address bar + nav bar can shrink the visible viewport enough
    // that the fixed bottom-right button overlaps the hero paragraph before any scroll).
    // Fades the button out while its position would still sit over the hero/trust-row
    // zone, and back in once that zone has scrolled clear -- uses live measurements
    // rather than a fixed pixel guess, so it adapts to any viewport height or content change.
    var floatWa = document.querySelector(".float-whatsapp");
    var heroSafeZone = document.querySelector(".trust-row") || document.querySelector(".hero-ctas");
    if (floatWa && heroSafeZone){
      var updateFloatWaVisibility = function(){
        var safeBottom = heroSafeZone.getBoundingClientRect().bottom + window.scrollY;
        var buttonTopDoc = window.scrollY + window.innerHeight - 76;
        if (buttonTopDoc < safeBottom + 16){
          floatWa.classList.add("wa-hide");
        } else {
          floatWa.classList.remove("wa-hide");
        }
      };
      window.addEventListener("scroll", updateFloatWaVisibility, {passive:true});
      window.addEventListener("resize", updateFloatWaVisibility);
      updateFloatWaVisibility();
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
