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

    /* 2. Sticky Header shadow & Back-to-top button */
    var siteHeader = document.querySelector(".vg-header");
    var scrollTopBtn = document.querySelector(".vg-scroll-top");

    function handleScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", y > 24);
      }
      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle("is-visible", y > 420);
      }
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

    /* 10. Unified Appointment WhatsApp Booking Forms */
    document.querySelectorAll(".vg-appointment-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector(".vg-form-status");
        var name = (form.querySelector('[name="name"]') || {}).value || "";
        var email = (form.querySelector('[name="email"]') || {}).value || "";
        var phone = (form.querySelector('[name="phone"]') || {}).value || "";
        var department = (form.querySelector('[name="department"]') || {}).value || "Urology";
        var doctor = (form.querySelector('[name="doctor"]') || {}).value || "Dr. Vijay Ganapathy";
        var date = (form.querySelector('[name="date"]') || {}).value || "";
        var message = (form.querySelector('[name="message"]') || {}).value || "";

        if (!name.trim() || !phone.trim()) {
          if (status) {
            status.className = "vg-form-status is-visible is-error";
            status.textContent = "Please enter your full name and contact phone number.";
          }
          return;
        }

        var text =
          "Appointment Request - Dr. VG Kidney Stone Clinic\n" +
          "Name: " + name.trim() + "\n" +
          "Email: " + (email.trim() || "Not provided") + "\n" +
          "Phone: " + phone.trim() + "\n" +
          "Department: " + department + "\n" +
          "Doctor: " + doctor + "\n" +
          "Preferred Date: " + (date.trim() || "Flexible") + "\n" +
          "Notes: " + (message.trim() || "General Consultation");

        var waUrl = "https://wa.me/919444469194?text=" + encodeURIComponent(text);

        if (status) {
          status.className = "vg-form-status is-visible is-success";
          status.textContent = "Opening WhatsApp to confirm your appointment with Dr. VG Kidney Stone Clinic...";
        }
        window.open(waUrl, "_blank", "noopener,noreferrer");
      });
    });

    /* 11. Contact Page WhatsApp Form */
    var contactForm = document.getElementById("vg-contact-form");
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = contactForm.querySelector(".vg-form-status");
        var name = contactForm.querySelector('[name="name"]').value.trim();
        var email = contactForm.querySelector('[name="email"]').value.trim();
        var phone = contactForm.querySelector('[name="phone"]').value.trim();
        var subject = contactForm.querySelector('[name="subject"]').value.trim();
        var message = contactForm.querySelector('[name="message"]').value.trim();
        var newsletterOpt = contactForm.querySelector('[name="newsletter"]');
        var newsletter = newsletterOpt && newsletterOpt.checked ? "Yes" : "No";

        var text =
          "New Contact Inquiry - Dr. VG Kidney Stone Clinic\n" +
          "Name: " + name + "\n" +
          "Email: " + email + "\n" +
          "Phone: " + phone + "\n" +
          "Subject: " + subject + "\n" +
          "Message: " + message + "\n" +
          "Newsletter Subscription: " + newsletter;

        var waUrl = "https://wa.me/919444469179?text=" + encodeURIComponent(text);
        if (status) {
          status.className = "vg-form-status is-visible is-success";
          status.textContent = "Redirecting to WhatsApp clinic support desk...";
        }
        window.open(waUrl, "_blank", "noopener,noreferrer");
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
