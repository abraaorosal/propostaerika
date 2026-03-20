const revealItems = document.querySelectorAll(".reveal");
const header = document.querySelector(".site-header");
const tiltCard = document.querySelector("[data-tilt-card]");
const actionButton = document.querySelector(".action-button");
const toast = document.querySelector("#toast");
const pdfModal = document.querySelector("#pdf-modal");
const pdfFrame = document.querySelector("[data-pdf-frame]");
const pdfOpenButtons = document.querySelectorAll("[data-open-pdf-modal]");
const pdfCloseButtons = document.querySelectorAll("[data-close-pdf-modal]");
const pdfClosePrimary = pdfModal?.querySelector(".modal-close");

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 360)}ms`;
    observer.observe(item);
  });
}

const syncHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("scrolled", window.scrollY > 16);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

if (tiltCard && window.matchMedia("(pointer: fine)").matches) {
  const resetTilt = () => {
    tiltCard.style.transform = "";
  };

  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    const rotateY = (relativeX - 0.5) * 8;
    const rotateX = (0.5 - relativeY) * 8;

    tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  tiltCard.addEventListener("pointerleave", resetTilt);
  tiltCard.addEventListener("pointerup", resetTilt);
}

let toastTimeoutId;

const showToast = (message) => {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
};

const fallbackCopyText = (text) => {
  const tempField = document.createElement("textarea");
  tempField.value = text;
  tempField.setAttribute("readonly", "");
  tempField.style.position = "fixed";
  tempField.style.opacity = "0";
  tempField.style.pointerEvents = "none";

  document.body.appendChild(tempField);
  tempField.select();
  tempField.setSelectionRange(0, tempField.value.length);

  const copied = document.execCommand("copy");
  document.body.removeChild(tempField);

  return copied;
};

if (actionButton) {
  actionButton.addEventListener("click", async () => {
    const message = actionButton.dataset.copy?.trim();

    if (!message) {
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      showToast("Mensagem copiada. Agora basta enviar a aprovação.");
    } catch (error) {
      const copied = fallbackCopyText(message);

      if (copied) {
        showToast("Mensagem copiada. Agora basta enviar a aprovação.");
        return;
      }

      showToast("Não foi possível copiar automaticamente. Selecione o texto manualmente.");
    }
  });
}

const openPdfModal = () => {
  if (!pdfModal || !pdfFrame) {
    return;
  }

  if (!pdfFrame.src) {
    const source = pdfFrame.dataset.src?.trim();

    if (source) {
      pdfFrame.src = source;
    }
  }

  pdfModal.classList.add("is-open");
  pdfModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-modal");
  pdfClosePrimary?.focus();
};

const closePdfModal = () => {
  if (!pdfModal) {
    return;
  }

  pdfModal.classList.remove("is-open");
  pdfModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-modal");
};

pdfOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openPdfModal();
  });
});

pdfCloseButtons.forEach((button) => {
  button.addEventListener("click", closePdfModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !pdfModal?.classList.contains("is-open")) {
    return;
  }

  closePdfModal();
});
