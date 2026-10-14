const COIN = () => h("span", { class: "coin" });
const Views = {
  home(D) {
    const C = D.characters.characters, B = D.businesses.businesses;
    const strip = h("div", { class: "strip" }, C.slice(0, 9).map((c) => h("a", { href: "#/characters" }, h("img", { src: c.image, alt: c.name }))));
    const sect = (ic, kicker, title, text, link, label, imgs) => h("section", { class: "feature" },
      h("div", { class: "ftext" }, h("div", { class: "kicker" }, icon(ic, "#e8b848", 20), kicker), h("h2", {}, title), h("p", {}, text),
        h("a", { class: "btn", href: link }, label + " →")),
      h("div", { class: "fimgs" }, imgs));
    return h("div", { class: "home" },
      h("section", { class: "hero" },
        h("div", { class: "hero-text" },
          h("div", { class: "kicker" }, "Interactive investor demo"),
          h("h1", {}, "Art you can play.", h("br"), h("span", { class: "gold" }, "A world you can own.")),
          h("p", { class: "lead" }, "Dogzy Family Universe is a city of hand-designed dog characters. Every job grows over five levels into a real business, and the tokens players earn in the game can be exported to the Avalanche blockchain."),
          h("div", { class: "cta" }, h("a", { class: "btn", href: "#/characters" }, "Meet the characters"), h("a", { class: "btn ghost", href: "#/wallet" }, "See the token export")),
          h("div", { class: "stats" },
            [[C.length, "job characters"], [B.length, "businesses"], ["5", "career levels each"], ["1", "token: DOGZY"]].map(([n, l]) => h("div", {}, h("strong", {}, String(n)), h("span", {}, l))))),
        h("div", { class: "hero-art zoom", onclick: () => lightbox(C[0].card, C[0].name) }, h("img", { src: C[0].card, alt: C[0].name }))),
      strip,
      h("section", { class: "concept" },
        h("h2", { class: "center" }, "One universe, three layers"),
        h("div", { class: "three" },
          [["palette", "Original art", "Every character, shop and scene comes from the artist Valkyrie's own visual universe: a recognizable IP, not stock assets."],
           ["game", "A career game", "Players pick a dog with a job, level it up from apprentice to owner, equip accessories and run their own business in Dogzy City."],
           ["chain", "Blockchain bridge", "In-game tokens stay off-chain while playing. When a player chooses, they export them as DOGZY tokens to their Avalanche wallet through a secured bridge contract."]]
            .map(([i, t, d]) => h("div", { class: "pillar" }, icon(i, "#e8b848", 34), h("h3", {}, t), h("p", {}, d))))),
      sect("chars", "Characters", C.length + " dogs, " + C.length + " careers", "From the golden retriever chef to the corgi sound tech, each character has five levels, its own accessories and its own environment.", "#/characters", "Browse characters",
        C.slice(1, 4).map((c) => h("img", { src: c.image, alt: c.name }))),
      sect("city", "City", B.length + " businesses to build", "Level 5 of every job is a business. The first player to complete it owns it; the next players can buy a franchise.", "#/city", "Explore the city",
        B.slice(11, 14).map((b) => h("img", { src: b.image, alt: b.name }))),
      sect("ward", "Wardrobe", "Accessories that show progress", "Hats, glasses, medals and tools are unlocked level by level and equipped on your character.", "#/wardrobe", "Try the wardrobe",
        D.accessories.accessories.slice(0, 3).map((a) => h("div", { class: "acc-tile" }, icon(a.icon, a.color, 56)))),
      sect("wallet", "Wallet", "Export to Avalanche", "A walkthrough of the real bridge flow: game debit, signed voucher, on-chain claim. In this demo nothing leaves your browser.", "#/wallet", "Open the wallet",
        [h("div", { class: "flow" }, ["Game tokens", "Signed voucher", "DOGZY on Avalanche"].map((t, i) => h("div", { class: "step" }, h("b", {}, String(i + 1)), t)))]));
  },

  characters(D) {
    const st = State.data;
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Characters"),
        h("p", { class: "muted" }, "Every dog has a job and five career levels. Click a portrait to see the full career card.")),
      h("div", { class: "grid chars" }, D.characters.characters.map((c) =>
        h("div", { class: "card" + (st.character === c.id ? " selected" : "") }, pic(c),
          h("div", { class: "body" },
            h("strong", {}, c.job),
            h("div", { class: "tags" }, h("span", { class: "tag" }, c.breed), c.level5 && h("span", { class: "tag gold" }, "Lv 5 · " + c.level5)),
            h("span", { class: "muted small" }, c.description),
            h("button", { class: st.character === c.id ? "ghost" : "", onclick: () => { st.character = c.id; State.save(); toast(c.job + " selected"); App.render(); } },
              st.character === c.id ? "Selected ✓" : "Play this character"))))));
  },

  city(D) {
    const st = State.data;
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Dogzy City"),
        h("p", { class: "muted" }, D.businesses.note)),
      h("div", { class: "grid city" }, D.businesses.businesses.map((b) => {
        const owned = b.items.filter((it) => st.inventory[it.id]).length;
        return h("div", { class: "card" }, pic(b),
          h("div", { class: "body" },
            h("div", { class: "kicker small" }, b.category),
            h("strong", {}, b.name),
            h("span", { class: "muted small" }, b.description),
            h("div", { class: "progress" }, h("i", { style: "width:" + owned * 20 + "%" })),
            h("div", { class: "small muted" }, "Upgrades " + owned + "/5 · unlocks " + b.unlocks),
            b.items.map((it) => h("div", { class: "item" },
              h("span", {}, it.name),
              st.inventory[it.id] ? h("span", { class: "gold small" }, "Built ✓") :
              h("button", { class: "mini", disabled: st.balance < it.price, onclick: () => {
                st.balance -= it.price; st.inventory[it.id] = 1; State.save(); toast(it.name + " built"); App.render();
              } }, String(it.price), COIN())))));
      })));
  },

  wardrobe(D) {
    const st = State.data, A = D.accessories, chars = D.characters.characters;
    const ch = chars.find((c) => c.id === st.character) || chars[0];
    const avatar = h("div", { class: "avatar" }, h("img", { class: "base", src: ch.image, alt: ch.job }));
    // Per-character anchors (fractions of the image) + size relative to the face (eye-to-neck distance).
    const an = ch.anchors || { eyes: [0.5, 0.3], headTop: 0.12, neck: 0.48, hand: [0.2, 0.75] };
    const img = avatar.querySelector(".base");
    const place = () => {
      const W = img.clientWidth, H = img.clientHeight; if (!W || !H) return;
      const u = (an.neck - an.eyes[1]) * H; // face unit in px
      const spec = { hat: [an.eyes[0], an.headTop + 0.12 * (an.neck - an.eyes[1]), 1.4, "-50%,-85%"],
        glasses: [an.eyes[0], an.eyes[1], 1.05, "-50%,-50%"], neck: [an.eyes[0], an.neck, 0.8, "-50%,-50%"],
        hand: [an.hand[0], an.hand[1], 0.85, "-50%,-50%"] };
      avatar.querySelectorAll(".slot").forEach((e) => { const sp = spec[e.dataset.slot]; const sz = Math.round(sp[2] * u);
        const svg = e.querySelector("svg"); if (svg) { svg.setAttribute("width", "100%"); svg.setAttribute("height", "100%"); }
        Object.assign(e.style, { display: "block", width: sz + "px", height: sz + "px", left: sp[0] * 100 + "%", top: sp[1] * 100 + "%", right: "auto", bottom: "auto", transform: "translate(" + sp[3] + ")" }); });
    };
    A.slots.forEach((s) => { const a = A.accessories.find((x) => x.id === st.equipped[s]); if (a) { const e = icon(a.icon, a.color, 64); e.classList.add("slot", s); e.dataset.slot = s; avatar.append(e); } });
    if (img.complete) requestAnimationFrame(place); img.addEventListener("load", place); window.addEventListener("resize", place);
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Wardrobe"), h("p", { class: "muted" }, "Equip accessories on your character. In the full game they unlock level by level.")),
      h("div", { class: "row" },
        h("div", { class: "card padded center" }, h("div", { class: "stage" }, avatar, h("div", { class: "platform" })), h("h3", {}, ch.breed + " · " + ch.job),
          h("button", { class: "ghost", onclick: () => { st.equipped = {}; State.save(); App.render(); } }, "Remove all"),
          h("p", { class: "small muted" }, h("a", { href: "#/characters" }, "Change character"))),
        h("div", {}, A.slots.map((s) => h("div", { class: "card padded", style: "margin-bottom:1rem" },
          h("div", { class: "kicker small" }, s),
          h("div", { class: "accs" }, A.accessories.filter((a) => a.slot === s).map((a) =>
            h("button", { class: "acc" + (st.equipped[s] === a.id ? " on" : ""), onclick: () => {
              if (st.equipped[s] === a.id) delete st.equipped[s]; else st.equipped[s] = a.id; State.save(); App.render();
            } }, icon(a.icon, a.color, 36), h("span", {}, a.name)))))))));
  },

  wallet(D) {
    const st = State.data;
    const items = D.businesses.businesses.flatMap((b) => b.items.map((i) => Object.assign({ biz: b.name }, i)));
    const owned = Object.keys(st.inventory);
    const log = h("div", { class: "log" }, "Ready. Enter an address and an amount.");
    const addr = h("input", { placeholder: "0x… your Avalanche C-Chain address", value: "0x8f3C9a1B2d4E5f60718293a4B5c6D7e8F9012345" });
    const amt = h("input", { type: "number", min: "1", step: "1", value: "50" });
    const quote = h("p", { class: "muted small" });
    const btn = h("button", {}, "Run export walkthrough");
    const upd = () => { quote.textContent = "You receive " + BridgeSim.quote(parseInt(amt.value, 10) || 0) + " DOGZY · rate 1:" + (BridgeSim.rate / BridgeSim.RATE_DENOMINATOR) + " · max " + BridgeSim.maxClaim + " per claim"; };
    amt.addEventListener("input", upd); upd();
    btn.addEventListener("click", async () => {
      const amount = Number(amt.value);
      const err = BridgeSim.validate(addr.value.trim(), amount, st.balance);
      if (err) { log.textContent = ""; log.append(h("span", { class: "err" }, err)); return; }
      btn.disabled = true; log.textContent = "";
      await BridgeSim.run(addr.value.trim(), amount, st, (line, cls) => log.append(h("div", { class: cls }, line)));
      btn.disabled = false; State.save(); const ib = document.getElementById("invbal"); if (ib) ib.textContent = st.balance;
    });
    return h("div", {}, h("div", { class: "pagehead" }, h("h1", {}, "Wallet"), h("p", { class: "muted" }, "Tokens are earned in the game, then exported to Avalanche when the player decides.")),
      h("div", { class: "flow wide" }, ["Earn tokens in game", "Game server signs a voucher", "Player claims DOGZY on Avalanche"].map((t, i) => h("div", { class: "step" }, h("b", {}, String(i + 1)), t))),
      h("div", { class: "row" },
        h("div", { class: "card padded" }, h("h2", {}, "Game inventory"),
          h("div", { class: "item big" }, h("span", {}, COIN(), " DOGZY game tokens"), h("strong", { id: "invbal" }, String(st.balance))),
          owned.length ? owned.map((id) => { const it = items.find((i) => i.id === id) || { name: id, biz: "" };
            return h("div", { class: "item" }, h("span", {}, it.name), h("span", { class: "muted small" }, it.biz)); })
            : h("p", { class: "muted" }, "No upgrades built yet. Visit the City."),
          h("button", { class: "ghost", onclick: () => { State.reset(); App.render(); } }, "Reset demo")),
        h("div", { class: "card padded" }, h("h2", {}, "Export to Avalanche"),
          h("label", {}, "Avalanche wallet address"), addr,
          h("label", {}, "In-game tokens to export"), amt, quote, btn, log)),
      st.exports.length ? h("div", { class: "card padded", style: "margin-top:1rem" }, h("h2", {}, "Export history"),
        st.exports.map((e) => h("div", { class: "item" }, h("span", {}, e.amount + " tokens → " + e.out + " DOGZY"), h("span", { class: "muted small" }, e.address.slice(0, 10) + "…")))) : null);
  },
};
