/* ==========================================================================
   Dr. VG Kidney Stone Clinic — Interaction & Fade Animation Engine
   Clean vanilla JS (zero duplicate globals, works alongside jQuery/Datepicker)
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* 1. Swift Preloader dismiss so hero paints cleanly without blocking */
    var preloader = document.querySelector(".vg-preloader");
    if (preloader) {
      window.requestAnimationFrame(function () {
        setTimeout(function () {
          preloader.classList.add("is-done");
        }, 120);
      });
    }

    /* 2. Smart Sticky Header (hide on scroll down, show on scroll up) & Back-to-top */
    var siteHeader = document.querySelector(".vg-header");
    var scrollTopBtn = document.querySelector(".vg-scroll-top");
    var lastScrollY = window.scrollY || window.pageYOffset || 0;

    function handleScroll() {
      var y = Math.max(0, window.scrollY || window.pageYOffset || 0);
      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", y > 24);
        var drawerOpen = document.querySelector(".vg-mobile-drawer.is-open");
        var delta = y - lastScrollY;
        if (drawerOpen || y <= 110) {
          siteHeader.classList.remove("is-hidden");
        } else if (delta > 6 && y > 130) {
          siteHeader.classList.add("is-hidden");
        } else if (delta < -4) {
          siteHeader.classList.remove("is-hidden");
        }
      }
      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle("is-visible", y > 420);
      }
      lastScrollY = y;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* 3. Mobile Navigation Drawer */
    var mobileToggle = document.querySelector(".vg-mobile-toggle");
    var mobileDrawer = document.querySelector(".vg-mobile-drawer");
    var mobileClose = document.querySelector(".vg-mobile-close");
    var mobileBackdrop = document.querySelector(".vg-mobile-backdrop");

    function setDrawerState(open) {
      if (!mobileDrawer) return;
      mobileDrawer.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (mobileToggle) {
        mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
      }
    }

    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        setDrawerState(true);
      });
    }
    if (mobileClose) {
      mobileClose.addEventListener("click", function () {
        setDrawerState(false);
      });
    }
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener("click", function () {
        setDrawerState(false);
      });
    }

    document.querySelectorAll(".vg-mobile-sub-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = btn.nextElementSibling;
        if (sub) {
          sub.classList.toggle("is-open");
          var icon = btn.querySelector("i");
          if (icon) {
            icon.classList.toggle("fa-angle-down");
            icon.classList.toggle("fa-angle-up");
          }
        }
      });
    });

    /* 3b. 3-Slide Animated Hero Carousel */
    var heroCarousel = document.getElementById("vgHeroCarousel");
    if (heroCarousel) {
      var slides = Array.prototype.slice.call(heroCarousel.querySelectorAll(".vg-hero-slide"));
      var tabs = Array.prototype.slice.call(heroCarousel.querySelectorAll(".vg-hero-tab"));
      var prevBtn = heroCarousel.querySelector(".vg-hero-arrow.is-prev");
      var nextBtn = heroCarousel.querySelector(".vg-hero-arrow.is-next");
      var counterEl = heroCarousel.querySelector(".vg-hero-counter");
      var currentIdx = 0;
      var slideTimer = null;
      var leavingTimer = null;
      var autoplayDelay = 6200;
      var isPaused = false;

      function restartProgressBar(tab) {
        if (!tab) return;
        var bar = tab.querySelector(".vg-hero-tab-bar");
        if (!bar) return;
        bar.style.animation = "none";
        void bar.offsetWidth;
        bar.style.animation = "";
      }

      function updateCounter(idx) {
        if (counterEl) {
          counterEl.textContent = "0" + (idx + 1) + " / 0" + slides.length;
        }
      }

      function goToSlide(nextIndex) {
        if (!slides.length) return;
        var targetIdx = ((nextIndex % slides.length) + slides.length) % slides.length;
        if (targetIdx === currentIdx) return;

        var prevSlide = slides[currentIdx];
        var nextSlide = slides[targetIdx];

        if (leavingTimer) {
          clearTimeout(leavingTimer);
        }
        slides.forEach(function (s) {
          s.classList.remove("is-leaving");
        });

        if (prevSlide) {
          prevSlide.classList.remove("is-active");
          prevSlide.classList.add("is-leaving");
          prevSlide.setAttribute("aria-hidden", "true");
        }

        if (nextSlide) {
          nextSlide.classList.remove("is-leaving");
          nextSlide.classList.add("is-active");
          nextSlide.setAttribute("aria-hidden", "false");
        }

        leavingTimer = setTimeout(function () {
          if (prevSlide) prevSlide.classList.remove("is-leaving");
        }, 880);

        tabs.forEach(function (tab, i) {
          var active = i === targetIdx;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", active ? "true" : "false");
          if (active) {
            restartProgressBar(tab);
          }
        });

        currentIdx = targetIdx;
        updateCounter(currentIdx);
      }

      function stopAutoplay() {
        if (slideTimer) {
          clearInterval(slideTimer);
          slideTimer = null;
        }
      }

      function startAutoplay() {
        stopAutoplay();
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return;
        }
        slideTimer = setInterval(function () {
          if (!isPaused && !document.hidden) {
            goToSlide(currentIdx + 1);
          }
        }, autoplayDelay);
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goToSlide(currentIdx - 1);
          startAutoplay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goToSlide(currentIdx + 1);
          startAutoplay();
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var target = parseInt(tab.getAttribute("data-hero-target"), 10);
          if (!isNaN(target)) {
            goToSlide(target);
            startAutoplay();
          }
        });
      });

      heroCarousel.addEventListener("mouseenter", function () {
        isPaused = true;
        heroCarousel.classList.add("is-paused");
      });

      heroCarousel.addEventListener("mouseleave", function () {
        isPaused = false;
        heroCarousel.classList.remove("is-paused");
      });

      heroCarousel.addEventListener("focusin", function () {
        isPaused = true;
        heroCarousel.classList.add("is-paused");
      });

      heroCarousel.addEventListener("focusout", function (e) {
        if (!heroCarousel.contains(e.relatedTarget)) {
          isPaused = false;
          heroCarousel.classList.remove("is-paused");
        }
      });

      heroCarousel.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToSlide(currentIdx - 1);
          startAutoplay();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goToSlide(currentIdx + 1);
          startAutoplay();
        }
      });

      /* Touch swipe support for mobile */
      var touchStartX = 0;
      var touchStartY = 0;
      heroCarousel.addEventListener(
        "touchstart",
        function (e) {
          if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );
      heroCarousel.addEventListener(
        "touchend",
        function (e) {
          if (!e.changedTouches || e.changedTouches.length !== 1) return;
          var dx = e.changedTouches[0].clientX - touchStartX;
          var dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
            goToSlide(dx < 0 ? currentIdx + 1 : currentIdx - 1);
            startAutoplay();
          }
        },
        { passive: true }
      );

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          heroCarousel.classList.add("is-paused");
        } else if (!isPaused) {
          heroCarousel.classList.remove("is-paused");
        }
      });

      updateCounter(0);
      startAutoplay();
    }

    /* 3c. Auto-Playing Testimonials Carousel */
    var testiCarousel = document.getElementById("vgTestimonialsCarousel");
    if (testiCarousel) {
      var testiTrack = testiCarousel.querySelector(".vg-testi-track");
      var testiCards = testiTrack ? Array.prototype.slice.call(testiTrack.children) : [];
      var testiDotsWrap = testiCarousel.querySelector(".vg-testi-dots");
      var testiPrev = testiCarousel.querySelector(".vg-testi-arrow.is-prev");
      var testiNext = testiCarousel.querySelector(".vg-testi-arrow.is-next");
      var testiIndex = 0;
      var testiTimer = null;
      var testiPaused = false;

      function getVisibleCount() {
        var w = window.innerWidth;
        if (w >= 992) return 3;
        if (w >= 768) return 2;
        return 1;
      }

      function getMaxIndex() {
        return Math.max(0, testiCards.length - getVisibleCount());
      }

      function renderTestiDots() {
        if (!testiDotsWrap) return;
        var count = getMaxIndex() + 1;
        testiDotsWrap.innerHTML = "";
        for (var i = 0; i < count; i++) {
          (function (idx) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.className = "vg-testi-dot" + (idx === testiIndex ? " is-active" : "");
            dot.setAttribute("role", "tab");
            dot.setAttribute("aria-selected", idx === testiIndex ? "true" : "false");
            dot.setAttribute("aria-label", "Testimonial group " + (idx + 1));
            dot.addEventListener("click", function () {
              goToTesti(idx);
              startTestiAutoplay();
            });
            testiDotsWrap.appendChild(dot);
          })(i);
        }
      }

      function updateTestiPosition() {
        if (!testiTrack || !testiCards.length) return;
        var max = getMaxIndex();
        if (testiIndex > max) testiIndex = 0;
        var gap = 22;
        var cardW = testiCards[0].getBoundingClientRect().width;
        var offset = testiIndex * (cardW + gap);
        testiTrack.style.transform = "translate3d(-" + offset + "px, 0, 0)";

        if (testiDotsWrap) {
          var dots = testiDotsWrap.querySelectorAll(".vg-testi-dot");
          dots.forEach(function (d, i) {
            var active = i === testiIndex;
            d.classList.toggle("is-active", active);
            d.setAttribute("aria-selected", active ? "true" : "false");
          });
        }
      }

      function goToTesti(nextIdx) {
        var max = getMaxIndex();
        if (nextIdx > max) testiIndex = 0;
        else if (nextIdx < 0) testiIndex = max;
        else testiIndex = nextIdx;
        updateTestiPosition();
      }

      function stopTestiAutoplay() {
        if (testiTimer) {
          clearInterval(testiTimer);
          testiTimer = null;
        }
      }

      function startTestiAutoplay() {
        stopTestiAutoplay();
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return;
        }
        testiTimer = setInterval(function () {
          if (!testiPaused && !document.hidden) {
            goToTesti(testiIndex + 1);
          }
        }, 3800);
      }

      if (testiPrev) {
        testiPrev.addEventListener("click", function () {
          goToTesti(testiIndex - 1);
          startTestiAutoplay();
        });
      }
      if (testiNext) {
        testiNext.addEventListener("click", function () {
          goToTesti(testiIndex + 1);
          startTestiAutoplay();
        });
      }

      testiCarousel.addEventListener("mouseenter", function () {
        testiPaused = true;
      });
      testiCarousel.addEventListener("mouseleave", function () {
        testiPaused = false;
      });
      testiCarousel.addEventListener("focusin", function () {
        testiPaused = true;
      });
      testiCarousel.addEventListener("focusout", function (e) {
        if (!testiCarousel.contains(e.relatedTarget)) {
          testiPaused = false;
        }
      });

      var testiTouchX = 0;
      testiCarousel.addEventListener(
        "touchstart",
        function (e) {
          if (e.touches && e.touches.length === 1) testiTouchX = e.touches[0].clientX;
        },
        { passive: true }
      );
      testiCarousel.addEventListener(
        "touchend",
        function (e) {
          if (!e.changedTouches || e.changedTouches.length !== 1) return;
          var dx = e.changedTouches[0].clientX - testiTouchX;
          if (Math.abs(dx) > 40) {
            goToTesti(dx < 0 ? testiIndex + 1 : testiIndex - 1);
            startTestiAutoplay();
          }
        },
        { passive: true }
      );

      window.addEventListener("resize", function () {
        renderTestiDots();
        updateTestiPosition();
      });

      renderTestiDots();
      updateTestiPosition();
      startTestiAutoplay();
    }

    /* 4. Purposeful IntersectionObserver + Scroll-Sweep Fade Reveals */
    var fadeEls = Array.prototype.slice.call(document.querySelectorAll("[data-fade]"));
    var fadeObserver = null;

    function revealFadeEl(el) {
      if (!el || el.classList.contains("is-visible")) return;
      var delay = el.getAttribute("data-fade-delay");
      if (delay) {
        el.style.transitionDelay = delay + "ms";
      }
      el.classList.add("is-visible");
      if (fadeObserver) {
        fadeObserver.unobserve(el);
      }
    }

    /* 5. Smooth Counter Animation */
    var counterEls = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
    var counterObs = null;

    function animateCounter(el) {
      if (!el || el.getAttribute("data-counted") === "1") return;
      el.setAttribute("data-counted", "1");
      if (counterObs) {
        counterObs.unobserve(el);
      }
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      var suffix = el.getAttribute("data-count-suffix") || "";
      if (isNaN(target)) return;

      var start = 0;
      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(start + (target - start) * eased);
        el.textContent = current.toLocaleString("en-IN") + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString("en-IN") + suffix;
        }
      }

      window.requestAnimationFrame(step);
    }

    function sweepVisibleAnimations() {
      var vh = window.innerHeight || document.documentElement.clientHeight || 900;
      fadeEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        if (rect.top <= vh * 0.99) {
          revealFadeEl(el);
        }
      });
      counterEls.forEach(function (el) {
        if (el.getAttribute("data-counted") === "1") return;
        var rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        if (rect.top <= vh * 0.99) {
          animateCounter(el);
        }
      });
    }

    if ("IntersectionObserver" in window && fadeEls.length) {
      fadeObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealFadeEl(entry.target);
            }
          });
        },
        { threshold: 0.02, rootMargin: "0px 0px -10px 0px" }
      );

      fadeEls.forEach(function (el) {
        fadeObserver.observe(el);
      });
    } else {
      fadeEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    if (counterEls.length) {
      if ("IntersectionObserver" in window) {
        counterObs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                animateCounter(entry.target);
              }
            });
          },
          { threshold: 0.25 }
        );
        counterEls.forEach(function (c) {
          counterObs.observe(c);
        });
      } else {
        counterEls.forEach(animateCounter);
      }
    }

    var sweepScheduled = false;
    function scheduleSweep() {
      if (sweepScheduled) return;
      sweepScheduled = true;
      window.requestAnimationFrame(function () {
        sweepScheduled = false;
        sweepVisibleAnimations();
      });
    }

    window.addEventListener("scroll", scheduleSweep, { passive: true });
    window.addEventListener("resize", scheduleSweep, { passive: true });
    window.addEventListener("load", sweepVisibleAnimations);
    window.addEventListener("hashchange", function () {
      window.setTimeout(sweepVisibleAnimations, 80);
    });
    window.requestAnimationFrame(sweepVisibleAnimations);

    /* 6. Interactive Department Explorer Tabs */
    var deptTabs = document.querySelectorAll(".vg-dept-tab");
    var deptPanels = document.querySelectorAll(".vg-dept-panel");
    if (deptTabs.length && deptPanels.length) {
      deptTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var targetId = tab.getAttribute("data-dept-target");
          deptTabs.forEach(function (t) {
            t.classList.remove("is-active");
            t.setAttribute("aria-selected", "false");
          });
          deptPanels.forEach(function (p) {
            p.classList.remove("is-active");
          });
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
          var panel = document.getElementById(targetId);
          if (panel) panel.classList.add("is-active");
          sweepVisibleAnimations();
        });
      });
    }

    /* 7. FAQ Accordions */
    document.querySelectorAll(".vg-acc-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".vg-acc-item");
        var parent = item.closest(".vg-accordion");
        var wasOpen = item.classList.contains("is-open");

        if (parent) {
          parent.querySelectorAll(".vg-acc-item").forEach(function (sibling) {
            sibling.classList.remove("is-open");
            var sibBtn = sibling.querySelector(".vg-acc-trigger");
            if (sibBtn) sibBtn.setAttribute("aria-expanded", "false");
          });
        }

        if (!wasOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* 8. Filterable Gallery (Events page) */
    var filterBtns = document.querySelectorAll(".vg-filter-btn");
    var filterItems = document.querySelectorAll("[data-category]");
    if (filterBtns.length && filterItems.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cat = btn.getAttribute("data-filter");
          filterBtns.forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          filterItems.forEach(function (item) {
            var itemCat = item.getAttribute("data-category");
            item.style.display = cat === "all" || itemCat === cat ? "" : "none";
          });
          sweepVisibleAnimations();
        });
      });
    }

    /* 9. Lightbox & Case Study Modal */
    var modal = document.getElementById("vgModal");
    var modalImg = document.getElementById("vgModalImg");
    var modalTitle = document.getElementById("vgModalTitle");
    var modalDesc = document.getElementById("vgModalDesc");
    var modalClose = document.getElementById("vgModalClose");

    function openModal(imgSrc, titleText, descText) {
      if (!modal) return;
      if (modalImg) {
        if (imgSrc) {
          modalImg.setAttribute("src", imgSrc);
          modalImg.style.display = "block";
        } else {
          modalImg.removeAttribute("src");
          modalImg.style.display = "none";
        }
        modalImg.alt = titleText || "Clinic milestone";
      }
      if (modalTitle) modalTitle.textContent = titleText || "";
      if (modalDesc) modalDesc.textContent = descText || "";
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      if (modalImg) {
        modalImg.removeAttribute("src");
        modalImg.style.display = "none";
      }
    }

    document.querySelectorAll("[data-modal-trigger]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var src = el.getAttribute("data-modal-img") || (el.querySelector("img") ? el.querySelector("img").src : "");
        var title = el.getAttribute("data-modal-title") || "";
        var desc = el.getAttribute("data-modal-desc") || "";
        openModal(src, title, desc);
      });
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal();
        setDrawerState(false);
      }
    });

    /* 10. Unified Appointment WhatsApp Booking Forms (with Interactive Slot & Chip Selectors) */
    document.querySelectorAll(".vg-appointment-form").forEach(function (form) {
      var dateInput = form.querySelector('[name="date"]');
      if (dateInput) {
        var today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
        if (!dateInput.value) dateInput.value = today;
      }

      function bindSelectorGroup(btnSelector, inputName) {
        var btns = form.querySelectorAll(btnSelector);
        var hiddenInput = form.querySelector('[name="' + inputName + '"]');
        if (!btns.length || !hiddenInput) return;
        btns.forEach(function (btn) {
          btn.addEventListener("click", function () {
            btns.forEach(function (b) {
              b.classList.remove("is-active");
              b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("is-active");
            btn.setAttribute("aria-pressed", "true");
            hiddenInput.value = btn.getAttribute("data-value") || btn.textContent.trim();
          });
        });
      }

      bindSelectorGroup(".vg-choice-btn[data-group='visittype']", "visittype");
      bindSelectorGroup(".vg-chip-btn[data-group='department']", "department");
      bindSelectorGroup(".vg-slot-btn[data-group='timeslot']", "timeslot");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector(".vg-form-status");
        var nameEl = form.querySelector('[name="name"]');
        var emailEl = form.querySelector('[name="email"]');
        var phoneEl = form.querySelector('[name="phone"]');
        var phoneGroup = form.querySelector("#app-phone-group");
        var nameErr = form.querySelector("#app-name-err");
        var phoneErr = form.querySelector("#app-phone-err");
        var emailErr = form.querySelector("#app-email-err");

        var name = (nameEl || {}).value || "";
        var email = (emailEl || {}).value || "";
        var phone = (phoneEl || {}).value || "";
        var visitType = (form.querySelector('[name="visittype"]') || {}).value || "New Consultation";
        var department = (form.querySelector('[name="department"]') || {}).value || "Kidney Stone (RIRS / PCNL)";
        var timeslot = (form.querySelector('[name="timeslot"]') || {}).value || "6:00 PM – 7:00 PM";
        var doctor = (form.querySelector('[name="doctor"]') || {}).value || "Dr. S. Vijay Ganapathy";
        var date = (dateInput || {}).value || "Flexible";
        var message = (form.querySelector('[name="message"]') || {}).value || "";

        var valid = true;
        var firstBad = null;

        if (nameErr) { nameErr.textContent = ""; nameErr.classList.remove("is-visible"); }
        if (phoneErr) { phoneErr.textContent = ""; phoneErr.classList.remove("is-visible"); }
        if (emailErr) { emailErr.textContent = ""; emailErr.classList.remove("is-visible"); }
        if (nameEl) nameEl.classList.remove("is-invalid");
        if (phoneGroup) phoneGroup.classList.remove("is-invalid");
        if (phoneEl) phoneEl.classList.remove("is-invalid");
        if (emailEl) emailEl.classList.remove("is-invalid");

        if (name.trim().length < 3) {
          valid = false;
          if (nameEl) { nameEl.classList.add("is-invalid"); firstBad = firstBad || nameEl; }
          if (nameErr) { nameErr.textContent = "Please enter patient full name (at least 3 characters)."; nameErr.classList.add("is-visible"); }
        }

        if (!/^\d{10}$/.test(phone.trim())) {
          valid = false;
          if (phoneGroup) phoneGroup.classList.add("is-invalid");
          if (phoneEl) { phoneEl.classList.add("is-invalid"); firstBad = firstBad || phoneEl; }
          if (phoneErr) { phoneErr.textContent = "Please enter an exact 10-digit mobile number after +91."; phoneErr.classList.add("is-visible"); }
        }

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
          valid = false;
          if (emailEl) { emailEl.classList.add("is-invalid"); firstBad = firstBad || emailEl; }
          if (emailErr) { emailErr.textContent = "Please enter a valid email address."; emailErr.classList.add("is-visible"); }
        }

        if (!valid) {
          if (status) {
            status.className = "vg-form-status is-visible is-error";
            status.textContent = "Please complete the required patient details above to confirm your slot.";
          }
          if (firstBad) firstBad.focus();
          return;
        }

        var text =
          "Appointment Request - Dr. VG Kidney Stone Clinic\n" +
          "Visit Type: " + visitType + "\n" +
          "Specialty: " + department + "\n" +
          "Doctor: " + doctor + "\n" +
          "Preferred Date: " + (date.trim() || "Flexible") + "\n" +
          "Time Slot: " + timeslot + "\n" +
          "Patient Name: " + name.trim() + "\n" +
          "Phone: +91 " + phone.trim() + "\n" +
          "Email: " + (email.trim() || "Not provided") + "\n" +
          "Notes: " + (message.trim() || "General Consultation");

        var waUrl = "https://wa.me/919444469194?text=" + encodeURIComponent(text);

        if (status) {
          status.className = "vg-form-status is-visible is-success";
          status.innerHTML =
            '<i class="fa fa-check-circle" aria-hidden="true"></i> Slot request prepared for <strong>' +
            visitType +
            " (" +
            timeslot +
            ")</strong>. Opening WhatsApp to confirm with Dr. VG Kidney Stone Clinic...";
        }
        window.open(waUrl, "_blank", "noopener,noreferrer");
      });
    });

    /* 11. Contact Page Validated Inquiry Form */
    var contactForm = document.getElementById("vg-contact-form");
    if (contactForm) {
      var nameInput = document.getElementById("cnt-name");
      var emailInput = document.getElementById("cnt-email");
      var phoneInput = document.getElementById("cnt-phone");
      var phoneGroup = document.getElementById("cnt-phone-group");
      var subjectInput = document.getElementById("cnt-subj");
      var messageInput = document.getElementById("cnt-msg");
      var statusBox = contactForm.querySelector(".vg-form-status");

      var validators = {
        name: function (val) {
          var v = val.trim();
          if (!v) return "Full name is required.";
          if (v.length < 3) return "Full name must be at least 3 characters.";
          return "";
        },
        email: function (val) {
          var v = val.trim();
          if (!v) return "Email address is required.";
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
            return "Please enter a valid email address.";
          }
          return "";
        },
        phone: function (val) {
          var v = val.trim();
          if (!v) return "Phone number is required.";
          if (!/^\d+$/.test(v)) return "Phone number must contain digits only (0–9).";
          if (v.length !== 10) return "Please enter an exact 10-digit mobile number after +91.";
          return "";
        },
        subject: function (val) {
          if (!val.trim()) return "Subject is required.";
          return "";
        },
        message: function (val) {
          var v = val.trim();
          if (!v) return "Message is required.";
          if (v.length < 10) return "Message must be at least 10 characters long.";
          return "";
        }
      };

      var fieldMap = [
        { key: "name", el: nameInput, wrap: nameInput, errEl: document.getElementById("cnt-name-err") },
        { key: "email", el: emailInput, wrap: emailInput, errEl: document.getElementById("cnt-email-err") },
        { key: "phone", el: phoneInput, wrap: phoneGroup || phoneInput, errEl: document.getElementById("cnt-phone-err") },
        { key: "subject", el: subjectInput, wrap: subjectInput, errEl: document.getElementById("cnt-subj-err") },
        { key: "message", el: messageInput, wrap: messageInput, errEl: document.getElementById("cnt-msg-err") }
      ];

      function validateOne(item) {
        if (!item.el) return true;
        var errorMsg = validators[item.key](item.el.value);
        if (errorMsg) {
          item.el.setAttribute("aria-invalid", "true");
          if (item.wrap) {
            item.wrap.classList.add("is-invalid");
            item.wrap.classList.remove("is-valid");
          }
          if (item.errEl) {
            item.errEl.textContent = errorMsg;
            item.errEl.classList.add("is-visible");
          }
          return false;
        } else {
          item.el.setAttribute("aria-invalid", "false");
          if (item.wrap) {
            item.wrap.classList.remove("is-invalid");
            item.wrap.classList.add("is-valid");
          }
          if (item.errEl) {
            item.errEl.textContent = "";
            item.errEl.classList.remove("is-visible");
          }
          return true;
        }
      }

      fieldMap.forEach(function (item) {
        if (!item.el) return;
        item.el.setAttribute("data-touched", "0");
        item.el.addEventListener("blur", function () {
          item.el.setAttribute("data-touched", "1");
          validateOne(item);
        });
        item.el.addEventListener("input", function () {
          if (item.el.getAttribute("data-touched") === "1" || (item.wrap && item.wrap.classList.contains("is-invalid"))) {
            validateOne(item);
          }
        });
      });

      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstInvalid = null;
        var allValid = true;

        fieldMap.forEach(function (item) {
          if (item.el) item.el.setAttribute("data-touched", "1");
          var ok = validateOne(item);
          if (!ok) {
            allValid = false;
            if (!firstInvalid && item.el) firstInvalid = item.el;
          }
        });

        if (!allValid) {
          if (statusBox) {
            statusBox.className = "vg-form-status is-visible is-error";
            statusBox.textContent = "Please correct the highlighted fields below before sending your message.";
          }
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var submittedName = nameInput.value.trim();
        var submittedPhone = "+91 " + phoneInput.value.trim();

        if (statusBox) {
          statusBox.className = "vg-form-status is-visible is-success";
          statusBox.innerHTML =
            '<i class="fa fa-check-circle" aria-hidden="true"></i> Thank you, <strong>' +
            submittedName.replace(/[<>&"]/g, "") +
            "</strong>! Your message has been received. Our clinic desk will contact you on <strong>" +
            submittedPhone +
            "</strong> or your email shortly.";
        }

        contactForm.reset();
        fieldMap.forEach(function (item) {
          if (item.el) {
            item.el.setAttribute("data-touched", "0");
            item.el.setAttribute("aria-invalid", "false");
          }
          if (item.wrap) {
            item.wrap.classList.remove("is-valid", "is-invalid");
          }
          if (item.errEl) {
            item.errEl.textContent = "";
            item.errEl.classList.remove("is-visible");
          }
        });
      });
    }

    /* 12. Footer EmailJS Newsletter Form (Preserves existing service/template IDs) */
    var newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("newsletter-status");
        if (typeof emailjs !== "undefined") {
          emailjs.init("srgTZHet4xIuVbBkV");
          emailjs
            .sendForm("service_s8sxhpp", "template_lofsjcf", newsletterForm)
            .then(function () {
              if (status) {
                status.className = "vg-form-status is-visible is-success";
                status.textContent = "Thank you! Your newsletter subscription has been sent.";
              }
              newsletterForm.reset();
            })
            .catch(function () {
              if (status) {
                status.className = "vg-form-status is-visible is-error";
                status.textContent = "Could not send right now. Please try again or call 9444469179.";
              }
            });
        } else if (status) {
          status.className = "vg-form-status is-visible is-success";
          status.textContent = "Thank you for subscribing to clinic updates.";
          newsletterForm.reset();
        }
      });
    }

    /* 13. Footer Dynamic Copyright Year */
    var yearEl = document.getElementById("vg-current-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  });
})();
