// Handle theme (dark / light) with persistence
(function () {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    body.setAttribute("data-theme", storedTheme);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    body.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }

  themeToggle?.addEventListener("click", () => {
    const current = body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  });
})();

// Mobile navigation toggle
(function () {
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");
  const navLinkItems = document.querySelectorAll(".nav__link");

  navToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("nav__links--open");
  });

  navLinkItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks?.classList.remove("nav__links--open");
    });
  });
})();

// Smooth scroll offset for sticky header (for browsers without CSS scroll-margin support)
(function () {
  const header = document.querySelector(".site-header");
  const navLinks = document.querySelectorAll('a[href^="#"]:not(.skip-link)');

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });

      // Update active link immediately after scroll starts
      setTimeout(() => {
        const id = href.slice(1);
        document.querySelectorAll(".nav__link").forEach((navLink) => {
          const navHref = navLink.getAttribute("href");
          if (navHref === href) {
            navLink.classList.add("nav__link--active");
          } else {
            navLink.classList.remove("nav__link--active");
          }
        });
      }, 100);
    });
  });
})();

// Scroll animations using IntersectionObserver
(function () {
  const animated = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window) || animated.length === 0) {
    animated.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  animated.forEach((el) => observer.observe(el));
})();

// Highlight active nav link on scroll
(function () {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + (window.innerHeight * 0.18);
    let currentId = "";
    let closestSection = null;
    let closestDistance = Infinity;

    // Find the section that's closest to the top of the viewport
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      
      // Check if section is in viewport
      if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.2) {
        const distance = Math.abs(rect.top);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      }
      
      // Fallback: check if scroll position is within section bounds
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        currentId = section.id;
      }
    });

    // Use closest section if found, otherwise use the scroll-based detection
    if (closestSection) {
      currentId = closestSection.id;
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const id = href.slice(1);
      if (id === currentId) {
        link.classList.add("nav__link--active");
      } else {
        link.classList.remove("nav__link--active");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", onScroll);
})();

// Contact form with EmailJS integration
(function () {
  const form = document.querySelector(".contact__form");
  if (!form) return;

  const successEl = document.getElementById("formSuccess");

  // Initialize EmailJS with your Public Key
  // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
  emailjs.init("fOaNMDE3bNnspfpbx");

  function setError(field, message) {
    const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearErrors() {
    form.querySelectorAll(".form__error").forEach((el) => {
      el.textContent = "";
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    if (successEl) successEl.textContent = "";

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");
    const submitBtn = form.querySelector('button[type="submit"]');

    let isValid = true;

    if (name && !name.value.trim()) {
      setError(name, "Please enter your name.");
      isValid = false;
    }

    if (email) {
      const value = email.value.trim();
      if (!value) {
        setError(email, "Please enter your email.");
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(email, "Please enter a valid email address.");
        isValid = false;
      }
    }

    if (message && !message.value.trim()) {
      setError(message, "Please enter a message.");
      isValid = false;
    }

    if (!isValid) return;

    // Disable submit button during sending
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
      await emailjs.send("service_3otac6n", "template_vw9qqio", {
        from_name: name.value.trim(),
        from_email: email.value.trim(),
        message: message.value.trim(),
        reply_to: email.value.trim(),  // Add this line - sets Reply-To header
        to_email: "manglaygilbert18@gmail.com"
      });

      form.reset();
      if (successEl) {
        successEl.textContent = "Thanks for reaching out! I'll get back to you soon.";
        successEl.style.color = "#22c55e";
      }
    } catch (error) {
      console.error("EmailJS Error:", error);
      if (successEl) {
        successEl.textContent = "Sorry, there was an error sending your message. Please try again or email me directly.";
        successEl.style.color = "#fca5a5";
      }
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
})();

// Dynamic year in footer
(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();