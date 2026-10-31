// the tuff 19 wallpapers, with captions and download links.
const works = [
  ["Lake_Como_Estate.png", "A view of Lake Como"],
  ["Monaco_Ferrari.png", "A day in Monaco"],
  ["Porsche_Golf.png", "The long way around"],
  ["Porsche_White.png", "Clean Aesthetic White Porsche"],
  ["Gold-Watch-Fuck-9-5.png", "On your own time"],
  ["Who-Cares-Watch-Collage.png", "Already late"],
  ["Child with a cobalt spoon.png", "No risk, no story"],
  ["I need vitamin Cash.png", "Vitamin cash"],
  ["Nadal’s Fist with Yellow Tennis Ball.png", "For the love of the game"],
  ["Painted Hand and Pixel Cursor.png", "The touch"],
  ["The world is yours.png", "The world is yours"],
  ["Red-Supercar.png", "Drake in a music video"],
  ["Scarlet Psycho Portrait with Headphones.png", "Psycho"],
  ["Super Rich Kids in Orange Impasto.png", "Super rich kids"],
  ["Courtside-Handshake.png", "Courtside"],
  ["Impasto Jet Over a Cyan Sky.png", "Move on"],
  ["Impasto matcha in a monogram duffel.png", "Matcha to go"],
  ["Impasto Porsche with Lion Cubs.png", "Porsche and the cubs"],
  ["Impasto tennis on terracotta clay.png", "On the clay"]
];

const path = n => "assets/" + encodeURIComponent(n);
const collection = document.querySelector("#collection");

// Create the gallery from the list above.

works.forEach(([file, title], i) => {
  let b = document.createElement("button");

  b.className = "art";

  b.setAttribute(
    "aria-label",
    `Open ${title} and read your birthday letter`
  );

  b.innerHTML = `
    <span class="frame">
      <img loading="lazy" src="${path(file)}" alt="${title}">
    </span>
    <span class="caption">
      <strong>${title}</strong>
      <span class="caps">${String(i + 1).padStart(2, "0")} / 19</span>
    </span>
  `;

  b.onclick = () => openLetter(file);
  collection.append(b);
});

const gate = document.querySelector("#gate");
const gallery = document.querySelector("#gallery");
const no = document.querySelector("#no");
const yes = document.querySelector("#yes");
const actions = document.querySelector("#actions");
const hint = document.querySelector("#hint");

// Evade the No button when the user tries to click it.

let attempts = 0;

function evade() {
  attempts++;

  const w = actions.clientWidth;
  const h = actions.clientHeight;

  let x, y;

  if (attempts < 12) {
    x = Math.random() * (w - 115);
    y = Math.random() * (h - 56);
  } else {
    x = Math.min(w - 115, w * .53 + Math.random() * 25);
    y = 15 + Math.random() * 50;
  }

  no.style.left = x + "px";
  no.style.top = y + "px";

  hint.textContent =
    attempts > 11
      ? "You know what to do."
      : attempts > 5
        ? "Still trying?"
        : "Not so fast.";
}

no.addEventListener("pointerenter", e => {
  if (e.pointerType === "mouse") evade();
});

no.addEventListener("click", evade);

// Open the gallery when Yes is selected.

yes.onclick = () => {
  gate.classList.add("hidden");
  gallery.classList.remove("hidden");
  window.scrollTo(0, 0);
};

const overlay = document.querySelector("#overlay");
const backdrop = document.querySelector("#backdrop");
const download = document.querySelector("#download");

let previous;

// Open the letter over the selected wallpaper.

function openLetter(file) {
  previous = document.activeElement;

  backdrop.style.backgroundImage = `url("${path(file)}")`;

  download.href = path(file);
  download.download = file;

  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  document.querySelector("#close").focus();
}

function closeLetter() {
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
  previous?.focus();
}

document.querySelector("#close").onclick = closeLetter;
document.querySelector("#back").onclick = closeLetter;

overlay.addEventListener("click", e => {
  if (e.target === overlay || e.target === backdrop) {
    closeLetter();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !overlay.classList.contains("hidden")) {
    closeLetter();
  }
});

// Custom cursor.

const cursor = document.querySelector(".cursor");

window.addEventListener("pointermove", e => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// Optional ambient audio generated in the browser.

let ctx;
let timer;
let playing = false;

const sound = document.querySelector("#sound");

function note(freq, at) {
  let osc = ctx.createOscillator();
  let gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(.0001, at);
  gain.gain.exponentialRampToValueAtTime(.035, at + .2);
  gain.gain.exponentialRampToValueAtTime(.0001, at + 3.3);

  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 3.4);
}

function chord() {
  if (!playing) return;

  const sets = [
    [130.81, 164.81, 196, 246.94],
    [110, 130.81, 164.81, 220],
    [87.31, 130.81, 174.61, 220],
    [98, 146.83, 196, 246.94]
  ];

  let s = sets[Math.floor(Date.now() / 4000) % sets.length];

  s.forEach((n, i) => {
    note(n, ctx.currentTime + i * .18);
  });
}

sound.onclick = async () => {
  playing = !playing;

  if (playing) {
    ctx ??= new (
      window.AudioContext || window.webkitAudioContext
    )();

    await ctx.resume();
    chord();
    timer = setInterval(chord, 4000);
  } else {
    clearInterval(timer);
    ctx?.suspend();
  }

  sound.textContent = playing ? "Sound on" : "Sound off";
  sound.setAttribute("aria-pressed", String(playing));
};

// Reveal gallery images as they enter the screen.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const cards = [...document.querySelectorAll(".art")];

if (!reduceMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }),
    { threshold: .08 }
  );

  cards.forEach(card => {
    card.classList.add("reveal");
    observer.observe(card);
  });
}

// Perspective tilt and magnetic Yes button for mouse users.

if (
  matchMedia("(hover:hover) and (pointer:fine)").matches &&
  !reduceMotion.matches
) {
  cards.forEach(card => {
    const frame = card.querySelector(".frame");

    card.addEventListener("pointermove", e => {
      const r = frame.getBoundingClientRect();

      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;

      frame.style.setProperty("--ry", `${x * 7}deg`);
      frame.style.setProperty("--rx", `${-y * 7}deg`);
    });

    card.addEventListener("pointerleave", () => {
      frame.style.setProperty("--ry", "0deg");
      frame.style.setProperty("--rx", "0deg");
    });
  });

  yes.addEventListener("pointermove", e => {
    const r = yes.getBoundingClientRect();

    yes.style.transform = `translate(
      ${(e.clientX - r.left - r.width / 2) * .12}px,
      ${(e.clientY - r.top - r.height / 2) * .12}px
    )`;
  });

  yes.addEventListener("pointerleave", () => {
    yes.style.transform = "";
  });
}

// Scroll progress indicator.

const progress = document.querySelector("#progress");
let ticking = false;

addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      let total = document.documentElement.scrollHeight - innerHeight;

      progress.style.width =
        (total > 0 ? scrollY / total * 100 : 0) + "%";

      ticking = false;
    });

    ticking = true;
  }
}, { passive: true });

// Opening animation sequence.

(function () {
  const root = document.documentElement;

  if (!root.hasAttribute("data-entry")) return;

  let fired = false;

  function go() {
    if (fired || !root.hasAttribute("data-entry")) return;

    fired = true;

    requestAnimationFrame(() => {
      const tweens = [];

      const add = (selector, frames, duration, delay, step = 0) => {
        document.querySelectorAll(selector).forEach((el, i) => {
          if (getComputedStyle(el).display === "none") return;

          tweens.push(
            el.animate(frames, {
              duration,
              delay: delay + i * step,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "both"
            })
          );
        });
      };

      add(
        ".gate-art img",
        [{ opacity: 0, scale: 1.05 }, { opacity: .92, scale: 1 }],
        1250,
        40,
        90
      );

      add(
        ".gate-top,.gate-bottom",
        [{ opacity: 0, translate: "0 -8px" }, { opacity: 1, translate: "0 0" }],
        600,
        260,
        80
      );

      add(
        ".invite .eyebrow",
        [{ opacity: 0, translate: "0 10px" }, { opacity: 1, translate: "0 0" }],
        550,
        400
      );

      add(
        ".invite h1 span,.invite h1 em",
        [{ opacity: 0, translate: "0 45%" }, { opacity: 1, translate: "0 0" }],
        850,
        490,
        120
      );

      add(
        ".invite p:not(.hint)",
        [{ opacity: 0, translate: "0 14px" }, { opacity: 1, translate: "0 0" }],
        600,
        850
      );

      add(
        ".actions",
        [{ opacity: 0, translate: "0 14px" }, { opacity: 1, translate: "0 0" }],
        600,
        990
      );

      Promise.all(tweens.map(a => a.finished.catch(() => {})))
        .then(() => {
          clearTimeout(window.__entryGuard);
          root.setAttribute("data-entry", "done");

          tweens.forEach(a => a.cancel());

          requestAnimationFrame(() => {
            root.removeAttribute("data-entry");
          });
        });
    });
  }

  Promise.resolve(document.fonts ? document.fonts.ready : null)
    .then(go, go);

  setTimeout(go, 400);
})();

// Move the opening artwork subtly in response to the pointer.

(function () {
  let media;

  try {
    media = matchMedia(
      "(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)"
    );
  } catch (e) {
    return;
  }

  if (!media.matches) return;

  const art = document.querySelector(".gate-art");
  const gate = document.querySelector(".gate");

  let raf = 0;

  gate.addEventListener("pointermove", e => {
    if (raf) cancelAnimationFrame(raf);

    raf = requestAnimationFrame(() => {
      const x = e.clientX / innerWidth - .5;
      const y = e.clientY / innerHeight - .5;

      art.style.transform = `
        perspective(1400px)
        rotateY(${x * 3}deg)
        rotateX(${-y * 3}deg)
        translate(${x * 10}px, ${y * 10}px)
      `;
    });
  }, { passive: true });

  gate.addEventListener("pointerleave", () => {
    art.style.transform = "";
  });
})();